"use client";

import * as React from "react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLabel,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorSeparator,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import { Switch } from "@/components/ui/switch";

const models = [
  {
    value: "gpt-4o-mini",
    icon: ChatgptIcon,
    title: "GPT-4o Mini",
    description: "Fast and affordable",
  },
  {
    value: "claude-3.5",
    icon: ClaudeIcon2,
    title: "Claude 3.5",
    description: "Strong reasoning",
    disabled: true,
  },
];

export default function ModelSelectorWithItems() {
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [extendedThinking, setExtendedThinking] = React.useState(false);

  return (
    <ModelSelector value={model} onValueChange={setModel} items={models}>
      <ModelSelectorTrigger />
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
                disabled={m.disabled}
              />
            ))}
          </ModelSelectorRadioGroup>
        </ModelSelectorGroup>
        <ModelSelectorSeparator />
        <ModelSelectorItem
          onClick={() => setExtendedThinking(!extendedThinking)}
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
      </ModelSelectorContent>
    </ModelSelector>
  );
}
