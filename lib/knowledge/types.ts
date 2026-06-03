export type KnowledgeKind = "doc" | "skill" | "source" | "facts";

export interface KnowledgeChunk {
  id: string;
  kind: KnowledgeKind;
  citeable: boolean;
  url: string;
  title: string;
  description: string;
  section: string;
  snippet: string;
  content: string;
  componentSlug?: string;
}

export interface RetrieveOptions {
  limit?: number;
  /** Include up to 3 non-citeable implementation/skill chunks for model context. */
  includeImplementation?: boolean;
  /** TEMP: label in debug stream; remove with `lib/ask-ai/`. */
  debugLabel?: string;
  /** TEMP: streams debug events to the client; remove with `lib/ask-ai/`. */
  emit?: (message: string, data?: Record<string, unknown>) => void;
}

export interface RetrieveResult {
  query: string;
  chunks: KnowledgeChunk[];
  confidence: "high" | "medium" | "low" | "none";
}
