import NexusIcon from "@/components/svgs/nexus";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import GeminiIcon from "@/components/svgs/gemini";
import ChatgptInput from "@/components/nexus-ui/examples/prompt-input/chatgpt-input";

import ClaudeInput from "@/components/nexus-ui/examples/prompt-input/claude-input";
import GeminiInput from "@/components/nexus-ui/examples/prompt-input/gemini-input";
import V0Input from "@/components/nexus-ui/examples/prompt-input/v0-input";
import V0Icon from "@/components/svgs/v0";

export type TabKey = "gemini" | "chatgpt" | "claude" | "v0";

export const tabs: { key: TabKey; label: string; icon: typeof NexusIcon }[] = [
  { key: "claude", label: "Claude", icon: ClaudeIcon2 },
  { key: "v0", label: "v0", icon: V0Icon },
  { key: "gemini", label: "Gemini", icon: GeminiIcon },
  { key: "chatgpt", label: "ChatGPT", icon: ChatgptIcon },
];

export const inputComponents: Record<TabKey, React.ReactNode> = {
  gemini: <GeminiInput />,
  chatgpt: <ChatgptInput />,
  claude: <ClaudeInput />,
  v0: <V0Input />,
};

export const codeSnippets: Record<TabKey, string> = {
  gemini: `import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import {
  GeminiAdd,
  GeminiPageInfo,
  GeminiMic,
  GeminiCaret,
} from "@/components/svgs/gemini-icons";

const GeminiInput = () => {
  return (
    <PromptInput className="rounded-[32px] p-3 shadow-none">
      <PromptInputTextarea
        placeholder="Ask Gemini 3"
        className="min-h-12 px-3 py-2.25 text-base! placeholder:text-base"
      />
      <PromptInputActions className="px-0 pt-2 pb-0">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-10 cursor-pointer rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <GeminiAdd className="size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="size-10 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <GeminiPageInfo className="size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="h-10 cursor-pointer gap-1.75 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <span>Fast</span>
              <GeminiCaret className="-mb-0.5 size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="size-10 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <GeminiMic className="size-5 text-[#5D5D5D]" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default GeminiInput;`,

  chatgpt: `import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { AudioLines, Globe, Paperclip } from "lucide-react";

const ChatgptInput = () => {
  return (
    <PromptInput className="rounded-[28px] shadow-none">
      <PromptInputTextarea
        placeholder="Ask anything"
        className="min-h-16 px-6"
      />
      <PromptInputActions className="px-3 py-2.5">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <Paperclip className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Attach</span>
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full border border-border-primary bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <Globe className="size-4 text-[#5D5D5D]" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="w-9 cursor-pointer gap-1 rounded-full bg-gray-200 text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 sm:w-fit dark:bg-gray-700 dark:text-white">
              <AudioLines className="size-4" />
              <span className="hidden sm:inline">Voice</span>
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ChatgptInput;`,

  claude: `import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp, AudioLines, Paperclip } from "lucide-react";
import {
  ClaudeAdd,
  ClaudeAudioLines,
  ClaudeCaret,
} from "@/components/svgs/claude-icons";

const ClaudeInput = () => {
  return (
    <PromptInput className="gap-3 rounded-[20px] p-3.5 shadow-none">
      <PromptInputTextarea
        placeholder="How can I help you today?"
        className="min-h-12 px-1.5 py-1.5 placeholder:text-base"
      />
      <PromptInputActions className="px-1 py-0">
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-md border-none bg-transparent text-[13px] leading-6 font-normal text-[#5D5D5D] hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <ClaudeAdd className="size-5" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="h-8 cursor-pointer gap-1 rounded-md bg-transparent pr-2! text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <span>Sonnet 4.6</span>
              <ClaudeCaret className="size-4" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-md bg-transparent text-[13px] leading-6 font-normal text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700">
              <ClaudeAudioLines className="size-5" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default ClaudeInput;`,

  v0: `"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
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
  ModelSelectorItemTitle,
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
} from "@/components/svgs/v0-icons";

const v0Models = [
  { value: "auto", title: "v0 Auto", Icon: V0TierAuto },
  { value: "mini", title: "v0 Mini", Icon: V0TierMini },
  { value: "pro", title: "v0 Pro", Icon: V0TierPro },
  { value: "max", title: "v0 Max", Icon: V0TierMax },
  { value: "max-fast", title: "v0 Max Fast", Icon: V0TierMaxFast },
] as const;

const V0Input = () => {
  const [model, setModel] = React.useState("pro");
  const selected = v0Models.find((m) => m.value === model) ?? v0Models[2];
  const SelectedIcon = selected.Icon;
  return (
    <PromptInput className="gap-2 rounded-xl p-3 shadow-none">
      <PromptInputTextarea placeholder="Ask v0 to build..." />
      <PromptInputActions className="px-0 py-0">
        <PromptInputActionGroup className="gap-1">
          <PromptInputAction asChild>
            <Button type="button" className="size-7 rounded-sm bg-transparent">
              <V0Plus className="size-4" />
            </Button>
          </PromptInputAction>
          <PromptInputAction asChild>
            <ModelSelector
              value={model}
              onValueChange={setModel}
              items={v0Models.map(({ value, title, Icon }) => ({
                value,
                title,
                icon: Icon,
              }))}
            >
              <ModelSelectorTrigger variant="ghost" className="h-7 gap-1 rounded-sm">
                <SelectedIcon className="size-5 shrink-0" />
                <span>{selected.title}</span>
                <V0Caret className="size-4" />
              </ModelSelectorTrigger>
              <ModelSelectorContent className="rounded-xl border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-100">
                <ModelSelectorGroup>
                  <ModelSelectorRadioGroup value={model} onValueChange={setModel}>
                    {v0Models.map((m) => (
                      <ModelSelectorRadioItem
                        key={m.value}
                        value={m.value}
                        indicator={<Check className="size-4 text-white" strokeWidth={2.5} />}
                      >
                        <m.Icon className="size-8 shrink-0" />
                        <ModelSelectorItemTitle>{m.title}</ModelSelectorItemTitle>
                      </ModelSelectorRadioItem>
                    ))}
                  </ModelSelectorRadioGroup>
                </ModelSelectorGroup>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputAction>
        </PromptInputActionGroup>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button type="button" className="size-7 rounded-sm border">
              <V0ArrowUp className="size-4" />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default V0Input;`,
};
