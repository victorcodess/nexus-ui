"use client";

import { type ComponentProps, useEffect, useState } from "react";
import { ArrowUp02Icon, SquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useChatContext } from "@/components/ai/search/context";
import { sendPromptMessage, StorageKeyInput } from "@/components/ai/search/helpers";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AISearchInput(props: ComponentProps<"div">) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(StorageKeyInput) ?? "";
    queueMicrotask(() => setInput(stored));
  }, []);

  useEffect(() => {
    if (isLoading) document.getElementById("nd-ai-input")?.focus();
  }, [isLoading]);

  const handleAction = () => {
    if (isLoading) {
      stop();
      return;
    }
    if (input.trim()) sendPromptMessage(sendMessage, input, setInput);
  };

  return (
    <PromptInput
      {...props}
      className={cn("w-full", props.className)}
      onSubmit={(value) => sendPromptMessage(sendMessage, value, setInput)}
    >
      <PromptInputTextarea
        id="nd-ai-input"
        value={input}
        placeholder={
          isLoading ? "Generating grounded answer..." : "Ask nexus-ui docs"
        }
        disabled={isLoading}
        onChange={(e) => {
          setInput(e.target.value);
          if (typeof window !== "undefined") {
            localStorage.setItem(StorageKeyInput, e.target.value);
          }
        }}
      />
      <PromptInputActions className="justify-end">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              size="icon-sm"
              className="cursor-pointer rounded-full active:scale-97 disabled:opacity-70"
              disabled={!isLoading && !input.trim()}
              onClick={handleAction}
            >
              {isLoading ? (
                <HugeiconsIcon
                  icon={SquareIcon}
                  strokeWidth={2.0}
                  className="size-3.5 fill-current"
                />
              ) : (
                <HugeiconsIcon
                  icon={ArrowUp02Icon}
                  strokeWidth={2.0}
                  className="size-4"
                />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
}
