import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';
import { source } from '@/lib/source';
import { Document, type DocumentData } from 'flexsearch';
import type { ChatUIMessage, SearchConfidence, SearchResultItem, SearchTool, SearchToolOutput } from '@/lib/ai/types';

interface ChunkDocument extends DocumentData {
  id: string;
  url: string;
  title: string;
  description: string;
  section: string;
  snippet: string;
  content: string;
}
const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<ChunkDocument>({
    document: {
      id: 'id',
      index: ['title', 'description', 'section', 'content'],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!('getText' in page.data)) return null;

      const content = await page.data.getText('processed');
      return createChunks({
        title: page.data.title,
        description: page.data.description ?? '',
        url: page.url,
        content,
      });
    }),
  );

  for (const doc of docs) {
    for (const chunk of doc ?? []) {
      search.add(chunk);
    }
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = [
  'You are the official AI assistant for nexus-ui documentation.',
  'Prioritize correctness, concise guidance, and practical steps for users implementing nexus-ui.',
  'Always call the `search` tool when a user asks a product/documentation question.',
  'Ground answers in retrieved docs results only. Do not invent APIs, props, setup steps, or behavior.',
  'For installation/setup questions, prioritize the shadcn registry flow as the default path when present in docs, and mention `nexus-ui-cli` only as an alternative.',
  'When results include evidence, cite at least one source using markdown links with the result url.',
  'When confidence is low or none, explicitly say the answer is not clearly documented and propose a better search query.',
  'Preferred response format: direct answer, short implementation steps, then source links.',
].join('\n');

export async function POST(req: Request, ctx: RouteContext<"/api/chat">) {
  const reqJson = await req.json();

  const result = streamText({
    model: openrouter.chat(process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4'),
    stopWhen: stepCountIs(5),
    tools: {
      search: searchTool,
    },
    messages: [
      { role: 'system', content: systemPrompt },
      ...(await convertToModelMessages<ChatUIMessage>(reqJson.messages ?? [], {
        convertDataPart(part) {
          if (part.type === 'data-client')
            return {
              type: 'text',
              text: `[Client Context: ${JSON.stringify(part.data)}]`,
            };
        },
      })),
    ],
    toolChoice: 'auto',
  });

  return result.toUIMessageStreamResponse();
}

const searchTool = tool({
  description:
    'Search nexus-ui docs and return ranked chunks with confidence and source metadata.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(30).default(8),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    const installIntent = isInstallIntent(query);
    const variants = buildQueryVariants(query);
    const normalizedDocs = new Map<string, ChunkDocument>();

    for (const variant of variants) {
      const rawResults = await search.searchAsync(variant, {
        limit: Math.min(limit * 5, 80),
        merge: true,
        enrich: true,
      });
      const docs = normalizeRawSearchResults(rawResults);
      for (const doc of docs) {
        normalizedDocs.set(doc.id, doc);
      }
    }

    const ranked = rankSearchResults(query, [...normalizedDocs.values()]);
    const anchored = installIntent
      ? await applyInstallIntentAnchors(query, ranked)
      : ranked;
    const finalResults = anchored.slice(0, limit);
    const confidence = computeConfidence(finalResults);

    const output: SearchToolOutput = {
      query,
      confidence,
      resultCount: finalResults.length,
      querySuggestion: confidence === 'none' ? suggestQuery(query) : undefined,
      results: finalResults,
    };

    return output;
  },
}) satisfies SearchTool;

function createChunks(input: { title: string; description: string; url: string; content: string }): ChunkDocument[] {
  const sections = splitIntoSections(input.content);
  const chunks: ChunkDocument[] = [];
  let index = 0;

  for (const section of sections) {
    const pieces = chunkByLength(section.content, 700);
    for (const piece of pieces) {
      if (!piece.trim()) continue;
      index += 1;
      chunks.push({
        id: `${input.url}#${index}`,
        title: input.title,
        description: input.description,
        url: input.url,
        section: section.heading,
        snippet: normalizeWhitespace(piece).slice(0, 220),
        content: piece,
      });
    }
  }

  return chunks;
}

function splitIntoSections(content: string): Array<{ heading: string; content: string }> {
  const lines = content.split('\n');
  const sections: Array<{ heading: string; content: string }> = [];
  let heading = 'Overview';
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join('\n').trim();
    if (text) sections.push({ heading, content: text });
    buffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1,6}\s+/.test(trimmed)) {
      flush();
      heading = trimmed.replace(/^#{1,6}\s+/, '');
      continue;
    }
    buffer.push(line);
  }

  flush();
  return sections.length > 0 ? sections : [{ heading: 'Overview', content }];
}

function chunkByLength(text: string, maxChars: number): string[] {
  const blocks = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = '';

  for (const block of blocks) {
    const value = block.trim();
    if (!value) continue;

    if ((current ? `${current}\n\n${value}` : value).length <= maxChars) {
      current = current ? `${current}\n\n${value}` : value;
      continue;
    }

    if (current) chunks.push(current);
    if (value.length <= maxChars) {
      current = value;
    } else {
      chunks.push(...splitLongBlock(value, maxChars));
      current = '';
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function splitLongBlock(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) out.push(current);
    current = word;
  }
  if (current) out.push(current);
  return out;
}

function normalizeRawSearchResults(rawResults: unknown): ChunkDocument[] {
  const queue: unknown[] = [rawResults];
  const seen = new Set<string>();
  const out: ChunkDocument[] = [];

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current) continue;
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (typeof current !== 'object') continue;

    const record = current as Record<string, unknown>;
    const maybeDoc = record.doc;
    if (maybeDoc && typeof maybeDoc === 'object') {
      const d = maybeDoc as Record<string, unknown>;
      const id = typeof d.id === 'string' ? d.id : undefined;
      const url = typeof d.url === 'string' ? d.url : undefined;
      const title = typeof d.title === 'string' ? d.title : undefined;
      const content = typeof d.content === 'string' ? d.content : undefined;
      if (id && url && title && content && !seen.has(id)) {
        seen.add(id);
        out.push({
          id,
          url,
          title,
          description: typeof d.description === 'string' ? d.description : '',
          section: typeof d.section === 'string' ? d.section : 'Overview',
          snippet: typeof d.snippet === 'string' ? d.snippet : normalizeWhitespace(content).slice(0, 220),
          content,
        });
      }
    }

    if ('result' in record) queue.push(record.result);
  }

  return out;
}

function rankSearchResults(query: string, docs: ChunkDocument[]): SearchResultItem[] {
  const queryText = normalizeForMatching(query);
  const terms = tokenize(queryText);
  const boostedTerms = new Set([...terms, ...expandQueryTerms(terms)]);

  const scored = docs.map((doc) => {
    const title = normalizeForMatching(doc.title);
    const description = normalizeForMatching(doc.description);
    const section = normalizeForMatching(doc.section);
    const text = normalizeForMatching(`${doc.title} ${doc.description} ${doc.section} ${doc.content}`);
    let score = 0;

    for (const term of boostedTerms) {
      if (term.length < 2) continue;
      if (title.includes(term)) score += 6;
      if (section.includes(term)) score += 4;
      if (description.includes(term)) score += 3;
      if (text.includes(term)) score += 1;
    }

    if (text.includes(queryText)) score += 4;
    if (title.includes('installation') || section.includes('installation') || doc.url.includes('/installation')) {
      if (boostedTerms.has('install') || boostedTerms.has('installation') || boostedTerms.has('setup')) {
        score += 5;
      }
    }
    if (title.includes('getting started') || section.includes('getting started')) {
      if (boostedTerms.has('install') || boostedTerms.has('setup') || boostedTerms.has('getting started')) {
        score += 4;
      }
    }

    return {
      title: doc.title,
      url: doc.url,
      description: doc.description,
      section: doc.section,
      snippet: doc.snippet,
      score,
    } satisfies SearchResultItem;
  });

  const deduped = new Map<string, SearchResultItem>();
  for (const item of scored.sort((a, b) => b.score - a.score)) {
    const key = `${item.url}::${item.section}`;
    if (!deduped.has(key)) deduped.set(key, item);
  }

  const ranked = [...deduped.values()];
  const positive = ranked.filter((item) => item.score > 0);

  // Fall back to top-ranked documents instead of empty results for broad queries.
  return positive.length > 0 ? positive : ranked.slice(0, 6);
}

function computeConfidence(results: SearchResultItem[]): SearchConfidence {
  if (results.length === 0) return 'none';
  const top = results[0]?.score ?? 0;
  if (top >= 12) return 'high';
  if (top >= 7) return 'medium';
  return 'low';
}

function suggestQuery(query: string): string {
  const normalized = query.replace(/\s+/g, ' ').trim();
  if (!normalized) return 'nexus-ui installation';
  return `${extractCoreQuery(normalized)} installation getting started nexus-ui docs`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeForMatching(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(value: string): string[] {
  return value
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => !stopWords.has(term));
}

function extractCoreQuery(query: string): string {
  const tokens = tokenize(normalizeForMatching(query));
  return tokens.slice(0, 8).join(' ');
}

function buildQueryVariants(query: string): string[] {
  const core = extractCoreQuery(query);
  const terms = tokenize(normalizeForMatching(query));
  const expanded = [...new Set([...terms, ...expandQueryTerms(terms)])];
  const variants = new Set<string>([
    query,
    core,
    `${core} nexus-ui docs`,
    `${expanded.join(' ')} nexus-ui docs`,
  ]);

  if (expanded.some((t) => t === 'install' || t === 'installation' || t === 'setup')) {
    variants.add('nexus-ui installation');
    variants.add('nexus-ui getting started');
    variants.add('install nexus-ui next.js');
  }

  return [...variants].map((v) => v.trim()).filter(Boolean);
}

function expandQueryTerms(terms: string[]): string[] {
  const expanded = new Set<string>();
  for (const term of terms) {
    expanded.add(term);
    for (const synonym of termSynonyms[term] ?? []) expanded.add(synonym);
  }
  return [...expanded];
}

const stopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'do',
  'for',
  'how',
  'i',
  'in',
  'is',
  'it',
  'new',
  'of',
  'on',
  'the',
  'to',
  'using',
  'with',
]);

const termSynonyms: Record<string, string[]> = {
  install: ['installation', 'setup', 'getting', 'started'],
  installation: ['install', 'setup', 'getting', 'started'],
  setup: ['install', 'installation', 'configure'],
  next: ['nextjs', 'next-js'],
  nextjs: ['next', 'next-js'],
  docs: ['documentation', 'guide'],
};

function isInstallIntent(query: string): boolean {
  const normalized = normalizeForMatching(query);
  return ['install', 'installation', 'setup', 'set up', 'getting started', 'nextjs', 'next.js'].some((term) =>
    normalized.includes(term),
  );
}

async function applyInstallIntentAnchors(
  query: string,
  ranked: SearchResultItem[],
): Promise<SearchResultItem[]> {
  const byKey = new Map<string, SearchResultItem>();
  for (const item of ranked) {
    byKey.set(`${item.url}::${item.section ?? 'Overview'}`, item);
  }

  const pages = source.getPages();
  const anchorPages = pages.filter(
    (page) =>
      page.url.includes('/installation') ||
      page.url === '/docs' ||
      /installation|get started|introduction/i.test(page.data.title),
  );

  for (const page of anchorPages) {
    if (!('getText' in page.data)) continue;
    const text = await page.data.getText('processed');
    const sectionSnippet = firstRelevantSnippet(text, query);
    const score = page.url.includes('/installation') ? 30 : 20;
    const key = `${page.url}::Overview`;
    const existing = byKey.get(key);
    byKey.set(key, {
      title: page.data.title,
      url: page.url,
      description: page.data.description ?? '',
      section: 'Overview',
      snippet: sectionSnippet,
      score: Math.max(existing?.score ?? 0, score),
    });
  }

  return [...byKey.values()].sort((a, b) => b.score - a.score);
}

function firstRelevantSnippet(text: string, query: string): string {
  const normalizedQuery = normalizeForMatching(query);
  const blocks = text.split(/\n{2,}/).map((b) => normalizeWhitespace(b)).filter(Boolean);
  const hit = blocks.find((block) => normalizeForMatching(block).includes(normalizedQuery));
  if (hit) return hit.slice(0, 220);
  const shadcnHit = blocks.find((block) => normalizeForMatching(block).includes('shadcn'));
  if (shadcnHit) return shadcnHit.slice(0, 220);
  return blocks[0]?.slice(0, 220) ?? '';
}