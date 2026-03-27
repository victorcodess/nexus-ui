"use client";

import * as React from "react";
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
import { AiMagicIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const models = [
  { value: "gpt-4", icon: ChatgptIcon, title: "GPT-4" },
  { value: "gpt-4o-mini", icon: ChatgptIcon, title: "GPT-4o Mini" },
  { value: "claude-3.5", icon: ClaudeIcon2, title: "Claude 3.5" },
  { value: "gemini-1.5-flash", icon: GeminiIcon, title: "Gemini 1.5 Flash" },
];

export default function ModelSelectorCustomTrigger() {
  const [model, setModel] = React.useState("gpt-4");
  const selected = models.find((m) => m.value === model);

  return (
    <ModelSelector value={model} onValueChange={setModel} items={models}>
      <ModelSelectorTrigger variant="outline" className="gap-2">
        <HugeiconsIcon
          icon={AiMagicIcon}
          strokeWidth={2.0}
          className="size-3.5 text-gray-500 dark:text-gray-400"
        />
        <span className="text-gray-500 dark:text-gray-400">Using</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {selected?.title ?? model}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2.0}
          className="size-4 shrink-0 text-gray-400 dark:text-gray-500"
        />
      </ModelSelectorTrigger>
      <ModelSelectorContent className="w-[264px]" align="start">
        <ModelSelectorGroup>
          <ModelSelectorLabel>Select model</ModelSelectorLabel>
          <ModelSelectorRadioGroup value={model} onValueChange={setModel}>
            {models.map((m) => (
              <ModelSelectorRadioItem
                key={m.value}
                value={m.value}
                icon={m.icon}
                title={m.title}
              />
            ))}
          </ModelSelectorRadioGroup>
        </ModelSelectorGroup>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
