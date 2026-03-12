"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SuggestionsContextValue = {
  onSelect?: (value: string) => void;
};

const SuggestionsContext = React.createContext<SuggestionsContextValue>({});

type SuggestionsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  onSelect?: (value: string) => void;
};

const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>(
  ({ className, onSelect, ...props }, ref) => (
    <SuggestionsContext value={{ onSelect }}>
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
    </SuggestionsContext>
  ),
);

Suggestions.displayName = "Suggestions";

type SuggestionListProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

const SuggestionList = React.forwardRef<HTMLDivElement, SuggestionListProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex gap-2",
        orientation === "horizontal"
          ? "flex-row flex-wrap items-center justify-center"
          : "flex-col items-start",
        className,
      )}
      role="group"
      {...props}
    />
  ),
);

SuggestionList.displayName = "SuggestionList";

const suggestionVariants = {
  default:
    "h-8 gap-1.5 rounded-full border-none bg-gray-100 px-4 text-sm font-normal text-gray-900 shadow-none outline-none hover:bg-gray-200 focus-visible:ring-0 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15",
  outline:
    "h-8 gap-1.5 rounded-full border border-gray-200 bg-transparent px-4 text-sm font-normal text-gray-900 shadow-none outline-none hover:bg-gray-100 focus-visible:ring-0 dark:border-white/10 dark:text-gray-100 dark:hover:bg-white/10",
  ghost:
    "h-8 gap-1.5 rounded-full border-none bg-transparent px-4 text-sm font-normal text-gray-500 shadow-none outline-none hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-0 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100",
};

type SuggestionVariant = keyof typeof suggestionVariants;

type SuggestionProps = Omit<React.ComponentProps<typeof Button>, "variant"> & {
  value?: string;
  variant?: SuggestionVariant;
  highlight?: string | string[];
};

function highlightText(text: string, terms: string | string[]): React.ReactNode {
  const termList = Array.isArray(terms) ? terms : [terms];
  const escaped = termList.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, i) =>
        escaped.some((e) => new RegExp(`^${e}$`, "i").test(part))
          ? (<span key={i} className="text-gray-400 dark:text-gray-500">{part}</span>)
          : (<span key={i} className="text-gray-900 dark:text-gray-100">{part}</span>),
      )}
    </span>
  );
}

const Suggestion = React.forwardRef<HTMLButtonElement, SuggestionProps>(
  ({ className, value, variant = "default", highlight, onClick, children, ...props }, ref) => {
    const { onSelect } = React.useContext(SuggestionsContext);

    const textToHighlight =
      typeof children === "string" ? children : (value ?? "");
    const nonStringChildren = React.Children.toArray(children).filter(
      (c) => typeof c !== "string",
    );
    const rendered =
      highlight && textToHighlight ? (
        <>
          {highlightText(textToHighlight, highlight)}
          {nonStringChildren}
        </>
      ) : (
        children
      );

    return (
      <Button
        ref={ref}
        className={cn(suggestionVariants[variant], className)}
        onClick={(e) => {
          onClick?.(e);
          const text = value ?? (typeof children === "string" ? children : "");
          if (text && onSelect) onSelect(text);
        }}
        {...props}
      >
        {rendered}
      </Button>
    );
  },
);

Suggestion.displayName = "Suggestion";

const SuggestionPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute inset-x-0 -top-6.75 z-0 mx-auto flex w-[calc(100%-16px)] flex-col items-center justify-center gap-3 rounded-t-[6px] rounded-b-[20px] bg-gray-100 px-2 py-2 dark:border-white/10 dark:bg-gray-900",
      className,
    )}
    {...props}
  />
));

SuggestionPanel.displayName = "SuggestionPanel";

const SuggestionPanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex w-full items-center justify-between px-3", className)}
    {...props}
  />
));

SuggestionPanelHeader.displayName = "SuggestionPanelHeader";

const SuggestionPanelTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1.5", className)} {...props} />
));

SuggestionPanelTitle.displayName = "SuggestionPanelTitle";

const SuggestionPanelClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
      className,
    )}
    {...props}
  />
));

SuggestionPanelClose.displayName = "SuggestionPanelClose";

const SuggestionPanelContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
));

SuggestionPanelContent.displayName = "SuggestionPanelContent";

export {
  Suggestions,
  SuggestionList,
  Suggestion,
  SuggestionPanel,
  SuggestionPanelHeader,
  SuggestionPanelTitle,
  SuggestionPanelClose,
  SuggestionPanelContent,
};

export default Suggestions;
