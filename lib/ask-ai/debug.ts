import type { KnowledgeChunk, RetrieveResult } from "@/lib/knowledge/types";
import type { SearchToolOutput } from "@/lib/ai/types";

/** Payload streamed as transient `data-debug` (browser console only). */
export type AskAiDebugPayload = {
  requestId: string;
  message: string;
  ts: number;
} & Record<string, unknown>;

export function createAskAiRequestId(): string {
  return `ask-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function summarizeChunk(chunk: KnowledgeChunk) {
  return {
    id: chunk.id,
    kind: chunk.kind,
    citeable: chunk.citeable,
    title: chunk.title,
    section: chunk.section,
    url: chunk.url,
    snippetPreview: chunk.snippet.slice(0, 100),
  };
}

export function retrieveCompletePayload(
  result: RetrieveResult,
  meta: {
    durationMs: number;
    variants: string[];
    candidatesFound: number;
  },
) {
  return {
    durationMs: meta.durationMs,
    confidence: result.confidence,
    chunkCount: result.chunks.length,
    candidatesFound: meta.candidatesFound,
    queryVariants: meta.variants,
    chunks: result.chunks.map(summarizeChunk),
  };
}

export function searchToolOutputPayload(
  output: SearchToolOutput,
  durationMs: number,
) {
  return {
    durationMs,
    confidence: output.confidence,
    resultCount: output.resultCount,
    querySuggestion: output.querySuggestion,
    results: output.results.map((r) => ({
      title: r.title,
      url: r.url,
      section: r.section,
      score: r.score,
      snippetPreview: r.snippet?.slice(0, 120),
    })),
  };
}
