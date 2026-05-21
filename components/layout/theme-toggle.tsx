"use client";
import { cva } from "class-variance-authority";
import { AirplayLineIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { ComponentProps, useSyncExternalStore } from "react";
import { cn } from "../../lib/cn";
import { HugeiconsIcon } from "@hugeicons/react";

const THEME_ICON_EASE = [0.33, 1, 0.68, 1] as const;

const themeIconMotion = {
  initial: { opacity: 0, scale: 0.8, filter: "blur(1px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.8, filter: "blur(1px)" },
  transition: { duration: 0.15, ease: THEME_ICON_EASE },
} as const;

const itemVariants = cva("size-6.5 p-1.5 text-fd-muted-foreground", {
  variants: {
    active: {
      true: "bg-fd-accent text-fd-accent-foreground",
      false: "text-fd-muted-foreground",
    },
  },
});

const full = [
  ["light", Sun03Icon] as const,
  ["dark", Moon02Icon] as const,
  ["system", AirplayLineIcon] as const,
];

export function SmallThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        className,
      )}
      aria-label="Toggle Theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="relative flex size-5 items-center justify-center">
        {isHydrated ? (
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span
                key="sun"
                {...themeIconMotion}
                className="flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M14.1654 10.0007C14.1654 12.3018 12.2999 14.1673 9.9987 14.1673C7.69751 14.1673 5.83203 12.3018 5.83203 10.0007C5.83203 7.69947 7.69751 5.83398 9.9987 5.83398C12.2999 5.83398 14.1654 7.69947 14.1654 10.0007Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.9998 1.66602V3.33268M9.9998 16.666V18.3327M15.8331 4.16683L14.5838 5.41602M5.41797 14.5827L4.16797 15.8327M18.3346 9.99935H16.668M3.33464 9.99935H1.66797M15.8346 15.8335L14.5846 14.5835M5.41715 5.41602L4.16797 4.16683"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                {...themeIconMotion}
                className="flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="size-4"
                  aria-hidden
                >
                  <path
                    d="M16.125 10.5588C15.2252 11.0392 14.1976 11.3116 13.1063 11.3116C9.56182 11.3116 6.68844 8.43817 6.68844 4.89364C6.68844 3.80239 6.96079 2.77476 7.44122 1.875C4.25074 2.62273 1.875 5.48635 1.875 8.90482C1.875 12.8924 5.10757 16.125 9.09517 16.125C12.5137 16.125 15.3772 13.7493 16.125 10.5588Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        ) : (
          <span className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 18 18"
              fill="none"
              className="size-4"
              aria-hidden
            >
              <path
                d="M16.125 10.5588C15.2252 11.0392 14.1976 11.3116 13.1063 11.3116C9.56182 11.3116 6.68844 8.43817 6.68844 4.89364C6.68844 3.80239 6.96079 2.77476 7.44122 1.875C4.25074 2.62273 1.875 5.48635 1.875 8.90482C1.875 12.8924 5.10757 16.125 9.09517 16.125C12.5137 16.125 15.3772 13.7493 16.125 10.5588Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </span>
    </button>
  );
}

export function ThemeToggle({
  className,
  mode = "light-dark",
  ...props
}: ComponentProps<"div"> & {
  mode?: "light-dark" | "light-dark-system";
}) {
  const { setTheme, theme, resolvedTheme } = useTheme();

  const container = cn(
    "inline-flex items-center rounded-full border p-1 *:rounded-full",
    className,
  );

  if (mode === "light-dark") {
    const value = resolvedTheme;

    return (
      <button
        className={container}
        aria-label={`Toggle Theme`}
        onClick={() => setTheme(value === "light" ? "dark" : "light")}
        data-theme-toggle=""
      >
        {full.map(([key, Icon]) => {
          if (key === "system") return;

          return (
            <HugeiconsIcon
              icon={Icon}
              key={key}
              fill="currentColor"
              className={cn(itemVariants({ active: value === key }))}
            />
          );
        })}
      </button>
    );
  }

  const value = theme;

  return (
    <div className={container} data-theme-toggle="" {...props}>
      {full.map(([key, Icon]) => (
        <button
          key={key}
          aria-label={key}
          className={cn(itemVariants({ active: value === key }))}
          onClick={() => setTheme(key)}
        >
          <HugeiconsIcon icon={Icon} className="size-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
