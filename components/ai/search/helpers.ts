'use client';

import type { UseChatHelpers } from '@ai-sdk/react';
import { isTextUIPart } from 'ai';
import type { ChatUIMessage, SearchToolOutput } from '@/lib/ai/types';

export const StorageKeyInput = '__ai_search_input';
const StorageKeyAskAiClientId = '__ask_ai_client_id';

/** Sent only when the server cannot resolve an IP (local dev, etc.). */
export function getAskAiClientSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = localStorage.getItem(StorageKeyAskAiClientId);
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem(StorageKeyAskAiClientId, id);
    return id;
  } catch {
    return '';
  }
}

/** Placeholder row while waiting for the first assistant stream chunk. */
export const PENDING_ASSISTANT_MESSAGE_ID = "__nexus-pending-assistant__";

export function isPendingAssistantMessage(message: ChatUIMessage) {
  return message.id === PENDING_ASSISTANT_MESSAGE_ID;
}

export function buildDisplayMessages(
  messages: ChatUIMessage[],
  isLoading: boolean,
) {
  const visible = messages.filter((message) => message.role !== "system");
  const lastMessage = visible[visible.length - 1];
  const showPendingAssistantRow =
    isLoading && lastMessage?.role === "user";

  if (showPendingAssistantRow) {
    return [
      ...visible,
      {
        id: PENDING_ASSISTANT_MESSAGE_ID,
        role: "assistant" as const,
        parts: [],
      },
    ];
  }

  return visible;
}

/** Stable key for the assistant turn after a user message (pending row + streamed reply). */
export function displayMessageRowKey(
  message: ChatUIMessage,
  index: number,
  rowList: ChatUIMessage[],
) {
  if (message.role === "assistant") {
    const previous = rowList[index - 1];
    if (previous?.role === "user") {
      return `${previous.id}::assistant`;
    }
  }
  return message.id;
}

/** Empty-state suggestions — short, varied interrogatives, tied to real docs. */
export const starterPrompts = [
  'How do I add Prompt Input?',
  'Can Thread and Message compose a chat UI?',
  'What is the Citation component for?',
  'Does Reasoning support streaming?',
];

/** Follow-ups after an answer — short, varied interrogatives. */
export const followupPrompts = [
  'What is the install command?',
  'Can you show a minimal example?',
  'Which components pair with this?',
];

export function isChatEmpty(messages: ChatUIMessage[]) {
  return messages.filter((message) => message.role !== "system").length === 0;
}

export function formatConversationForCopy(messages: ChatUIMessage[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => {
      const text = (message.parts ?? [])
        .filter(isTextUIPart)
        .map((part) => part.text)
        .join("")
        .trim();
      if (!text) return null;
      const label = message.role === "user" ? "You" : "Assistant";
      return `${label}\n${text}`;
    })
    .filter((block): block is string => block != null)
    .join("\n\n");
}

export function sendPromptMessage(
  sendMessage: UseChatHelpers<ChatUIMessage>['sendMessage'],
  text: string,
  onSent?: (next: string) => void,
) {
  const message = text.trim();
  if (message.length === 0) return;

  void sendMessage({
    role: 'user',
    parts: [
      {
        type: 'data-client',
        data: {
          location: location.href,
        },
      },
      {
        type: 'text',
        text: message,
      },
    ],
  });

  onSent?.('');
  if (typeof window !== 'undefined') {
    localStorage.removeItem(StorageKeyInput);
  }
}

export function normalizeSearchToolOutput(output: unknown): SearchToolOutput | null {
  if (!output || typeof output !== 'object') return null;
  const value = output as Record<string, unknown>;
  if (!Array.isArray(value.results)) return null;

  return {
    query: typeof value.query === 'string' ? value.query : '',
    confidence:
      value.confidence === 'high' || value.confidence === 'medium' || value.confidence === 'low'
        ? value.confidence
        : 'none',
    resultCount: typeof value.resultCount === 'number' ? value.resultCount : value.results.length,
    querySuggestion: typeof value.querySuggestion === 'string' ? value.querySuggestion : undefined,
    results: value.results.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const result = item as Record<string, unknown>;
      if (typeof result.title !== 'string' || typeof result.url !== 'string') return [];
      return [
        {
          title: result.title,
          url: result.url,
          description: typeof result.description === 'string' ? result.description : undefined,
          section: typeof result.section === 'string' ? result.section : undefined,
          snippet: typeof result.snippet === 'string' ? result.snippet : undefined,
          score: typeof result.score === 'number' ? result.score : 0,
        },
      ];
    }),
  };
}
