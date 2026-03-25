"use client";

import type { ComponentType } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import ClaudeInput from "@/components/nexus-ui/examples/prompt-input/claude-input";
import V0Input from "@/components/nexus-ui/examples/prompt-input/v0-input";
import GeminiInput from "@/components/nexus-ui/examples/prompt-input/gemini-input";
import ChatgptInput from "@/components/nexus-ui/examples/prompt-input/chatgpt-input";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import V0Icon from "@/components/svgs/v0";
import GeminiIcon from "@/components/svgs/gemini";
import ChatgptIcon from "@/components/svgs/chatgpt";
import type { HomeDemoSourceKey } from "./home-demo-sources";

export type HomeModelDemo = {
  key: HomeDemoSourceKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
  Component: ComponentType;
};

export const HOME_MODEL_DEMOS: HomeModelDemo[] = [
  { key: "claude", label: "Claude", icon: ClaudeIcon2, Component: ClaudeInput },
  { key: "v0", label: "v0", icon: V0Icon, Component: V0Input },
  { key: "gemini", label: "Gemini", icon: GeminiIcon, Component: GeminiInput },
  {
    key: "chatgpt",
    label: "ChatGPT",
    icon: ChatgptIcon,
    Component: ChatgptInput,
  },
];

type HomeDemoModelTabsProps = {
  tabs: HomeModelDemo[];
  value: HomeDemoSourceKey;
  onValueChange: (key: HomeDemoSourceKey) => void;
  className?: string;
};

export function HomeDemoModelTabs({
  tabs,
  value,
  onValueChange,
  className,
}: HomeDemoModelTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const activeTabElementRef = React.useRef<HTMLButtonElement>(null);

  const updateClipPath = React.useCallback(() => {
    const container = containerRef.current;
    const activeTabElement = activeTabElementRef.current;
    if (!container || !activeTabElement) return;

    const c = container.getBoundingClientRect();
    const b = activeTabElement.getBoundingClientRect();
    if (c.width <= 0 || c.height <= 0 || b.width <= 0 || b.height <= 0) {
      return;
    }

    // inset(top right bottom left): distances from each edge — matches viewport geometry
    const top = b.top - c.top;
    const right = c.right - b.right;
    const bottom = c.bottom - b.bottom;
    const left = b.left - c.left;

    container.style.clipPath = `inset(${Number((top / c.height) * 100).toFixed(3)}% ${Number((right / c.width) * 100).toFixed(3)}% ${Number((bottom / c.height) * 100).toFixed(3)}% ${Number((left / c.width) * 100).toFixed(3)}% round 9999px)`;
  }, []);

  React.useEffect(() => {
    updateClipPath();
  }, [value, updateClipPath]);

  React.useEffect(() => {
    const setupInitialClipPath = () => {
      const container = containerRef.current;
      if (container) {
        container.style.clipPath = "inset(100% 100% 100% 100%)";
        setTimeout(() => {
          updateClipPath();
        }, 10);
      }
    };

    const timer = setTimeout(setupInitialClipPath, 0);
    return () => clearTimeout(timer);
  }, [updateClipPath]);

  React.useEffect(() => {
    const handleResize = () => {
      updateClipPath();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [value, updateClipPath]);

  return (
    <div
      className={cn(
        "relative flex w-full flex-wrap items-center justify-center gap-2.5 md:h-full md:min-h-0 md:w-fit md:flex-col md:items-start md:justify-start",
        className,
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            ref={value === tab.key ? activeTabElementRef : null}
            type="button"
            onClick={() => onValueChange(tab.key)}
            className="inline-flex h-9 shrink-0 cursor-pointer! items-center justify-center gap-2 rounded-full border-none px-3 text-sm leading-none font-normal text-black/50 outline-none ring-0 focus:outline-none dark:text-white/50"
          >
            <Icon className="size-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-2.5 bg-black/5 md:flex-col md:items-start md:justify-start dark:bg-white/10"
        ref={containerRef}
        style={{
          transition: "clip-path 0.25s ease",
          clipPath: "inset(100% 100% 100% 100%)",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              tabIndex={-1}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border-none px-3 text-sm leading-none font-normal text-black/60 outline-none ring-0 dark:text-white/70"
            >
              <Icon className="size-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
