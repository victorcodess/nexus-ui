"use client";

import * as React from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorSearch,
  ModelSelectorEmpty,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import GeminiIcon from "@/components/svgs/gemini";

const models = [
  {
    value: "gpt-4",
    icon: ChatgptIcon,
    title: "GPT-4",
    description: "Most capable, best for complex tasks",
  },
  {
    value: "gpt-4-turbo",
    icon: ChatgptIcon,
    title: "GPT-4 Turbo",
    description: "Lower latency GPT-4 class model",
  },
  {
    value: "gpt-4o",
    icon: ChatgptIcon,
    title: "GPT-4o",
    description: "Multimodal flagship",
  },
  {
    value: "gpt-4o-mini",
    icon: ChatgptIcon,
    title: "GPT-4o Mini",
    description: "Fast and affordable",
  },
  {
    value: "o1",
    icon: ChatgptIcon,
    title: "o1",
    description: "Reasoning-optimized for hard problems",
  },
  {
    value: "o3-mini",
    icon: ChatgptIcon,
    title: "o3-mini",
    description: "Compact reasoning model",
  },
  {
    value: "claude-3-opus",
    icon: ClaudeIcon2,
    title: "Claude 3 Opus",
    description: "Highest capability Claude 3",
  },
  {
    value: "claude-3.5",
    icon: ClaudeIcon2,
    title: "Claude 3.5 Sonnet",
    description: "Strong reasoning and analysis",
  },
  {
    value: "claude-3-sonnet",
    icon: ClaudeIcon2,
    title: "Claude 3 Sonnet",
    description: "Balanced speed and quality",
  },
  {
    value: "claude-3-haiku",
    icon: ClaudeIcon2,
    title: "Claude 3 Haiku",
    description: "Lightweight and quick",
  },
  {
    value: "gemini-2.0-flash",
    icon: GeminiIcon,
    title: "Gemini 2.0 Flash",
    description: "Latest fast Gemini",
  },
  {
    value: "gemini-1.5-pro",
    icon: GeminiIcon,
    title: "Gemini 1.5 Pro",
    description: "Long context and reasoning",
  },
  {
    value: "gemini-1.5-flash",
    icon: GeminiIcon,
    title: "Gemini 1.5 Flash",
    description: "Fast and versatile",
  },
  {
    value: "gemini-1.5-flash-8b",
    icon: GeminiIcon,
    title: "Gemini 1.5 Flash 8B",
    description: "Smallest Gemini for simple tasks",
  },
];

export default function ModelSelectorWithSearch() {
  const [model, setModel] = React.useState("gpt-4");

  return (
    <ModelSelector value={model} onValueChange={setModel} items={models}>
      <ModelSelectorTrigger variant="ghost" />
      <ModelSelectorContent className="w-[264px] pt-0 [--model-selector-content-max-height:311px]" align="start">
        <ModelSelectorSearch
          placeholder="Search models"
          aria-label="Filter models"
        />
        <ModelSelectorGroup>
          <ModelSelectorRadioGroup value={model} onValueChange={setModel}>
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
        <ModelSelectorEmpty />
      </ModelSelectorContent>
    </ModelSelector>
  );
}
