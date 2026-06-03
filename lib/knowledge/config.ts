/** Retrieval and injected context budgets (not model-specific hacks). */
export const KNOWLEDGE_CONTEXT = {
  /** Chunks passed into <retrieved_context> on each chat turn. */
  preRetrieveLimit: 22,
  /** Default limit for the search tool. */
  searchToolLimit: 12,
  /** FlexSearch hits collected per query variant before ranking. */
  flexsearchVariantLimit: 80,
  /** Max chars per chunk body in <retrieved_context>. */
  chunkBodyMaxChars: 1100,
  /** Max total chars for all retrieved chunk bodies combined. */
  contextMaxChars: 32_000,
  /** Avoid many chunks from the same doc section crowding out other sections. */
  maxChunksPerUrlSection: 2,
  /** User turns combined for retrieval (latest-only loses follow-up topic). */
  retrievalQueryMaxChars: 2_000,
} as const;
