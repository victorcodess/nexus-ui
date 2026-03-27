"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  ArrowUp02Icon,
  SquareIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type InputStatus = "idle" | "loading" | "error" | "submitted";

export default function PromptInputDefault() {
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<InputStatus>("idle");

  const doSubmit = React.useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setInput("");
    setStatus("loading");

    setTimeout(() => {
      setStatus("submitted");
      setTimeout(() => setStatus("idle"), 800);
    }, 2500);
  }, []);

  const isLoading = status === "loading";

  return (
    <PromptInput onSubmit={doSubmit}>
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="How can I help you today?"
        disabled={isLoading}
      />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              className="size-8 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-gray-900 transition-transform hover:bg-gray-200 active:scale-97 dark:text-white dark:hover:bg-gray-700"
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              className="size-8 cursor-pointer rounded-full bg-gray-700 text-white transition-transform hover:bg-gray-800 active:scale-97 disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              disabled={isLoading || !input.trim()}
              onClick={() => input.trim() && doSubmit(input)}
            >
              {isLoading ? (
                <HugeiconsIcon icon={SquareIcon} strokeWidth={2.0} className="size-3.5 fill-current" />
              ) : (
                <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.0} className="size-4" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
}
