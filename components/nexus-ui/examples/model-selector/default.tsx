"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLabel,
  ModelSelectorPortal,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorSeparator,
  ModelSelectorSub,
  ModelSelectorSubContent,
  ModelSelectorSubTrigger,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";

const models = [
  {
    value: "gpt-4",
    icon: ChatgptIcon,
    title: "GPT-4",
    description: "Most capable, best for complex tasks",
  },
  {
    value: "gpt-4o-mini",
    icon: ChatgptIcon,
    title: "GPT-4o Mini",
    description: "Fast and affordable",
  },
  {
    value: "claude",
    icon: ClaudeIcon2,
    title: "Claude 3.5",
    description: "Strong reasoning and analysis",
  },
];

export default function ModelSelectorDefault() {
  const [model, setModel] = React.useState("gpt-4");

  return (
    <ModelSelector value={model} onValueChange={setModel} items={models} open>
      <ModelSelectorTrigger>

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
                description={m.description}
              />
            ))}
          </ModelSelectorRadioGroup>
        </ModelSelectorGroup>
        <ModelSelectorGroup>
          <ModelSelectorLabel>Select model</ModelSelectorLabel>
          <ModelSelectorSub>
            <ModelSelectorSubTrigger>All models</ModelSelectorSubTrigger>
            <ModelSelectorPortal>
              <ModelSelectorSubContent>
                <ModelSelectorItem>GPT-4</ModelSelectorItem>
                <ModelSelectorItem>GPT-4o Mini</ModelSelectorItem>
                <ModelSelectorSeparator />
                <ModelSelectorItem>Claude 3.5</ModelSelectorItem>
              </ModelSelectorSubContent>
            </ModelSelectorPortal>
          </ModelSelectorSub>
        </ModelSelectorGroup>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
