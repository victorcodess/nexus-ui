"use client";

import * as React from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { HomeDemoSourceKey } from "./home-demo-sources";
import { homeDemoSources } from "./home-demo-sources";
import {
  HOME_MODEL_DEMOS,
  HomeDemoModelTabs,
} from "./home-demo-model-tabs";

export function HomeDemoSection() {
  const [activeModel, setActiveModel] =
    React.useState<HomeDemoSourceKey>("claude");
  const [checked, setChecked] = React.useState(false);

  const active =
    HOME_MODEL_DEMOS.find((d) => d.key === activeModel) ?? HOME_MODEL_DEMOS[0];
  const Preview = active.Component;
  const code = homeDemoSources[active.key];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setChecked(true);
    setTimeout(() => {
      setChecked(false);
    }, 2000);
  };

  return (
    <div className="flex h-[calc(100vh-352px)] min-h-0 w-full flex-col justify-between gap-6 overflow-hidden px-4 pt-0 pb-4 md:flex-row md:gap-4 md:px-6 md:py-4 lg:h-[calc(100vh-480px)]">
      <div className="order-2 flex h-fit w-full shrink-0 md:order-1 md:h-full md:min-h-0 md:w-fit md:shrink">
        <HomeDemoModelTabs
          tabs={HOME_MODEL_DEMOS}
          value={activeModel}
          onValueChange={setActiveModel}
        />
      </div>

      <div className="order-1 h-[calc(100%-64px)] min-h-0 w-full sm:h-[200px] md:order-2 md:h-full md:w-1/2">
        <div className="flex h-full w-full flex-col items-center justify-end rounded-b-[20px] bg-gray-100 p-3 md:rounded-[24px] lg:p-6 dark:bg-gray-950">
          <Preview />
        </div>
      </div>

      <div className="order-3 hidden min-h-0 w-full flex-1 flex-col overflow-hidden sm:flex md:order-3 md:h-full md:w-1/2 md:flex-none">
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[24px] bg-gray-100 dark:bg-gray-950 [&_.fd-scroll-container]:no-scrollbar [&_.fd-scroll-container]:h-full [&_.fd-scroll-container]:max-h-none [&_.fd-scroll-container]:min-h-0 [&_.fd-scroll-container]:overflow-y-auto [&_.fd-scroll-container]:py-7 [&_.fd-scroll-container]:pr-3.5 [&_.fd-scroll-container]:pl-7 [&_.lucide-clipboard]:hidden [&_div.absolute.top-3.right-2]:hidden [&_pre]:text-sm [&_pre]:leading-6 [&>figure]:flex [&>figure]:h-full [&>figure]:min-h-0 [&>figure]:flex-col [&>figure]:rounded-[24px] [&>figure]:border-none [&>figure]:bg-transparent [&>figure]:shadow-none">
          <DynamicCodeBlock lang="ts" code={code} />

          <button
            type="button"
            className="absolute top-5 right-5 z-1 flex size-7 cursor-pointer items-center justify-center text-gray-500"
            onClick={handleCopy}
          >
            {checked ? (
              <HugeiconsIcon
                icon={Tick02Icon}
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
              "from-gray-100 from-65% to-gray-100/0 to-95% dark:from-gray-950 dark:to-gray-950/0",
            )}
          />
        </div>
      </div>
    </div>
  );
}
