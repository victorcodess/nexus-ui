"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  TextShimmer,
  type TextShimmerProps,
} from "@/components/nexus-ui/text-shimmer";

const BASE = "text-sm leading-6";

const ITEMS: { text: string; shimmer: Omit<TextShimmerProps, "children"> }[] =
  [
    { text: "Thinking through your request...", shimmer: { className: BASE } },
    {
      text: "Re-ranking search results",
      shimmer: { className: BASE, spread: 5, angle: 45 },
    },
    {
      text: "Compiling component registry",
      shimmer: { className: `${BASE} text-chart-4` },
    },
    {
      text: "Syncing vector index",
      shimmer: { className: BASE, color: "oklch(0.78 0.12 255)" },
    },
    {
      text: "Processing tool output...",
      shimmer: { className: BASE, invert: true },
    },
  ];

const STEP_MS = 3000;

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.35, ease: "easeInOut" },
} as const;

function TextShimmerDemo() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ITEMS.length);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  const item = ITEMS[index];

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-ring muted-foreground">
      <div className="relative flex min-h-7 w-full max-w-md flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-center text-center"
            {...fade}
          >
            <TextShimmer {...item.shimmer}>{item.text}</TextShimmer>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TextShimmerDemo;
