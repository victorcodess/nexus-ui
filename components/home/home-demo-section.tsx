"use client";

import * as React from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { HomeDemoSourceKey } from "./home-demo-sources";
import { homeDemoSources } from "./home-demo-sources";
import { HOME_MODEL_DEMOS, HomeDemoModelTabs } from "./home-demo-model-tabs";

/** Overlay invisible; next cover grows top → bottom. */
const CLIP_HIDDEN_BOTTOM = "inset(0% 0% 100% 0%)";
/** Full panel covered. */
const CLIP_FULL = "inset(0% 0% 0% 0%)";
/** Overlay invisible after reveal; new code showed top → bottom. */
const CLIP_HIDDEN_TOP = "inset(100% 0% 0% 0%)";

const CLIP_EASE = [0.33, 1, 0.68, 1] as const;
const CLIP_DURATION = 0.25;

const copyIconMotion = {
  initial: { opacity: 0, scale: 0.8, filter: "blur(1px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.8, filter: "blur(1px)" },
  transition: { duration: 0.15, ease: CLIP_EASE },
} as const;

export function HomeDemoSection() {
  const [activeModel, setActiveModel] =
    React.useState<HomeDemoSourceKey>("claude");
  const [displayKey, setDisplayKey] =
    React.useState<HomeDemoSourceKey>(activeModel);
  const [checked, setChecked] = React.useState(false);

  const activeTargetRef = React.useRef(activeModel);
  activeTargetRef.current = activeModel;

  const displayKeyRef = React.useRef(displayKey);
  displayKeyRef.current = displayKey;

  const codeOverlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = codeOverlayRef.current;
    if (!el) return;

    let cancelled = false;

    async function runCurtain() {
      while (!cancelled && displayKeyRef.current !== activeTargetRef.current) {
        await animate(
          el,
          {
            clipPath: [CLIP_HIDDEN_BOTTOM, CLIP_FULL],
          },
          { duration: CLIP_DURATION, ease: CLIP_EASE },
        );
        if (cancelled) return;
        const target = activeTargetRef.current;
        setDisplayKey(target);
        displayKeyRef.current = target;
        await animate(
          el,
          {
            clipPath: [CLIP_FULL, CLIP_HIDDEN_TOP],
          },
          { duration: CLIP_DURATION, ease: CLIP_EASE },
        );
        if (cancelled) return;
        if (codeOverlayRef.current) {
          codeOverlayRef.current.style.clipPath = CLIP_HIDDEN_BOTTOM;
        }
      }
    }

    if (activeModel !== displayKeyRef.current) {
      void runCurtain();
    }

    return () => {
      cancelled = true;
      el.style.clipPath = CLIP_HIDDEN_BOTTOM;
    };
  }, [activeModel]);

  const active =
    HOME_MODEL_DEMOS.find((d) => d.key === activeModel) ?? HOME_MODEL_DEMOS[0];
  const Preview = active.Component;
  const code = homeDemoSources[displayKey];

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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.key}
              initial={{
                opacity: 0,
                y: -2,
                scale: 0.95,
                filter: "blur(7px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -2,
                scale: 0.95,
                filter: "blur(7px)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex w-full flex-col items-center justify-end"
            >
              <Preview />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="order-3 hidden min-h-0 w-full flex-1 flex-col overflow-hidden sm:flex md:order-3 md:h-full md:w-1/2 md:flex-none">
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[24px] bg-gray-100 dark:bg-gray-950 [&_.fd-scroll-container]:no-scrollbar [&_.fd-scroll-container]:h-full [&_.fd-scroll-container]:max-h-none [&_.fd-scroll-container]:min-h-0 [&_.fd-scroll-container]:overflow-y-auto [&_.fd-scroll-container]:py-7 [&_.fd-scroll-container]:pr-3.5 [&_.fd-scroll-container]:pl-7 [&_.lucide-clipboard]:hidden [&_div.absolute.top-3.right-2]:hidden [&_pre]:text-sm [&_pre]:leading-6 [&>figure]:flex [&>figure]:h-full [&>figure]:min-h-0 [&>figure]:flex-col [&>figure]:rounded-[24px] [&>figure]:border-none [&>figure]:bg-transparent [&>figure]:shadow-none">
          <DynamicCodeBlock lang="ts" code={code} />

          <div
            ref={codeOverlayRef}
            className="pointer-events-none absolute inset-0 z-5 bg-gray-100/50 backdrop-blur-sm dark:bg-gray-950/50"
            style={{
              clipPath: CLIP_HIDDEN_BOTTOM,
              willChange: "clip-path",
            }}
            aria-hidden
          />

          <button
            type="button"
            className="absolute top-5 right-5 z-10 flex size-7 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200" 
            onClick={handleCopy}
          >
            <span className="relative flex size-5 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {checked ? (
                  <motion.span
                    key="tick"
                    {...copyIconMotion}
                    className="flex items-center justify-center"
                  >
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={1.75}
                      className="size-5"
                    />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    {...copyIconMotion}
                    className="flex items-center justify-center"
                  >
                    <HugeiconsIcon
                      icon={Copy01Icon}
                      strokeWidth={1.75}
                      className="size-4.5"
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
          <div
            className={cn(
              "pointer-events-none absolute top-0 right-0 z-0 size-20 rounded-l-full rounded-tr-lg bg-linear-to-l",
              "from-gray-100 from-65% to-gray-100/0 to-95% dark:from-gray-950 dark:to-gray-950/0",
            )}
          />
        </div>
      </div>
    </div>
  );
}
