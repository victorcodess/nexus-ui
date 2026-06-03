import type { Tool, UIMessage } from 'ai';
import type { AskAiDebugPayload } from '@/lib/ask-ai/debug';

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
    /** TEMP: transient debug events → browser console via onData */
    debug: AskAiDebugPayload;
  }
>;

export interface SearchResultItem {
  title: string;
  url: string;
  description?: string;
  section?: string;
  snippet?: string;
  score: number;
}

export type SearchConfidence = 'high' | 'medium' | 'low' | 'none';

export interface SearchToolOutput {
  query: string;
  confidence: SearchConfidence;
  resultCount: number;
  querySuggestion?: string;
  results: SearchResultItem[];
}

export type SearchTool = Tool<{ query: string; limit: number }>;
