"use client";

import * as React from "react";
import {
  ModelSelector,
  ModelSelectorCheckboxItem,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import GeminiIcon from "@/components/svgs/gemini";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
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

export default function ModelSelectorWithCheckbox() {
  const [selected, setSelected] = React.useState<string[]>([]);

  const toggle = (value: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  };

  const triggerLabel =
    selected.length === 0
      ? "Select models"
      : selected.length === 1
        ? (models.find((m) => m.value === selected[0])?.title ?? selected[0])
        : `${selected.length} models`;

  return (
    <ModelSelector
      value={selected[0] ?? ""}
      onValueChange={() => {}}
      items={models}
    >
      <ModelSelectorTrigger variant="outline">
        <span className="truncate">{triggerLabel}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2.0} className="size-4 shrink-0" />
      </ModelSelectorTrigger>
      <ModelSelectorContent className="w-[264px]" align="start">
        <ModelSelectorGroup>
          <ModelSelectorLabel>Enabled models</ModelSelectorLabel>
          {models.map((m) => (
            <ModelSelectorCheckboxItem
              key={m.value}
              checked={selected.includes(m.value)}
              onCheckedChange={(checked) => toggle(m.value, !!checked)}
              icon={m.icon}
              title={m.title}
              description={m.description}
            />
          ))}
        </ModelSelectorGroup>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
