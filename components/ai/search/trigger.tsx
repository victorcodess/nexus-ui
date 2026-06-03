"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAISearchContext } from "@/components/ai/search/context";

const iconSpins = 2;
const iconSpinTransition = {
  type: "spring" as const,
  visualDuration: 2.5,
  bounce: 0.1,
};

export function AISearchTrigger({
  position = "default",
  className,
  ...props
}: ComponentProps<"button"> & { position?: "default" | "float" }) {
  const { open, setOpen } = useAISearchContext();
  const [isHovered, setIsHovered] = useState(false);
  const [iconRotate, setIconRotate] = useState(0);
  const hoverTimeoutRef = useRef<number | null>(null);
  const isExpandedRef = useRef(false);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  useEffect(() => clearHoverTimeout, []);

  const spinIcon = () => {
    setIconRotate((rotate) => rotate + iconSpins * 360);
  };

  const handleHoverStart = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = window.setTimeout(() => {
      isExpandedRef.current = true;
      setIsHovered(true);
      spinIcon();
    }, 120);
  };

  const handleHoverEnd = () => {
    clearHoverTimeout();
    if (!isExpandedRef.current) return;
    isExpandedRef.current = false;
    setIsHovered(false);
    spinIcon();
  };

  return (
    <motion.div
      className={cn(
        position === "float" && [
          "fixed right-5 bottom-6 z-20",
          open ? "pointer-events-none" : "",
        ],
        "overflow-hidden rounded-full shadow-2xl",
        className,
      )}
      initial={false}
      animate={{ width: isHovered ? 96 : 36 }}
      transition={{
        type: "spring",
        visualDuration: 0.28,
        bounce: 0.30,
      }}
    >
      <Button
        data-state={open ? "open" : "closed"}
        variant="default"
        className={cn(
          "h-9 w-full justify-start gap-2 overflow-hidden rounded-full border-none text-sm font-normal shadow-none outline-0 transition-colors duration-150 hover:bg-primary focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
          isHovered ? "pr-3! pl-2.5!" : "pl-2!",
        )}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onClick={() => setOpen(!open)}
        {...props}
      >
        <motion.div
          className="size-5 shrink-0"
          animate={{ rotate: iconRotate }}
          transition={iconSpinTransition}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 12C7.62742 12 12 7.62742 12 0C12 7.62742 16.3726 12 24 12C16.3726 12 12 16.3726 12 24C12 16.3726 7.62742 12 0 12Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
        <motion.span
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -6,
          }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className="whitespace-nowrap"
        >
          Ask AI
        </motion.span>
      </Button>
    </motion.div>
  );
}
