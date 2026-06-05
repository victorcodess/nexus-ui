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
}

export interface RetrieveResult {
  query: string;
  chunks: KnowledgeChunk[];
  confidence: "high" | "medium" | "low" | "none";
}
