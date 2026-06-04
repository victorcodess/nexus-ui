"use client";

import { useEffect, useState } from "react";
import { getAskAiClientSessionId } from "@/components/ai/search/helpers";
import {
  useAISearchContext,
  useChatContext,
} from "@/components/ai/search/context";
import { ASK_AI_CLIENT_ID_HEADER } from "@/lib/ask-ai/client-session";
import { cn } from "@/lib/utils";

type Usage = { remaining: number; limit: number };

async function loadUsage(): Promise<Usage | null> {
  const id = getAskAiClientSessionId();
  const res = await fetch("/api/ask-ai/usage", {
    headers: id ? { [ASK_AI_CLIENT_ID_HEADER]: id } : undefined,
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.disabled || data.remaining == null || data.limit == null)
    return null;
  return { remaining: data.remaining, limit: data.limit };
}

export function AskAiUsageLabel({ className }: { className?: string }) {
  const { open } = useAISearchContext();
  const { status } = useChatContext();
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    if (!open) return;
    void loadUsage().then(setUsage);
  }, [open, status]);

  if (!usage) return null;

  return (
    <span
      className={cn(
        "flex animate-in cursor-default items-center px-2 text-xs text-muted-foreground/60 tabular-nums select-none fade-in",
        className,
      )}
      aria-live="polite"
    >
      {usage.remaining}/{usage.limit}
    </span>
  );
}
