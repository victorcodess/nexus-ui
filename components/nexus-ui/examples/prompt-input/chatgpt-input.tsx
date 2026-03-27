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
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import {
  ArrowDown01Icon,
  Mic02Icon,
  PlusSignIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const chatgptModels = [
  { value: "gpt-4o", title: "GPT-4o" },
  { value: "gpt-4", title: "GPT-4" },
  { value: "o3-mini", title: "o3-mini" },
];

const ChatgptInput = () => {
  const [model, setModel] = React.useState("gpt-4o");

  const selectedTitle =
    chatgptModels.find((m) => m.value === model)?.title ?? "GPT-4o";

  return (
    <PromptInput className="rounded-[28px] shadow-lg">
      <PromptInputTextarea
        placeholder="Ask anything"
        className="min-h-16 px-6"
      />
      <PromptInputActions className="px-3 py-2.5">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Attach</span>
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2.0} className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <ModelSelector
              value={model}
              onValueChange={setModel}
              items={chatgptModels}
            >
              <ModelSelectorTrigger
                variant="ghost"
                className="h-9 gap-1 rounded-full border border-border-primary px-2.5 text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 sm:h-9 sm:px-3 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                <span className="max-w-28 truncate sm:max-w-none">
                  {selectedTitle}
                </span>
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2.0} className="size-4 shrink-0 opacity-60" />
              </ModelSelectorTrigger>
              <ModelSelectorContent
                className="min-w-[200px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-modal dark:border-gray-700 dark:bg-gray-800"
                align="start"
              >
                <ModelSelectorGroup>
                  <ModelSelectorRadioGroup
                    value={model}
                    onValueChange={setModel}
                  >
                    {chatgptModels.map((m) => (
                      <ModelSelectorRadioItem
                        key={m.value}
                        value={m.value}
                        title={m.title}
                        indicator={
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            strokeWidth={2.0}
                            className="size-4 text-gray-900 dark:text-white"
                          />
                        }
                        className="rounded-md px-2 py-1.5 focus:bg-gray-100 dark:focus:bg-gray-900"
                      />
                    ))}
                  </ModelSelectorRadioGroup>
                </ModelSelectorGroup>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full bg-gray-200 text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <HugeiconsIcon icon={Mic02Icon} strokeWidth={2.0} className="size-4" />
              <span className="hidden sm:inline">Voice</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ChatgptInput;
