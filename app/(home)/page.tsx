"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import NexusIcon from "@/components/layout/svgs/nexus";
import ChatgptIcon from "@/components/layout/svgs/chatgpt";
import ClaudeIcon from "@/components/layout/svgs/claude";
import GeminiIcon from "@/components/layout/svgs/gemini";
import ChatgptInput from "@/components/nexus-ui/examples/chatgpt-input";
import NexusInput from "@/components/nexus-ui/examples/nexus-input";
import { Check, Copy } from "lucide-react";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useState } from "react";
import GeminiInput from "@/components/nexus-ui/examples/gemini-input";

const lightStripes = {
  background:
    "repeating-linear-gradient(-45deg, #f5f5f5, #f5f5f5 14px, #f0f0f0 14px, #f0f0f0 16px)",
  borderImageSource:
    "repeating-linear-gradient(to bottom, #e5e5e5 0px, #e5e5e5 10px, transparent 10px, transparent 20px)",
};
const darkStripes = {
  background:
    "repeating-linear-gradient(-45deg, #1a1a1a, #1a1a1a 14px, #262626 14px, #262626 16px)",
  borderImageSource:
    "repeating-linear-gradient(to bottom, #404040 0px, #404040 10px, transparent 10px, transparent 20px)",
};
const borderImageStyle = {
  borderStyle: "dashed" as const,
  borderImageSlice: 1,
};

function StripedPanel({
  className,
  borderSide,
  children,
}: {
  className: string;
  borderSide: "left" | "right";
  children?: React.ReactNode;
}) {
  const borderClass = borderSide === "right" ? "border-r" : "lg:border-l";
  const showTopBorderLine = borderSide === "left";
  return (
    <div className={`relative ${className}`}>
      {/* Dedicated top border (mobile only) – gradient dashes with wider spacing */}
      {showTopBorderLine && (
        <>
          <div
            className="absolute top-0 right-0 left-0 z-10 h-[1.5px] lg:hidden! dark:hidden"
            style={{
              background:
                "repeating-linear-gradient(to right, #e5e5e5 0px, #e5e5e5 14px, transparent 14px, transparent 24px)",
            }}
            aria-hidden
          />
          <div
            className="absolute top-0 right-0 left-0 z-10 hidden h-[1.5px] lg:hidden! dark:block"
            style={{
              background:
                "repeating-linear-gradient(to right, #404040 0px, #404040 14px, transparent 14px, transparent 24px)",
            }}
            aria-hidden
          />
        </>
      )}
      {/* Light mode – dashed border only on inner layer */}
      <div
        className={`absolute inset-0 dark:hidden ${borderClass} border-transparent`}
        style={{ ...lightStripes, ...borderImageStyle }}
        aria-hidden
      />
      {/* Dark mode */}
      <div
        className={`absolute inset-0 hidden dark:block ${borderClass} border-transparent`}
        style={{ ...darkStripes, ...borderImageStyle }}
        aria-hidden
      />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

export default function HomePage() {
  const code = `import * as React from "react";

import { Button } from "@/components/ui/button";
import PromptInput, {
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { ArrowUp, Paperclip } from "lucide-react";

const NexusInput = () => {
  return (
    <PromptInput>
      <PromptInputTextarea />
      <PromptInputActions>
        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full border-none bg-transparent text-[13px] leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
              <Paperclip />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>

        <PromptInputActionGroup>
          <PromptInputAction asChild>
            <Button className="size-8 cursor-pointer gap-1 rounded-full bg-[#404040] text-[13px] leading-6 font-normal text-white hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
              <ArrowUp />
            </Button>
          </PromptInputAction>
        </PromptInputActionGroup>
      </PromptInputActions>
    </PromptInput>
  );
};

export default NexusInput;
`;

  const [checked, setChecked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setChecked(true);
    setTimeout(() => {
      setChecked(false);
    }, 2000);
  };
  return (
    <main className="flex h-full min-h-screen w-full overflow-auto pt-12 lg:h-screen lg:pt-0">
      <StripedPanel
        className="hidden h-full w-20 shrink-0 lg:block 2xl:w-40"
        borderSide="right"
      />

      <div className="flex w-full flex-col lg:h-full lg:w-[calc(100%-80px)] lg:flex-row 2xl:w-[calc(100%-160px)]">
        <div className="flex h-auto w-full flex-col items-center justify-center lg:h-full lg:w-1/2 lg:items-start lg:justify-end">
          <div className="px-auto flex w-fit flex-col items-center gap-4 py-15 lg:items-start lg:p-10">
            <div className="flex flex-col items-center gap-1 lg:items-start">
              <h1 className="text-2xl leading-[38px] font-medium tracking-[-0.8px] lg:text-[32px]">
                Build Better AI Interfaces
              </h1>
              <p className="w-[272px] text-center text-sm leading-6 font-normal text-[#737373] lg:w-[317px] lg:text-left lg:text-base">
                Flexible, customizable components engineered for modern AI
                experiences.
              </p>
            </div>
            <Button
              className="w-fit rounded-full text-sm leading-6 font-normal"
              asChild
            >
              <Link href="/docs">Get Started</Link>
            </Button>
          </div>
        </div>

        <StripedPanel
          className="h-full min-h-[500px] w-full flex-1 lg:h-full lg:w-1/2"
          borderSide="left"
        >
          <div className="flex h-full w-full flex-col items-center px-4 lg:justify-between lg:px-6">
            <div className="flex w-full flex-col items-center justify-end rounded-b-[40px] border-x border-b border-[#E5E5E5] bg-white p-3 pt-21.5 lg:h-16/51 lg:p-7 dark:border-white/10 dark:bg-background">
              <GeminiInput />
            </div>

            <div className="flex w-full flex-wrap items-center justify-center gap-2 py-6 lg:h-4/51 lg:py-0">
              <Button className="w-fit cursor-pointer gap-1 rounded-full bg-[#E5E5E5] text-sm leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:bg-[#404040] dark:text-white">
                <NexusIcon className="size-4" />
                Nexus
              </Button>

              <Button className="w-fit cursor-pointer gap-1 rounded-full bg-transparent text-sm leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
                <GeminiIcon className="size-4" />
                Gemini
              </Button>
              <Button className="w-fit cursor-pointer gap-1 rounded-full bg-transparent text-sm leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
                <ChatgptIcon className="size-4" />
                ChatGPT
              </Button>
              <Button className="w-fit cursor-pointer gap-1 rounded-full bg-transparent text-sm leading-6 font-normal text-[#171717] hover:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040]">
                <ClaudeIcon className="size-4" />
                Claude
              </Button>
            </div>

            <div className="relative w-full rounded-t-[40px] border-x border-t border-[#E5E5E5] bg-white lg:h-31/51 dark:border-white/10 dark:bg-background [&_.fd-scroll-container]:max-h-none! lg:[&_.fd-scroll-container]:h-full [&_.lucide-clipboard]:hidden [&_div.absolute.top-3.right-2]:hidden [&_pre]:text-sm [&_pre]:leading-6 [&>figure]:h-full [&>figure]:rounded-none [&>figure]:border-none [&>figure]:bg-transparent [&>figure]:py-3.5 [&>figure]:pr-3.5 [&>figure]:pl-7 [&>figure]:shadow-none">
              <DynamicCodeBlock lang="ts" code={code} />

              <button
                className="bor der absolute top-5 right-5 flex size-7 cursor-pointer items-center justify-center text-[#737373]"
                onClick={handleCopy}
              >
                {checked ? (
                  <Check className="size-4.5" />
                ) : (
                  <Copy className="size-4.5" />
                )}
              </button>
            </div>
          </div>
        </StripedPanel>
      </div>
    </main>
  );
}
