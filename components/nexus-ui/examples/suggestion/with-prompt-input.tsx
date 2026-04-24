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
import {
  Suggestions,
  SuggestionList,
  Suggestion,
} from "@/components/nexus-ui/suggestions";
import { ArrowUp02Icon, PlusSignIcon, SquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type InputStatus = "idle" | "loading" | "error" | "submitted";

export default function SuggestionWithPromptInput() {
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
    <div className="flex w-full flex-col gap-6">
      <PromptInput onSubmit={doSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <PromptInputActions>
          <PromptInputActionGroup>
            <PromptInputAction asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-70 hover:dark:bg-secondary"
              >
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>
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
                  <HugeiconsIcon icon={SquareIcon} strokeWidth={2.0} className="size-3.5 fill-current" />
                ) : (
                  <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.0} className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActionGroup>
        </PromptInputActions>
      </PromptInput>
      <Suggestions onSelect={(value) => setInput(value)}>
        <SuggestionList className="justify-center">
          <Suggestion>What is AI?</Suggestion>
          <Suggestion>Teach me Engineering from scratch</Suggestion>
          <Suggestion>How to learn React?</Suggestion>
          <Suggestion>Design a weekly workout plan</Suggestion>
          <Suggestion>Places to visit in France</Suggestion>
        </SuggestionList>
      </Suggestions>
    </div>
  );
}
