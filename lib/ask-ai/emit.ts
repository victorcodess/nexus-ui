import type { UIMessageStreamWriter } from "ai";
import type { AskAiDebugPayload } from "@/lib/ask-ai/debug";
import type { ChatUIMessage } from "@/lib/ai/types";

export type AskAiDebugEmitter = (
  message: string,
  data?: Record<string, unknown>,
) => void;

export function createDebugEmitter(
  writer: UIMessageStreamWriter<ChatUIMessage>,
  requestId: string,
): AskAiDebugEmitter {
  return (message, data) => {
    const payload: AskAiDebugPayload = {
      requestId,
      message,
      ts: Date.now(),
      ...data,
    };
    writer.write({
      type: "data-debug",
      transient: true,
      data: payload,
    });
  };
}
