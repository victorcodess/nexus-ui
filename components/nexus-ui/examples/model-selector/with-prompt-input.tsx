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
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import GeminiIcon from "@/components/svgs/gemini";
import {
  ArrowUp02Icon,
  Mic02Icon,
  PlusSignIcon,
  SquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const models = [
  {
    value: "gpt-4",
    icon: ChatgptIcon,
    title: "GPT-4",
    description: "Most capable",
  },
  {
    value: "gpt-4o-mini",
    icon: ChatgptIcon,
    title: "GPT-4o Mini",
    description: "Fast",
  },
  {
    value: "claude-3.5",
    icon: ClaudeIcon2,
    title: "Claude 3.5",
    description: "Strong reasoning",
  },
  {
    value: "gemini-1.5-flash",
    icon: GeminiIcon,
    title: "Gemini 1.5 Flash",
    description: "Fast and versatile",
  },
];

type InputStatus = "idle" | "loading" | "error" | "submitted";

export default function ModelSelectorWithPromptInput() {
  const [model, setModel] = React.useState("gpt-4");
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
        placeholder="Ask anything..."
        disabled={isLoading}
      />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <ModelSelector
              value={model}
              onValueChange={setModel}
              items={models}
            >
              <ModelSelectorTrigger variant="ghost" />
              <ModelSelectorContent className="w-[264px]" align="end">
                <ModelSelectorGroup>
                  <ModelSelectorLabel>Select model</ModelSelectorLabel>
                  <ModelSelectorRadioGroup
                    value={model}
                    onValueChange={setModel}
                  >
                    {models.map((m) => (
                      <ModelSelectorRadioItem
                        key={m.value}
                        value={m.value}
                        icon={m.icon}
                        title={m.title}
                        description={m.description}
                      />
                    ))}
                  </ModelSelectorRadioGroup>
                </ModelSelectorGroup>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer rounded-full border-none bg-transparent text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
              <HugeiconsIcon icon={Mic02Icon} strokeWidth={2.0} className="size-4" />
            </Button>
          </PromptInputAction>

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
