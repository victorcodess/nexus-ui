"use client";

import { type ComponentProps, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp02Icon, SquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { askAiInputFade } from "@/components/ai/search/animation";
import { useChatContext } from "@/components/ai/search/context";
import { useOnChange } from "@/lib/use-on-change";
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

export function AISearchInput({
  className,
  fadeIn = false,
  ...props
}: ComponentProps<"div"> & { fadeIn?: boolean }) {
  const { status, sendMessage, stop } = useChatContext();
  const reduceMotion = useReducedMotion();
  const [enterKey, setEnterKey] = useState(0);
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";

  useOnChange(fadeIn, (isEmpty, wasEmpty) => {
    if (isEmpty && !wasEmpty) {
      setEnterKey((key) => key + 1);
    }
  });

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

  const promptInput = (
    <PromptInput
      {...props}
      className="w-full"
      onSubmit={(value) => sendPromptMessage(sendMessage, value, setInput)}
    >
      <PromptInputTextarea
        id="nd-ai-input"
        value={input}
        placeholder={
          isLoading ? "Generating grounded answer..." : "Ask Nexus AI"
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

  if (reduceMotion || !fadeIn) {
    return <div className={cn("w-full", className)}>{promptInput}</div>;
  }

  return (
    <motion.div
      key={enterKey}
      className={cn("w-full", className)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={askAiInputFade}
    >
      {promptInput}
    </motion.div>
  );
}
