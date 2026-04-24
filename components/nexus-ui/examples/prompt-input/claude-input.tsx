"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import {
  PromptInput,
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
  ModelSelectorSeparator,
  ModelSelectorPortal,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorSub,
  ModelSelectorSubContent,
  ModelSelectorSubTrigger,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import {
  ClaudeAdd,
  ClaudeAudioLines,
  ClaudeCaret,
  ClaudeArrowUp,
  ClaudeDisc,
} from "@/components/svgs/claude-icons";
import { Switch } from "@/components/ui/switch";

type InputStatus = "idle" | "loading" | "error" | "submitted";

const claudeModels = [
  {
    value: "opus-4.6",
    title: "Opus 4.6",
    description: "Most capable for ambitious work",
  },
  {
    value: "sonnet-4.6",
    title: "Sonnet 4.6",
    description: "Most efficient for everyday tasks",
  },
  {
    value: "haiku-4.5",
    title: "Haiku 4.5",
    description: "Fastest for quick answers",
  },
];

const moreModels = [
  { value: "opus-4.5", title: "Opus 4.5" },
  { value: "opus-3", title: "Opus 3" },
  { value: "sonnet-4.5", title: "Sonnet 4.5" },
];

const ClaudeInput = () => {
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<InputStatus>("idle");
  const [model, setModel] = React.useState("opus-4.6");
  const [extendedThinking, setExtendedThinking] = React.useState(false);

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
  const allModels = React.useMemo(() => [...claudeModels, ...moreModels], []);

  return (
    <PromptInput
      onSubmit={doSubmit}
      className="gap-3 rounded-[20px] p-3.5 shadow-lg"
    >
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="How can I help you today?"
        disabled={isLoading}
        className="min-h-12 px-1.5 py-1.5 placeholder:text-[15px] placeholder:font-normal"
      />
      <PromptInputActions className="px-1 py-0">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              className="size-8 cursor-pointer gap-1 rounded-md border-none bg-transparent text-[13px] leading-6 font-normal text-muted-foreground hover:bg-muted dark:text-white dark:hover:bg-border"
            >
              <ClaudeAdd className="size-5" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <ModelSelector
              value={model}
              onValueChange={setModel}
              items={allModels}
            >
              <ModelSelectorTrigger
                variant="ghost"
                className="h-8 cursor-pointer gap-1 rounded-sm border-none bg-transparent pr-1.5 pl-2.5 text-[13px] leading-6 font-normal text-foreground transition-all hover:bg-muted active:scale-97 data-[state=open]:bg-muted dark:text-white dark:hover:bg-border dark:data-[state=open]:bg-border"
              >
                <span>
                  {allModels.find((m) => m.value === model)?.title ??
                    "Opus 4.6"}
                </span>
                <ClaudeCaret className="size-4" />
              </ModelSelectorTrigger>
              <ModelSelectorContent
                className="w-[256px] rounded-xl border border-border bg-popover p-1.5 shadow-modal"
                align="end"
                sideOffset={4}
              >
                <ModelSelectorGroup>
                  <ModelSelectorRadioGroup
                    value={model}
                    onValueChange={setModel}
                  >
                    {claudeModels.map((m) => (
                      <ModelSelectorRadioItem
                        key={m.value}
                        value={m.value}
                        title={m.title}
                        description={m.description}
                        indicator={
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            strokeWidth={2.0}
                            className="size-4.5 text-blue-500 dark:text-blue-400"
                          />
                        }
                        className="gap-10 rounded-md px-2 py-1.5 focus:bg-accent **:data-[slot=model-selector-radio-item-indicator]:right-4"
                      />
                    ))}
                  </ModelSelectorRadioGroup>
                </ModelSelectorGroup>
                <ModelSelectorSeparator className="my-1.5 bg-border" />
                <ModelSelectorItem
                  onClick={() => setExtendedThinking(!extendedThinking)}
                  className="px-2 py-1.5 focus:bg-accent"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.25">
                      <p className="text-sm font-normal text-foreground">
                        Extended thinking
                      </p>
                      <p className="text-xs font-[350] text-muted-foreground">
                        Think longer for complex tasks
                      </p>
                    </div>
                    <Switch
                      checked={extendedThinking}
                      onCheckedChange={setExtendedThinking}
                    />
                  </div>
                </ModelSelectorItem>
                <ModelSelectorSeparator className="bg-border" />
                <ModelSelectorGroup>
                  <ModelSelectorSub>
                    <ModelSelectorSubTrigger className="px-2 py-1.5 focus:bg-accent data-[state=open]:bg-accent dark:data-[state=open]:bg-accent">
                      More models
                    </ModelSelectorSubTrigger>
                    <ModelSelectorPortal>
                      <ModelSelectorSubContent className="w-[192px] gap-0 rounded-xl border border-border bg-popover p-1.5 shadow-modal">
                        <ModelSelectorRadioGroup
                          value={model}
                          onValueChange={setModel}
                        >
                          {moreModels.map((m) => (
                            <ModelSelectorRadioItem
                              key={m.value}
                              value={m.value}
                              title={m.title}
                              className="min-h-8 px-2 focus:bg-accent"
                            />
                          ))}
                        </ModelSelectorRadioGroup>
                      </ModelSelectorSubContent>
                    </ModelSelectorPortal>
                  </ModelSelectorSub>
                </ModelSelectorGroup>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button
              type="button"
              className={cn(
                "size-8 cursor-pointer gap-1 rounded-md bg-transparent text-[13px] leading-6 font-normal text-foreground transition-all hover:bg-muted active:scale-97 disabled:opacity-70 dark:text-white dark:hover:bg-border",
                input.trim() && "bg-[#df6e3e] dark:bg-[#BC6844]",
                isLoading &&
                  "border border-border bg-transparent disabled:opacity-100 dark:bg-transparent dark:hover:bg-transparent",
              )}
              disabled={isLoading}
              onClick={() => input.trim() && doSubmit(input)}
            >
              {isLoading ? (
                <ClaudeDisc className="text-muted-foreground dark:text-foreground" />
              ) : input.trim() ? (
                <ClaudeArrowUp className="text-white" />
              ) : (
                <ClaudeAudioLines className="size-5" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ClaudeInput;
