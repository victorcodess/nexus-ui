"use client";

import * as React from "react";
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
import V0Icon from "@/components/svgs/v0";
import GeminiIcon from "@/components/svgs/gemini";
import { Switch } from "@/components/ui/switch";

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
  },
  {
    value: "claude",
    icon: ClaudeIcon2,
    title: "Claude 3.5",
    description: "Strong reasoning and analysis",
  },
];

const v0Models = [
  {
    value: "v0-auto",
    title: "v0 Auto",
  },
  {
    value: "v0-mini",
    title: "v0 Mini",
  },
  {
    value: "v0-pro",
    title: "v0 Pro",
  },
  {
    value: "v0-max",
    title: "v0 Max",
  },
  {
    value: "v0-max-fast",
    title: "v0 Max Fast",
  },
];

const geminiModels = [
  {
    value: "gemini-1.5-pro",
    title: "Gemini 1.5 Pro",
    icon: GeminiIcon,
    disabled: true,
  },
  {
    value: "gemini-1.5-flash",
    title: "Gemini 1.5 Flash",
    description: "Fast and affordable",
  },
  {
    value: "gemini-1.5-flash-lite",
    title: "Gemini 1.5 Flash Lite",
    icon: GeminiIcon,
  },
  {
    value: "gemini-1.5-flash-lite-preview",
    title: "Gemini 1.5 Flash Lite Preview",
  },
];

export default function ModelSelectorDefault() {
  const [model, setModel] = React.useState("gpt-4");
  const [v0Model, setV0Model] = React.useState("v0-auto");
  const [geminiModel, setGeminiModel] = React.useState("gemini-1.5-pro");
  const [extendedThinking, setExtendedThinking] = React.useState(false);

  return (
    <ModelSelector value={model} onValueChange={setModel} items={models} open>
      <ModelSelectorTrigger />
      <ModelSelectorContent className="w-[264px]" align="start">
        <ModelSelectorGroup>
          <ModelSelectorLabel>Select Model</ModelSelectorLabel>
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
          <ModelSelectorLabel>Vercel Models</ModelSelectorLabel>
          <ModelSelectorSub>
            <ModelSelectorSubTrigger>
              <V0Icon className="size-4" />
              v0 Models
            </ModelSelectorSubTrigger>
            <ModelSelectorPortal>
              <ModelSelectorSubContent>
                <ModelSelectorRadioGroup
                  value={v0Model}
                  onValueChange={setV0Model}
                >
                  {v0Models.map((m) => (
                    <ModelSelectorRadioItem
                      key={m.value}
                      value={m.value}
                      title={m.title}
                    />
                  ))}
                </ModelSelectorRadioGroup>
              </ModelSelectorSubContent>
            </ModelSelectorPortal>
          </ModelSelectorSub>
        </ModelSelectorGroup>
        <ModelSelectorSeparator />
        <ModelSelectorItem
          onClick={() => setExtendedThinking(!extendedThinking)}
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.25">
              <p>Extended thinking</p>
              <p className="text-xs font-[350] text-gray-400">
                Think longer for complex tasks
              </p>
            </div>
            <Switch
              checked={extendedThinking}
              onCheckedChange={setExtendedThinking}
              className="data-[state=checked]:bg-gray-600"
            />
          </div>
        </ModelSelectorItem>
        <ModelSelectorSeparator />
        <ModelSelectorGroup>
          <ModelSelectorLabel>Gemini model</ModelSelectorLabel>
          <ModelSelectorRadioGroup
            value={geminiModel}
            onValueChange={setGeminiModel}
          >
            {geminiModels.map((m) => (
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
      </ModelSelectorContent>
    </ModelSelector>
  );
}
