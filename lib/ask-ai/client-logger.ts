"use client";

/**
 * Temporary Ask AI observability — logs transient `data-debug` parts in the browser.
 *
 * Removal: delete `lib/ask-ai/`, remove `debug` from `ChatUIMessage` in `lib/ai/types.ts`,
 * revert `app/api/chat/route.ts` stream wrapper, remove `onData` from `components/ai/search/context.tsx`,
 * remove `emit` from `RetrieveOptions` in `lib/knowledge/types.ts` and `retrieve.ts`.
 */

import type { AskAiDebugPayload } from "@/lib/ask-ai/debug";

export function isAskAiLogEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ASK_AI_DEBUG === "0") return false;
  if (process.env.NEXT_PUBLIC_ASK_AI_DEBUG === "1") return true;
  return process.env.NODE_ENV === "development";
}

export function logAskAiDebug(payload: AskAiDebugPayload): void {
  if (!isAskAiLogEnabled()) return;
  const { requestId, message, ts, ...rest } = payload;
  console.log(`[ask-ai] ${requestId} ${message}`, { ts, ...rest });
}
