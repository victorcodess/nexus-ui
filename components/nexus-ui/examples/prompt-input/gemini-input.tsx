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
import { Square } from "lucide-react";
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
    <PromptInput
      onSubmit={doSubmit}
      className="rounded-[32px] p-3 shadow-none bg-gray-100 border-none"
    >
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
              className="size-10 cursor-pointer rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] transition-[color,transform] hover:bg-gray-200 active:scale-97 dark:text-white dark:hover:bg-gray-700"
            >
              <GeminiAdd className="size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button
              type="button"
              className="h-10 cursor-pointer gap-1.75 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] transition-[color,transform] hover:bg-gray-200 active:scale-97 dark:text-white dark:hover:bg-gray-700"
            >
              <GeminiPageInfo className="size-5 text-[#5D5D5D]" />
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
                className="h-10 gap-1.75 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] transition-[color,transform] hover:bg-gray-200 active:scale-97 dark:text-white dark:hover:bg-gray-700 data-[state=open]:bg-gray-200"
              >
                <span>
                  {geminiModels.find((m) => m.value === model)?.title ?? "Fast"}
                </span>
                <GeminiCaret className="-mb-0.5 size-5 text-[#5D5D5D]" />
              </ModelSelectorTrigger>
              <ModelSelectorContent
                className="w-[320px] rounded-2xl border-none px-0 py-2 shadow-none bg-gray-200"
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
                          <GeminiCheck className="text-blue-500 dark:text-blue-400 size-6" />
                        }
                        className="gap-10 rounded-none px-4 **:data-[slot=model-selector-radio-item-indicator]:right-4 focus:bg-gray-100/50"
                      />
                    ))}
                  </ModelSelectorRadioGroup>
                </ModelSelectorGroup>

                <ModelSelectorItem
                  asChild
                  className="pointer-events-none [&>*:last-child]:pointer-events-auto focus:bg-transparent  dark:focus:bg-transparent py-0 rounded-none px-4"
                >
                  <div className="flex w-full items-center justify-between gap-2 px-4">
                    <div className="flex flex-col gap-0.25">
                      <p className="text-sm font-normal text-gray-900 dark:text-gray-100">
                        Upgrade to Google AI Plus
                      </p>
                      <p className="text-xs font-[350] text-gray-400 dark:text-gray-400">
                        Get access to select Pro features
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="rounded-full bg-transparent px-3 text-sm font-medium text-blue-500 transition-[color,transform] hover:bg-blue-50 active:scale-97 dark:text-blue-400 dark:hover:bg-blue-400/25"
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
                "size-10 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] transition-[color,transform] hover:bg-gray-200 active:scale-97 disabled:opacity-70 dark:text-white dark:hover:bg-gray-700",
                isLoading && "bg-blue-100 dark:bg-blue-50",
              )}
              disabled={isLoading}
              onClick={() => input.trim() && doSubmit(input)}
            >
              {isLoading ? (
                <Square className="size-3.5 fill-current text-blue-400" />
              ) : input.trim() ? (
                <GeminiSend className="size-5 text-[#5D5D5D]" />
              ) : (
                <GeminiMic className="size-5 text-[#5D5D5D]" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default GeminiInput;
