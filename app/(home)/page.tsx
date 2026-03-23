"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useState } from "react";
import {
  tabs,
  inputComponents,
  codeSnippets,
  type TabKey,
} from "../../components/demo-tabs";
import { GithubIcon } from "@/components/navbar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("claude");
  const [checked, setChecked] = useState(false);

  const code = codeSnippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setChecked(true);
    setTimeout(() => {
      setChecked(false);
    }, 2000);
  };
  return (
    <main className="flex h-full min-h-screen w-full flex-col overflow-auto bg-white pt-0 lg:h-screen lg:pt-0 dark:bg-gray-900">
      <div className="relative flex h-[352px] w-full shrink-0 flex-col items-center justify-center overflow-hidden rounded-b-[20px] bg-gray-950 md:border-none lg:h-[480px] lg:rounded-b-[24px] dark:border-b dark:border-b-gray-800">
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="hidde absolute inset-0"
        >
          <pattern
            id="pattern-checkers"
            x="0"
            y="0"
            width="100%"
            height="26"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-68.23)"
          >
            <line
              x1="0"
              y1="7"
              x2="100%"
              y2="7"
              stroke="#171717"
              strokeDasharray="8 4"
            />
          </pattern>

          <rect
            x="0%"
            y="0"
            width="100%"
            height="100%"
            fill="url(#pattern-checkers)"
          ></rect>
        </svg>

        <div className="px-auto z-10 flex w-fit flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <h1 className="text-center text-2xl leading-[38px] font-[450] tracking-[-0.8px] text-gray-50 lg:text-[32px]">
              Build Better AI Interfaces
            </h1>
            <p className="w-[272px] text-center text-sm leading-6 font-[350] text-gray-400 lg:w-[317px] lg:text-base">
              Beautiful, composable components for building AI-native
              applications.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              className="w-fit rounded-full bg-gray-100 text-sm leading-6 font-normal text-gray-900 hover:bg-gray-300"
              asChild
            >
              <Link href="/docs">Get Started</Link>
            </Button>
            <Button
              className="w-fit gap-1.5 rounded-full bg-gray-800 px-4! text-sm leading-6 font-normal text-white hover:bg-gray-700"
              asChild
            >
              <Link
                href="https://github.com/victorcodess/nexus-ui"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon />
                Star on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-full w-full flex-col gap-6 overflow-hidden px-4 pt-0 pb-4 md:h-[calc(100vh-352px)] md:flex-row md:gap-4 md:px-6 md:py-4 lg:h-[calc(100vh-480px)]">
        <div className="order-2 flex h-full w-full flex-wrap items-center justify-center gap-2 md:order-1 md:h-full md:w-fit md:flex-col md:items-start md:justify-start">
          <Button className="w-fit rounded-full bg-gray-100 text-sm leading-6 font-normal text-gray-900 hover:bg-gray-300">
            Prompt Input
          </Button>
          <Button className="w-fit rounded-full bg-transparent text-sm leading-6 font-normal text-gray-400 hover:bg-gray-100 hover:text-gray-900">
            Model Selector
          </Button>
          <Button className="w-fit rounded-full bg-transparent text-sm leading-6 font-normal text-gray-400 hover:bg-gray-100 hover:text-gray-900">
            Suggestions
          </Button>
          <Button className="hidden w-fit rounded-full bg-transparent text-sm leading-6 font-normal text-gray-400 hover:bg-gray-100 hover:text-gray-900 md:flex">
            See all
          </Button>
        </div>

        <div className="relative order-1 h-full w-full md:order-2 md:w-1/2">
          <div className="absolute top-4 right-4 z-10 flex h-8 w-fit items-center justify-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "group relative size-8 cursor-pointer gap-1 rounded-full text-sm leading-6 font-normal",
                    isActive
                      ? "bg-gray-200 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-800"
                      : "bg-transparent text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-800",
                  )}
                >
                  <Icon className="size-4" />
                  <span
                    className={cn(
                      "pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                    )}
                  >
                    {tab.label}
                  </span>
                </Button>
              );
            })}
          </div>
          <div className="flex h-full w-full flex-col items-center justify-end rounded-b-[20px] bg-gray-100 p-3 pt-21.5 md:rounded-[24px] lg:p-6 dark:bg-gray-950">
            {inputComponents[activeTab]}
          </div>
        </div>

        <div className="order-3 h-full w-full overflow-hidden md:w-1/2">
          <div className="lg:[&_.fd-scroll-container]:ma x-h-10 relative h-full w-full overflow-hidden rounded-[24px] bg-gray-100 dark:bg-gray-950 [&_.fd-scroll-container]:no-scrollbar [&_.fd-scroll-container]:max-h-none [&_.fd-scroll-container]:py-7 [&_.fd-scroll-container]:pr-3.5 [&_.fd-scroll-container]:pl-7 lg:[&_.fd-scroll-container]:h-full [&_.lucide-clipboard]:hidden [&_div.absolute.top-3.right-2]:hidden [&_pre]:text-sm [&_pre]:leading-6 [&>figure]:h-full [&>figure]:rounded-[24px] [&>figure]:border-none [&>figure]:bg-transparent [&>figure]:shadow-none">
            <DynamicCodeBlock lang="ts" code={code} />

            <button
              className="absolute top-5 right-5 flex size-7 z-1 cursor-pointer items-center justify-center text-gray-500"
              onClick={handleCopy}
            >
              {checked ? (
                <HugeiconsIcon
                  icon={Tick01Icon}
                  strokeWidth={1.75}
                  className="size-5"
                />
              ) : (
                <HugeiconsIcon
                  icon={Copy01Icon}
                  strokeWidth={1.75}
                  className="size-4.5"
                />
              )}
            </button>
            <div
              className={cn(
                "absolute top-0 right-0 z-0 size-20 rounded-full rounded-tr-lg bg-linear-to-l",
                "from-gray-100 from-65% to-95% to-gray-100/0 dark:from-gray-950 dark:to-gray-950/0",
              )}
            ></div>
          </div>
        </div>
      </div>
    </main>
  );
}
