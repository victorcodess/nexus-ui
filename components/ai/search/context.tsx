'use client';

import { createContext, type ReactNode, use, useMemo, useState } from 'react';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { logAskAiDebug } from '@/lib/ask-ai/client-logger';
import type { ChatUIMessage } from '@/lib/ai/types';

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<ChatUIMessage>;
} | null>(null);

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat<ChatUIMessage>({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    // TEMP: remove with lib/ask-ai/
    onData: (part) => {
      if (part.type === 'data-debug') logAskAiDebug(part.data);
    },
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>{children}</Context>
  );
}

export function useAISearchContext() {
  return use(Context)!;
}

export function useChatContext() {
  return use(Context)!.chat;
}
