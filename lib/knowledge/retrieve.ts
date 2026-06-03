import { Document, type DocumentData } from "flexsearch";
import { SITE_URL } from "@/lib/site";
import type {
  SearchConfidence,
  SearchResultItem,
  SearchToolOutput,
} from "@/lib/ai/types";
import { buildKnowledgeCorpus } from "@/lib/knowledge/corpus";
import { KNOWLEDGE_CONTEXT } from "@/lib/knowledge/config";
import { matchComponentSlug } from "@/lib/knowledge/components";
import {
  buildQueryVariants,
  expandQueryTerms,
  normalizeForMatching,
  tokenize,
} from "@/lib/knowledge/text";
import type {
  KnowledgeChunk,
  RetrieveOptions,
  RetrieveResult,
} from "@/lib/knowledge/types";
import { retrieveCompletePayload } from "@/lib/ask-ai/debug";

type IndexedChunk = KnowledgeChunk & DocumentData;

type KnowledgeIndex = {
  index: Document<IndexedChunk>;
  corpus: KnowledgeChunk[];
  corpusById: Map<string, IndexedChunk>;
};

let pendingIndexStats: {
  corpusSize: number;
  durationMs: number;
  byKind: Record<string, number>;
} | null = null;

const knowledgeIndex = createKnowledgeIndex();

async function createKnowledgeIndex(): Promise<KnowledgeIndex> {
  const started = Date.now();
  const corpus = await buildKnowledgeCorpus();
  const byKind = corpus.reduce<Record<string, number>>((acc, chunk) => {
    acc[chunk.kind] = (acc[chunk.kind] ?? 0) + 1;
    return acc;
  }, {});
  pendingIndexStats = {
    corpusSize: corpus.length,
    durationMs: Date.now() - started,
    byKind,
  };

  const index = new Document<IndexedChunk>({
    preset: "score",
    tokenize: "forward",
    document: {
      id: "id",
      index: [
        { field: "title", tokenize: "forward" },
        { field: "description", tokenize: "forward" },
        { field: "section", tokenize: "forward" },
        { field: "content", tokenize: "forward", resolution: 9 },
      ],
      store: true,
    },
  });

  const corpusById = new Map<string, IndexedChunk>();
  for (const chunk of corpus) {
    const indexed = chunk as IndexedChunk;
    corpusById.set(chunk.id, indexed);
    index.add(indexed);
  }

  return { index, corpus, corpusById };
}

function isIndexedChunk(value: unknown): value is IndexedChunk {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.kind === "string";
}

function collectChunksFromSearch(
  rawResults: unknown,
  corpusById: Map<string, IndexedChunk>,
): IndexedChunk[] {
  const queue: unknown[] = [rawResults];
  const seen = new Set<string>();
  const out: IndexedChunk[] = [];

  const push = (chunk: IndexedChunk) => {
    if (!chunk.id || seen.has(chunk.id)) return;
    seen.add(chunk.id);
    out.push(chunk);
  };

  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined || current === null) continue;

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (typeof current === "string") {
      const chunk = corpusById.get(current);
      if (chunk) push(chunk);
      continue;
    }

    if (typeof current !== "object") continue;

    const record = current as Record<string, unknown>;

    if (isIndexedChunk(record)) {
      push(record);
      continue;
    }

    if (isIndexedChunk(record.doc)) {
      push(record.doc);
    }

    if (typeof record.id === "string" && !record.kind) {
      const chunk = corpusById.get(record.id);
      if (chunk) push(chunk);
    }

    for (const value of Object.values(record)) {
      queue.push(value);
    }
  }

  return out;
}

async function flexsearchCandidates(
  index: Document<IndexedChunk>,
  corpusById: Map<string, IndexedChunk>,
  variants: string[],
): Promise<Map<string, KnowledgeChunk>> {
  const found = new Map<string, KnowledgeChunk>();

  for (const variant of variants) {
    if (!variant) continue;
    const raw = await index.searchAsync(variant, {
      limit: KNOWLEDGE_CONTEXT.flexsearchVariantLimit,
      enrich: true,
    });
    for (const chunk of collectChunksFromSearch(raw, corpusById)) {
      found.set(chunk.id, chunk);
    }
  }

  return found;
}

function rankChunks(query: string, chunks: KnowledgeChunk[]): KnowledgeChunk[] {
  const queryText = normalizeForMatching(query);
  const terms = tokenize(queryText);
  const boostedTerms = new Set([...terms, ...expandQueryTerms(terms)]);
  const componentSlug = matchComponentSlug(query);

  const scored = chunks.map((chunk) => {
    const title = normalizeForMatching(chunk.title);
    const section = normalizeForMatching(chunk.section);
    const description = normalizeForMatching(chunk.description);
    const text = normalizeForMatching(
      `${chunk.title} ${chunk.description} ${chunk.section} ${chunk.content}`,
    );
    let score = 0;

    for (const term of boostedTerms) {
      if (term.length < 2) continue;
      if (title.includes(term)) score += 6;
      if (section.includes(term)) score += 4;
      if (description.includes(term)) score += 3;
      if (text.includes(term)) score += 1;
    }

    if (text.includes(queryText)) score += 5;

    if (chunk.kind === "doc") score += 8;
    if (chunk.kind === "facts") score += 12;
    if (chunk.kind === "skill") score += 3;
    if (chunk.kind === "source") score -= 6;

    if (componentSlug && chunk.componentSlug === componentSlug) score += 18;
    if (componentSlug && chunk.url.includes(`/components/${componentSlug}`)) {
      score += 14;
    }

    return { chunk, score };
  });

  const deduped = new Map<string, { chunk: KnowledgeChunk; score: number }>();
  for (const item of scored.sort((a, b) => b.score - a.score)) {
    if (!deduped.has(item.chunk.id)) deduped.set(item.chunk.id, item);
  }

  const ranked = [...deduped.values()];
  const positive = ranked.filter((item) => item.score > 0);
  const ordered = (positive.length > 0 ? positive : ranked).map(
    (item) => item.chunk,
  );

  return ordered;
}

function computeConfidence(chunks: KnowledgeChunk[]): SearchConfidence {
  if (chunks.length === 0) return "none";
  const hasDoc = chunks.some((c) => c.kind === "doc" || c.kind === "facts");
  if (!hasDoc) return "low";
  if (chunks.length >= 6) return "high";
  if (chunks.length >= 3) return "medium";
  return "low";
}

function sectionKey(chunk: KnowledgeChunk): string {
  return `${chunk.url}::${chunk.section}`;
}

function selectChunks(
  ranked: KnowledgeChunk[],
  options: Required<Pick<RetrieveOptions, "limit" | "includeImplementation">>,
): KnowledgeChunk[] {
  const facts = ranked.filter((c) => c.id === "facts:canonical");
  const citeable = ranked.filter((c) => c.citeable && c.id !== "facts:canonical");
  const implementation = ranked.filter((c) => !c.citeable);

  const selected: KnowledgeChunk[] = [];
  const seen = new Set<string>();
  const perSection = new Map<string, number>();
  const maxPerSection = KNOWLEDGE_CONTEXT.maxChunksPerUrlSection;

  const push = (chunk: KnowledgeChunk, enforceSectionCap: boolean) => {
    if (seen.has(chunk.id)) return false;
    if (enforceSectionCap) {
      const key = sectionKey(chunk);
      if ((perSection.get(key) ?? 0) >= maxPerSection) return false;
      perSection.set(key, (perSection.get(key) ?? 0) + 1);
    }
    seen.add(chunk.id);
    selected.push(chunk);
    return true;
  };

  for (const chunk of facts) push(chunk, false);

  for (const chunk of citeable) {
    if (selected.filter((c) => c.citeable && c.id !== "facts:canonical").length >= options.limit) {
      break;
    }
    push(chunk, true);
  }

  if (options.includeImplementation) {
    for (const chunk of implementation) {
      if (selected.filter((c) => !c.citeable).length >= 3) break;
      if (selected.length >= options.limit + 3) break;
      push(chunk, true);
    }
  }

  const citeableTarget = options.limit;
  const maxSelected =
    options.limit + (options.includeImplementation ? 3 : 0);

  if (
    selected.filter((c) => c.citeable && c.id !== "facts:canonical").length <
    citeableTarget
  ) {
    for (const chunk of citeable) {
      if (
        selected.filter((c) => c.citeable && c.id !== "facts:canonical").length >=
        citeableTarget
      ) {
        break;
      }
      if (selected.length >= maxSelected) break;
      push(chunk, false);
    }
  }

  return selected.slice(0, options.limit + (options.includeImplementation ? 3 : 0));
}

export async function retrieveKnowledge(
  query: string,
  options: RetrieveOptions = {},
): Promise<RetrieveResult> {
  const started = Date.now();
  const { index, corpus, corpusById } = await knowledgeIndex;
  const limit = options.limit ?? 12;
  const includeImplementation = options.includeImplementation ?? true;
  const label = options.debugLabel ?? "retrieve";
  const { emit } = options;

  if (emit && pendingIndexStats) {
    emit("knowledge index ready", pendingIndexStats);
    pendingIndexStats = null;
  }

  emit?.(`${label} retrieve start`, {
    query: query || "(empty)",
    limit,
    includeImplementation,
  });

  const variants = buildQueryVariants(query);
  let found = await flexsearchCandidates(index, corpusById, variants);
  let searchStrategy: "flexsearch" | "corpus-fallback" = "flexsearch";

  if (found.size === 0 && query.trim()) {
    found = new Map(
      rankChunks(query, corpus).map((chunk) => [chunk.id, chunk] as const),
    );
    searchStrategy = "corpus-fallback";
  }

  const ranked = rankChunks(query, [...found.values()]);
  const chunks = selectChunks(ranked, { limit, includeImplementation });

  const result = {
    query,
    chunks,
    confidence: computeConfidence(chunks),
  };

  emit?.(`${label} retrieve complete`, {
    ...retrieveCompletePayload(result, {
      durationMs: Date.now() - started,
      variants,
      candidatesFound: found.size,
    }),
    searchStrategy,
  });

  return result;
}

export function formatRetrievedContext(result: RetrieveResult): string {
  if (result.chunks.length === 0) {
    return "No matching documentation was retrieved for this question.";
  }

  const { chunkBodyMaxChars, contextMaxChars } = KNOWLEDGE_CONTEXT;
  const blocks: string[] = [];
  let usedChars = 0;

  for (const chunk of result.chunks) {
    const header = [
      `[${chunk.id}] ${chunk.title} — ${chunk.section}`,
      `URL: ${
        chunk.citeable
          ? absoluteDocsUrl(chunk.url)
          : "(internal reference — do not link to users)"
      }`,
      chunk.description ? `Summary: ${chunk.description}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const remaining = contextMaxChars - usedChars - header.length - 8;
    if (remaining <= 0) break;

    const body = chunk.content.slice(0, Math.min(chunkBodyMaxChars, remaining)).trim();
    blocks.push([header, body].join("\n"));
    usedChars += header.length + body.length;
  }

  return blocks.join("\n\n---\n\n");
}

export function toSearchToolOutput(
  result: RetrieveResult,
  toolLimit = 8,
): SearchToolOutput {
  const citeable = result.chunks.filter((c) => c.citeable);
  const implementation = result.chunks.filter((c) => !c.citeable).slice(0, 2);
  const ordered = [...citeable, ...implementation].slice(0, toolLimit);

  return {
    query: result.query,
    confidence: result.confidence,
    resultCount: ordered.length,
    querySuggestion:
      result.confidence === "none"
        ? `${result.query} Nexus UI documentation`
        : undefined,
    results: ordered.map((chunk, index) => toSearchResultItem(chunk, index)),
  };
}

function toSearchResultItem(
  chunk: KnowledgeChunk,
  rank: number,
): SearchResultItem {
  const baseScore = 20 - rank;
  return {
    title: chunk.title,
    url: chunk.citeable ? absoluteDocsUrl(chunk.url) : chunk.url,
    description: chunk.description,
    section: chunk.section,
    snippet: chunk.snippet,
    score: Math.max(1, baseScore),
  };
}

function absoluteDocsUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

