export type { KnowledgeChunk, RetrieveOptions, RetrieveResult } from "@/lib/knowledge/types";
export { KNOWLEDGE_CONTEXT } from "@/lib/knowledge/config";
export {
  buildRetrievalQueryFromMessages,
  extractLatestUserText,
} from "@/lib/knowledge/query";
export {
  retrieveKnowledge,
  formatRetrievedContext,
  toSearchToolOutput,
} from "@/lib/knowledge/retrieve";
