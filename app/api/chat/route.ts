import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import { source } from "@/lib/source";
import { Document, type DocumentData } from "flexsearch";
import type {
  ChatUIMessage,
  SearchConfidence,
  SearchResultItem,
  SearchTool,
  SearchToolOutput,
} from "@/lib/ai/types";

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
      id: "id",
      index: ["title", "description", "section", "content"],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!("getText" in page.data)) return null;

      const content = await page.data.getText("processed");
      return createChunks({
        title: page.data.title,
        description: page.data.description ?? "",
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
  "You are the official AI assistant for Nexus UI documentation.",
  "Prioritize correctness, concise guidance, and practical steps for users implementing Nexus UI.",
  "For product/documentation questions, call the `search` tool before answering.",
  "Use `search` at most twice per user message. Refine the query on the second call only if the first results are insufficient.",
  "After search results are available, you must write a complete final answer for the user in markdown. Never end a turn with only tool calls or planning text.",
  "Keep internal planning out of the final answer. The final answer should include: direct answer, short implementation steps, and markdown source links.",
  "Ground answers in retrieved search results only. If resultCount > 0, never claim the docs lack an answer—synthesize from the returned titles, snippets, and urls.",
  "Do not invent install commands, package names, or APIs. Nexus UI components are added via shadcn (`npx shadcn@latest add @nexus-ui/<name>`), not `npm install nexus-ui` for individual components.",
  "Nexus UI component docs live at /docs/components/<name> (Reasoning, Prompt Input, Message, etc.). If results include that page, answer from it—especially props like `isStreaming`.",
  "If you call `search` more than once, every query must keep the component or topic name (e.g. `reasoning streaming`, never generic queries like `streaming support` alone).",
  "Nexus UI does not publish a separate Button component page. Button/Avatar/Textarea/etc. come from shadcn/ui under `@/components/ui/*` and appear in installation + component examples—cite those when relevant.",
  "For installation/setup questions, prioritize the shadcn registry flow when present in docs, and mention `Nexus UI-cli` only as an alternative.",
  "When confidence is low or none, say what was not found, list the closest docs you did retrieve, and propose a better search query.",
].join("\n");

export async function POST(req: Request, ctx: RouteContext<"/api/chat">) {
  const reqJson = await req.json();

  const result = streamText({
    model: openrouter.chat(process.env.OPENROUTER_MODEL ?? "openai/gpt-4o"),
    stopWhen: stepCountIs(8),
    tools: {
      search: searchTool,
    },
    messages: [
      { role: "system", content: systemPrompt },
      ...(await convertToModelMessages<ChatUIMessage>(reqJson.messages ?? [], {
        convertDataPart(part) {
          if (part.type === "data-client")
            return {
              type: "text",
              text: `[Client Context: ${JSON.stringify(part.data)}]`,
            };
        },
      })),
    ],
    toolChoice: "auto",
  });

  return result.toUIMessageStreamResponse();
}

const searchTool = tool({
  description:
    "Search nexus-ui docs. For component questions, include the component name in the query (e.g. `reasoning isStreaming`, `prompt-input actions`). Keep the component name in every search if you call this tool twice.",
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(30).default(8),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    const installIntent = isInstallIntent(query);
    const shadcnPrimitiveIntent = isShadcnPrimitiveIntent(query);
    const componentSlug = matchNexusComponentSlug(query);
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
    let anchored = ranked;
    if (installIntent) {
      anchored = await applyInstallIntentAnchors(query, anchored);
    }
    if (shadcnPrimitiveIntent) {
      anchored = await applyShadcnPrimitiveAnchors(query, anchored);
    }
    if (componentSlug) {
      anchored = await applyNexusComponentPageAnchors(
        componentSlug,
        query,
        anchored,
      );
    }
    const finalResults = anchored.slice(0, limit);
    const confidence = computeConfidence(finalResults);

    const output: SearchToolOutput = {
      query,
      confidence,
      resultCount: finalResults.length,
      querySuggestion: confidence === "none" ? suggestQuery(query) : undefined,
      results: finalResults,
    };

    return output;
  },
}) satisfies SearchTool;

function createChunks(input: {
  title: string;
  description: string;
  url: string;
  content: string;
}): ChunkDocument[] {
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

function splitIntoSections(
  content: string,
): Array<{ heading: string; content: string }> {
  const lines = content.split("\n");
  const sections: Array<{ heading: string; content: string }> = [];
  let heading = "Overview";
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) sections.push({ heading, content: text });
    buffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1,6}\s+/.test(trimmed)) {
      flush();
      heading = trimmed.replace(/^#{1,6}\s+/, "");
      continue;
    }
    buffer.push(line);
  }

  flush();
  return sections.length > 0 ? sections : [{ heading: "Overview", content }];
}

function chunkByLength(text: string, maxChars: number): string[] {
  const blocks = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

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
      current = "";
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function splitLongBlock(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = "";
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
    if (typeof current !== "object") continue;

    const record = current as Record<string, unknown>;
    const maybeDoc = record.doc;
    if (maybeDoc && typeof maybeDoc === "object") {
      const d = maybeDoc as Record<string, unknown>;
      const id = typeof d.id === "string" ? d.id : undefined;
      const url = typeof d.url === "string" ? d.url : undefined;
      const title = typeof d.title === "string" ? d.title : undefined;
      const content = typeof d.content === "string" ? d.content : undefined;
      if (id && url && title && content && !seen.has(id)) {
        seen.add(id);
        out.push({
          id,
          url,
          title,
          description: typeof d.description === "string" ? d.description : "",
          section: typeof d.section === "string" ? d.section : "Overview",
          snippet:
            typeof d.snippet === "string"
              ? d.snippet
              : normalizeWhitespace(content).slice(0, 220),
          content,
        });
      }
    }

    if ("result" in record) queue.push(record.result);
  }

  return out;
}

const NEXUS_DOC_COMPONENTS = [
  { slug: "reasoning", aliases: ["reasoning"] },
  { slug: "prompt-input", aliases: ["prompt input", "prompt-input"] },
  { slug: "message", aliases: ["message"] },
  { slug: "thread", aliases: ["thread"] },
  { slug: "suggestions", aliases: ["suggestions", "suggestion"] },
  { slug: "chain-of-thought", aliases: ["chain of thought", "chain-of-thought"] },
  { slug: "citation", aliases: ["citation", "citations"] },
  { slug: "attachments", aliases: ["attachments", "attachment"] },
  { slug: "model-selector", aliases: ["model selector", "model-selector"] },
  { slug: "toaster", aliases: ["toaster", "toast"] },
  { slug: "feedback-bar", aliases: ["feedback bar", "feedback-bar"] },
  { slug: "image", aliases: ["image"] },
  { slug: "text-shimmer", aliases: ["text shimmer", "text-shimmer"] },
  { slug: "tool", aliases: ["tool"] },
] as const;

function matchNexusComponentSlug(query: string): string | null {
  const normalized = normalizeForMatching(query);
  for (const component of NEXUS_DOC_COMPONENTS) {
    if (
      component.aliases.some((alias) => {
        const normalizedAlias = normalizeForMatching(alias);
        return (
          normalized.includes(normalizedAlias) ||
          normalized.includes(component.slug.replace(/-/g, " "))
        );
      })
    ) {
      return component.slug;
    }
  }
  return null;
}

function rankSearchResults(
  query: string,
  docs: ChunkDocument[],
): SearchResultItem[] {
  const queryText = normalizeForMatching(query);
  const terms = tokenize(queryText);
  const boostedTerms = new Set([...terms, ...expandQueryTerms(terms)]);
  const componentSlug = matchNexusComponentSlug(query);

  const scored = docs.map((doc) => {
    const title = normalizeForMatching(doc.title);
    const description = normalizeForMatching(doc.description);
    const section = normalizeForMatching(doc.section);
    const text = normalizeForMatching(
      `${doc.title} ${doc.description} ${doc.section} ${doc.content}`,
    );
    let score = 0;

    for (const term of boostedTerms) {
      if (term.length < 2) continue;
      if (title.includes(term)) score += 6;
      if (section.includes(term)) score += 4;
      if (description.includes(term)) score += 3;
      if (text.includes(term)) score += 1;
    }

    if (text.includes(queryText)) score += 4;
    if (
      title.includes("installation") ||
      section.includes("installation") ||
      doc.url.includes("/installation")
    ) {
      if (
        boostedTerms.has("install") ||
        boostedTerms.has("installation") ||
        boostedTerms.has("setup")
      ) {
        score += 5;
      }
    }
    if (
      title.includes("getting started") ||
      section.includes("getting started")
    ) {
      if (
        boostedTerms.has("install") ||
        boostedTerms.has("setup") ||
        boostedTerms.has("getting started")
      ) {
        score += 4;
      }
    }
    if (boostedTerms.has("button") || queryText.includes("button")) {
      if (
        doc.url.includes("/installation") ||
        text.includes("components/ui/button")
      ) {
        score += 8;
      }
      if (
        text.includes("@/components/ui/button") ||
        text.includes("shadcn@latest add button")
      ) {
        score += 6;
      }
    }
    if (componentSlug && doc.url.includes(`/components/${componentSlug}`)) {
      score += 22;
      if (titleMatchesComponent(doc.title, componentSlug)) score += 8;
      if (text.includes("istreaming") || text.includes("streaming")) score += 6;
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
  if (results.length === 0) return "none";
  const top = results[0]?.score ?? 0;
  if (top >= 12) return "high";
  if (top >= 7) return "medium";
  return "low";
}

function suggestQuery(query: string): string {
  const normalized = query.replace(/\s+/g, " ").trim();
  if (!normalized) return "Nexus UI installation";
  return `${extractCoreQuery(normalized)} installation getting started Nexus UI docs`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForMatching(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  return tokens.slice(0, 8).join(" ");
}

function buildQueryVariants(query: string): string[] {
  const normalized = normalizeForMatching(query);
  const core = extractCoreQuery(query);
  const terms = tokenize(normalized);
  const expanded = [...new Set([...terms, ...expandQueryTerms(terms)])];
  const variants = new Set<string>([
    query,
    core,
    `${core} Nexus UI docs`,
    `${expanded.join(" ")} Nexus UI docs`,
  ]);

  if (
    expanded.some(
      (t) => t === "install" || t === "installation" || t === "setup",
    )
  ) {
    variants.add("Nexus UI installation");
    variants.add("Nexus UI getting started");
    variants.add("install Nexus UI next.js");
  }

  if (expanded.includes("button") || normalized.includes("button")) {
    variants.add("Nexus UI installation button shadcn");
    variants.add("components/ui/button shadcn");
    variants.add("prompt-input Button example");
  }

  const componentSlug = matchNexusComponentSlug(query);
  if (componentSlug) {
    const label = componentSlug.replace(/-/g, " ");
    variants.add(`nexus-ui ${componentSlug} component`);
    variants.add(`${label} isStreaming`);
    variants.add(`@nexus-ui/${componentSlug}`);
  }

  return [...variants].map((v) => v.trim()).filter(Boolean);
}

function titleMatchesComponent(title: string, slug: string): boolean {
  const normalizedTitle = normalizeForMatching(title);
  const normalizedSlug = slug.replace(/-/g, " ");
  return (
    normalizedTitle === normalizedSlug ||
    normalizedTitle.includes(normalizedSlug)
  );
}

function isShadcnPrimitiveIntent(query: string): boolean {
  const normalized = normalizeForMatching(query);
  return ["button", "avatar", "textarea", "tooltip", "kbd", "badge"].some(
    (term) => normalized.includes(term),
  );
}

async function applyNexusComponentPageAnchors(
  slug: string,
  query: string,
  ranked: SearchResultItem[],
): Promise<SearchResultItem[]> {
  const byKey = new Map<string, SearchResultItem>();
  for (const item of ranked) {
    byKey.set(`${item.url}::${item.section ?? "Overview"}`, item);
  }

  const page = source
    .getPages()
    .find((entry) => entry.url.includes(`/components/${slug}`));
  if (!page || !("getText" in page.data)) {
    return ranked;
  }

  const text = await page.data.getText("processed");
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => normalizeWhitespace(block))
    .filter(Boolean);
  const streamingBlock = blocks.find((block) =>
    /isstreaming|streaming-aware|streaming/i.test(block),
  );
  const snippet = (
    streamingBlock ??
    blocks.find((block) => normalizeForMatching(block).includes(slug.replace(/-/g, " "))) ??
    blocks[0]
  )?.slice(0, 220);

  const key = `${page.url}::Overview`;
  const existing = byKey.get(key);
  byKey.set(key, {
    title: page.data.title,
    url: page.url,
    description: page.data.description ?? "",
    section: "Overview",
    snippet: snippet ?? page.data.description ?? "",
    score: Math.max(existing?.score ?? 0, 36),
  });

  return [...byKey.values()].sort((a, b) => b.score - a.score);
}

async function applyShadcnPrimitiveAnchors(
  query: string,
  ranked: SearchResultItem[],
): Promise<SearchResultItem[]> {
  const byKey = new Map<string, SearchResultItem>();
  for (const item of ranked) {
    byKey.set(`${item.url}::${item.section ?? "Overview"}`, item);
  }

  const installPage = source
    .getPages()
    .find((page) => page.url.includes("/installation"));
  if (installPage && "getText" in installPage.data) {
    const text = await installPage.data.getText("processed");
    const snippet = firstRelevantSnippet(text, query);
    const key = `${installPage.url}::Overview`;
    const existing = byKey.get(key);
    byKey.set(key, {
      title: installPage.data.title,
      url: installPage.url,
      description: installPage.data.description ?? "",
      section: "Project structure & usage",
      snippet,
      score: Math.max(existing?.score ?? 0, 28),
    });
  }

  return [...byKey.values()].sort((a, b) => b.score - a.score);
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
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "do",
  "for",
  "how",
  "i",
  "in",
  "is",
  "it",
  "new",
  "of",
  "on",
  "the",
  "to",
  "using",
  "with",
]);

const termSynonyms: Record<string, string[]> = {
  install: ["installation", "setup", "getting", "started"],
  installation: ["install", "setup", "getting", "started"],
  setup: ["install", "installation", "configure"],
  next: ["nextjs", "next-js"],
  nextjs: ["next", "next-js"],
  docs: ["documentation", "guide"],
  button: ["buttons", "shadcn", "ui"],
  example: ["examples", "usage", "demo"],
  simple: ["basic", "minimal"],
  component: ["components", "primitive", "primitives"],
  reasoning: ["thinking", "trace", "istreaming"],
  streaming: ["istreaming", "stream"],
  support: ["supports", "enabled"],
};

function isInstallIntent(query: string): boolean {
  const normalized = normalizeForMatching(query);
  return [
    "install",
    "installation",
    "setup",
    "set up",
    "getting started",
    "nextjs",
    "next.js",
  ].some((term) => normalized.includes(term));
}

async function applyInstallIntentAnchors(
  query: string,
  ranked: SearchResultItem[],
): Promise<SearchResultItem[]> {
  const byKey = new Map<string, SearchResultItem>();
  for (const item of ranked) {
    byKey.set(`${item.url}::${item.section ?? "Overview"}`, item);
  }

  const pages = source.getPages();
  const anchorPages = pages.filter(
    (page) =>
      page.url.includes("/installation") ||
      page.url === "/docs" ||
      /installation|get started|introduction/i.test(page.data.title),
  );

  for (const page of anchorPages) {
    if (!("getText" in page.data)) continue;
    const text = await page.data.getText("processed");
    const sectionSnippet = firstRelevantSnippet(text, query);
    const score = page.url.includes("/installation") ? 30 : 20;
    const key = `${page.url}::Overview`;
    const existing = byKey.get(key);
    byKey.set(key, {
      title: page.data.title,
      url: page.url,
      description: page.data.description ?? "",
      section: "Overview",
      snippet: sectionSnippet,
      score: Math.max(existing?.score ?? 0, score),
    });
  }

  return [...byKey.values()].sort((a, b) => b.score - a.score);
}

function firstRelevantSnippet(text: string, query: string): string {
  const normalizedQuery = normalizeForMatching(query);
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => normalizeWhitespace(b))
    .filter(Boolean);
  const hit = blocks.find((block) =>
    normalizeForMatching(block).includes(normalizedQuery),
  );
  if (hit) return hit.slice(0, 220);
  const shadcnHit = blocks.find((block) =>
    normalizeForMatching(block).includes("shadcn"),
  );
  if (shadcnHit) return shadcnHit.slice(0, 220);
  return blocks[0]?.slice(0, 220) ?? "";
}
