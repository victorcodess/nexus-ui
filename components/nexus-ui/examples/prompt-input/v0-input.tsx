"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import {
  V0Plus,
  V0ArrowUp,
  V0Caret,
  V0TierAuto,
  V0TierMini,
  V0TierPro,
  V0TierMax,
  V0TierMaxFast,
  V0Check,
  V0Disc,
} from "@/components/svgs/v0-icons";

type InputStatus = "idle" | "loading" | "error" | "submitted";

const v0Models = [
  { value: "auto", title: "v0 Auto", icon: V0TierAuto },
  { value: "mini", title: "v0 Mini", icon: V0TierMini },
  { value: "pro", title: "v0 Pro", icon: V0TierPro },
  { value: "max", title: "v0 Max", icon: V0TierMax },
  { value: "max-fast", title: "v0 Max Fast", icon: V0TierMaxFast },
];

const V0Input = () => {
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<InputStatus>("idle");
  const [model, setModel] = React.useState<string>("pro");

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
  const selected = v0Models.find((m) => m.value === model) ?? v0Models[2];
  const SelectedIcon = selected.icon;

  return (
    <PromptInput
      onSubmit={doSubmit}
      className="gap-2 rounded-xl p-3 shadow-none"
    >
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask v0 to build..."
        disabled={isLoading}
        className="min-h-13.5 px-0 pt-0 pb-2"
      />
      <PromptInputActions className="px-0 py-0">
        <PromptInputActionGroup className="gap-1">
          <PromptInputAction asChild>
            <Button
              type="button"
              className="-none size-7 cursor-pointer gap-1 rounded-sm bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              <V0Plus className="size-4" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <ModelSelector
              value={model}
              onValueChange={setModel}
              items={v0Models}
            >
              <ModelSelectorTrigger
                variant="ghost"
                className="h-7 gap-1 rounded-sm border-none bg-transparent px-1.5 text-xs leading-4 font-normal text-[#5D5D5D] transition-all hover:bg-gray-100 active:scale-99 dark:text-white dark:hover:bg-gray-700"
              >
                <SelectedIcon className="size-4 shrink-0 text-gray-600 dark:text-gray-300 [&_.stroke-v0-gray-500]:stroke-gray-400 dark:[&_.stroke-v0-gray-500]:stroke-gray-600" />
                <span className="truncate">{selected.title}</span>
                <V0Caret className="-ml-0.5 size-4 shrink-0" />
              </ModelSelectorTrigger>
              <ModelSelectorContent
                className="w-[168px] min-w-0 rounded-xl border border-gray-200 px-1.5 py-1.5 shadow-modal dark:border-gray-700 dark:bg-gray-800"
                align="start"
                alignOffset={-10}
              >
                <ModelSelectorRadioGroup
                  value={model}
                  onValueChange={setModel}
                  className="space-y-1"
                >
                  {v0Models.map((m) => (
                    <ModelSelectorRadioItem
                      key={m.value}
                      value={m.value}
                      icon={m.icon}
                      title={m.title}
                      className="min-h-0 px-2 py-1.5 **:data-[slot=model-selector-item-icon]:text-gray-600 dark:focus:bg-gray-900 dark:**:data-[slot=model-selector-item-icon]:text-gray-300 [&_.stroke-v0-gray-500]:stroke-gray-400 dark:[&_.stroke-v0-gray-500]:stroke-gray-600"
                      indicator={
                        <V0Check className="size-4 text-gray-500 dark:text-white" />
                      }
                    />
                  ))}
                </ModelSelectorRadioGroup>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button
              type="button"
              className={cn(
                "size-7 cursor-pointer gap-1 rounded-sm border border-gray-200 bg-gray-100/50 text-[13px] leading-6 font-normal text-gray-900 transition-all hover:bg-gray-200/80 active:scale-97 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600",
                isLoading &&
                  "w-fit bg-gray-800 text-white disabled:opacity-100 dark:bg-gray-50! dark:text-gray-900",
                input.trim() &&
                  "border-none bg-gray-800 text-white dark:bg-gray-50! dark:text-gray-900!",
              )}
              disabled={isLoading || !input.trim()}
              onClick={() => input.trim() && doSubmit(input)}
            >
              {isLoading ? (
                <>
                  <V0Disc className="size-4" />
                  <span>Stop</span>
                </>
              ) : (
                <V0ArrowUp className="size-4" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default V0Input;
