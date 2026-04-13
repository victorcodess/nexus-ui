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
  ModelSelectorItem,
  ModelSelectorLabel,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import {
  GeminiAdd,
  GeminiPageInfo,
  GeminiMic,
  GeminiCaret,
  GeminiSend,
  GeminiCheck,
} from "@/components/svgs/gemini-icons";
import { SquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type InputStatus = "idle" | "loading" | "error" | "submitted";

const geminiModels = [
  { value: "fast", title: "Fast", description: "Answers quickly" },
  {
    value: "thinking",
    title: "Thinking",
    description: "Solves complex problems",
  },
  {
    value: "pro",
    title: "Pro",
    description: "Advanced math and code with 3.1 Pro",
  },
];

const GeminiInput = () => {
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<InputStatus>("idle");
  const [model, setModel] = React.useState("fast");

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
    <PromptInput onSubmit={doSubmit} className="rounded-[32px] p-3 shadow-lg">
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Gemini 3"
        disabled={isLoading}
        className="min-h-12 px-3 py-2.25 text-sm placeholder:text-sm"
      />
      <PromptInputActions className="px-0 pt-2 pb-0">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              className="size-10 cursor-pointer rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground transition-all hover:bg-muted active:scale-97 dark:text-white dark:hover:bg-border"
            >
              <GeminiAdd className="size-5 text-muted-foreground" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button
              type="button"
              className="h-10 cursor-pointer gap-1.75 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground transition-all hover:bg-muted active:scale-97 dark:text-white dark:hover:bg-border"
            >
              <GeminiPageInfo className="size-5 text-muted-foreground" />
              <span className="max-sm:hidden">Tools</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <ModelSelector
              value={model}
              onValueChange={setModel}
              items={geminiModels}
            >
              <ModelSelectorTrigger
                variant="ghost"
                className="h-10 gap-1.75 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground transition-all hover:bg-muted active:scale-97 data-[state=open]:bg-muted dark:text-white dark:hover:bg-border"
              >
                <span>
                  {geminiModels.find((m) => m.value === model)?.title ?? "Fast"}
                </span>
                <GeminiCaret className="-mb-0.5 size-5 text-muted-foreground" />
              </ModelSelectorTrigger>
              <ModelSelectorContent
                className="w-[320px] rounded-xl border border-border bg-popover px-0 py-2 shadow-modal"
                align="end"
                sideOffset={8}
              >
                <ModelSelectorGroup>
                  <ModelSelectorLabel className="px-4 text-sm font-normal">
                    Gemini 3
                  </ModelSelectorLabel>
                  <ModelSelectorRadioGroup
                    value={model}
                    onValueChange={setModel}
                  >
                    {geminiModels.map((m) => (
                      <ModelSelectorRadioItem
                        key={m.value}
                        value={m.value}
                        title={m.title}
                        description={m.description}
                        indicator={
                          <GeminiCheck className="size-6 text-blue-500 dark:text-blue-400" />
                        }
                        className="gap-10 rounded-none px-4 focus:bg-accent **:data-[slot=model-selector-radio-item-indicator]:right-4"
                      />
                    ))}
                  </ModelSelectorRadioGroup>
                </ModelSelectorGroup>

                <ModelSelectorItem
                  asChild
                  className="pointer-events-none rounded-none px-4 py-0 focus:bg-transparent dark:focus:bg-transparent [&>*:last-child]:pointer-events-auto"
                >
                  <div className="flex w-full items-center justify-between gap-2 px-4">
                    <div className="flex flex-col gap-0.25">
                      <p className="text-sm font-normal text-foreground">
                        Upgrade to Google AI Plus
                      </p>
                      <p className="text-xs font-[350] text-muted-foreground">
                        Get access to select Pro features
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="rounded-full bg-transparent px-3 text-sm font-medium text-blue-500 transition-all hover:bg-blue-50 active:scale-97 dark:text-blue-400 dark:hover:bg-blue-400/25"
                    >
                      Upgrade
                    </Button>
                  </div>
                </ModelSelectorItem>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button
              type="button"
              className={cn(
                "size-10 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground transition-all hover:bg-muted active:scale-97 disabled:opacity-70 dark:text-white dark:hover:bg-border",
                isLoading && "bg-primary/10",
              )}
              disabled={isLoading}
              onClick={() => input.trim() && doSubmit(input)}
            >
              {isLoading ? (
                <HugeiconsIcon icon={SquareIcon} strokeWidth={2.0} className="size-3.5 fill-current text-blue-400" />
              ) : input.trim() ? (
                <GeminiSend className="size-5 text-muted-foreground" />
              ) : (
                <GeminiMic className="size-5 text-muted-foreground" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default GeminiInput;
