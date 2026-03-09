"use client";
import { cva } from "class-variance-authority";
import { Airplay, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ComponentProps, useEffect, useState } from "react";
import { cn } from "../../lib/cn";

const itemVariants = cva("size-6.5 p-1.5 text-fd-muted-foreground", {
  variants: {
    active: {
      true: "bg-fd-accent text-fd-accent-foreground",
      false: "text-fd-muted-foreground",
    },
  },
});

const full = [
  ["light", Sun] as const,
  ["dark", Moon] as const,
  ["system", Airplay] as const,
];

export function SmallThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900",
        className,
      )}
      aria-label="Toggle Theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun size={18} strokeWidth={1.25} />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            d="M16.125 10.5588C15.2252 11.0392 14.1976 11.3116 13.1063 11.3116C9.56182 11.3116 6.68844 8.43817 6.68844 4.89364C6.68844 3.80239 6.96079 2.77476 7.44122 1.875C4.25074 2.62273 1.875 5.48635 1.875 8.90482C1.875 12.8924 5.10757 16.125 9.09517 16.125C12.5137 16.125 15.3772 13.7493 16.125 10.5588Z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = cn(
    "inline-flex items-center rounded-full border p-1 *:rounded-full",
    className,
  );

  if (mode === "light-dark") {
    const value = mounted ? resolvedTheme : null;

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
            <Icon
              key={key}
              fill="currentColor"
              className={cn(itemVariants({ active: value === key }))}
            />
          );
        })}
      </button>
    );
  }

  const value = mounted ? theme : null;

  return (
    <div className={container} data-theme-toggle="" {...props}>
      {full.map(([key, Icon]) => (
        <button
          key={key}
          aria-label={key}
          className={cn(itemVariants({ active: value === key }))}
          onClick={() => setTheme(key)}
        >
          <Icon className="size-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
