"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp02Icon, SquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type InputStatus = "idle" | "loading" | "error" | "submitted";

export default function PromptInputBasic() {
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<InputStatus>("idle");

  const doSubmit = React.useCallback((value: string) => {
    if (!value.trim()) return;
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
      <PromptInputActions className="justify-end">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              size="icon-sm"
              className="cursor-pointer rounded-full active:scale-97 disabled:opacity-70"
              disabled={!isLoading && !input.trim()}
              onClick={() => input.trim() && doSubmit(input)}
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
