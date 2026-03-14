"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SuggestionsContextValue = {
  onSelect?: (value: string) => void;
};

const SuggestionsContext = React.createContext<SuggestionsContextValue>({});

type SuggestionsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> & {
  onSelect?: (value: string) => void;
};

function Suggestions({ className, onSelect, ...props }: SuggestionsProps) {
  return (
    <SuggestionsContext.Provider value={{ onSelect }}>
      <div
        role="group"
        aria-label="Suggestions"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </SuggestionsContext.Provider>
  );
}

type SuggestionListProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

function SuggestionList({
  className,
  orientation = "horizontal",
  ...props
}: SuggestionListProps) {
  return (
    <div
      role="group"
      aria-label="Suggestions"
      className={cn(
        "flex gap-2",
        orientation === "horizontal"
          ? "flex-row flex-wrap items-center justify-center"
          : "flex-col items-start",
        className,
      )}
      {...props}
    />
  );
}

const suggestionVariants = {
  default:
    "h-8 gap-1.5 rounded-full border-none bg-gray-100 px-4 text-sm font-normal text-gray-900 shadow-none outline-none hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15 dark:focus-visible:ring-gray-500",
  outline:
    "h-8 gap-1.5 rounded-full border border-gray-200 bg-transparent px-4 text-sm font-normal text-gray-900 shadow-none outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:border-white/10 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:ring-gray-500",
  ghost:
    "h-8 gap-1.5 rounded-full border-none bg-transparent px-4 text-sm font-normal text-gray-500 shadow-none outline-none hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100 dark:focus-visible:ring-gray-500",
};

type SuggestionVariant = keyof typeof suggestionVariants;

type SuggestionProps = Omit<React.ComponentProps<typeof Button>, "variant"> & {
  value?: string;
  variant?: SuggestionVariant;
  highlight?: string | string[];
};

function highlightText(
  text: string,
  terms: string | string[],
): React.ReactNode {
  const termList = Array.isArray(terms) ? terms : [terms];
  const escaped = termList.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, i) =>
        escaped.some((e) => new RegExp(`^${e}$`, "i").test(part)) ? (
          <span key={i} className="text-gray-400 dark:text-gray-500">
            {part}
          </span>
        ) : (
          <span key={i} className="text-gray-900 dark:text-gray-100">
            {part}
          </span>
        ),
      )}
    </span>
  );
}

function Suggestion({
  className,
  value,
  variant = "default",
  highlight,
  onClick,
  children,
  ...props
}: SuggestionProps) {
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
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

type SuggestionPanelProps = React.ComponentProps<"div"> & {
  onClose?: () => void;
};

function SuggestionPanel({
  className,
  onClose,
  ref,
  ...props
}: SuggestionPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = React.useMemo(
    () => (node: HTMLDivElement | null) => {
      (panelRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = getFocusableElements(panel);
    if (focusable.length > 0) focusable[0].focus();
  }, []);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    panel.addEventListener("keydown", handleKeyDown);
    return () => panel.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={mergedRef}
      role="dialog"
      aria-modal="true"
      aria-label="Suggestions panel"
      className={cn(
        "absolute inset-x-0 -top-6.75 z-0 mx-auto flex w-[calc(100%-16px)] flex-col items-center justify-center gap-3 rounded-t-[6px] rounded-b-xl bg-gray-100 px-2 py-2 dark:border-white/10 dark:bg-gray-900",
        className,
      )}
      {...props}
    />
  );
}

function SuggestionPanelHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex w-full items-center justify-between px-3", className)}
      {...props}
    />
  );
}

function SuggestionPanelTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} {...props} />
  );
}

type SuggestionPanelCloseProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };

function SuggestionPanelClose({
  asChild = false,
  className,
  "aria-label": _ariaLabel,
  ...props
}: SuggestionPanelCloseProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={asChild ? undefined : "button"}
      aria-label="Close suggestions panel"
      className={cn(
        "cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
        className,
      )}
      {...props}
    />
  );
}

type SuggestionPanelContentProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

function SuggestionPanelContent({
  asChild = false,
  className,
  ...props
}: SuggestionPanelContentProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn("w-full", className)} {...props} />;
}

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
