"use client";

import * as React from "react";
import { AiBrain01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Streamdown } from "streamdown";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type ReasoningContextValue = {
  isStreaming: boolean;
  label: string;
};

const ReasoningContext = React.createContext<ReasoningContextValue | null>(
  null,
);

function useReasoningContext(component: string): ReasoningContextValue {
  const ctx = React.useContext(ReasoningContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Reasoning>`);
  }
  return ctx;
}

type ReasoningProps = Omit<
  React.ComponentProps<typeof Collapsible>,
  "open" | "defaultOpen" | "onOpenChange"
> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function Reasoning({
  className,
  isStreaming = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: ReasoningProps) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(
    defaultOpen || isStreaming,
  );
  const open = isControlled ? openProp : internalOpen;
  const [durationLabel, setDurationLabel] = React.useState<string | null>(null);
  const [hasStreamed, setHasStreamed] = React.useState(isStreaming);
  const startedAtRef = React.useRef<number | null>(
    isStreaming ? Date.now() : null,
  );
  const prevStreamingRef = React.useRef(isStreaming);

  React.useEffect(() => {
    const wasStreaming = prevStreamingRef.current;
    if (!wasStreaming && isStreaming) {
      setHasStreamed(true);
      startedAtRef.current = Date.now();
      setDurationLabel(null);
      if (!isControlled) {
        setInternalOpen(true);
      }
      onOpenChange?.(true);
    }

    if (wasStreaming && !isStreaming) {
      const startedAt = startedAtRef.current;
      const elapsedSeconds =
        startedAt != null
          ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
          : null;
      setDurationLabel(
        elapsedSeconds != null ? String(elapsedSeconds) : "a few",
      );
      startedAtRef.current = null;
      if (!isControlled) {
        setInternalOpen(false);
      }
      onOpenChange?.(false);
    }

    prevStreamingRef.current = isStreaming;
  }, [isControlled, isStreaming, onOpenChange]);

  const label = React.useMemo(() => {
    if (!hasStreamed || isStreaming) return "Thinking...";
    if (durationLabel != null) return `Thought for ${durationLabel} seconds`;
    return "Thought for a few seconds";
  }, [durationLabel, hasStreamed, isStreaming]);

  const contextValue = React.useMemo(
    () => ({ isStreaming, label }),
    [isStreaming, label],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      const resolvedOpen = isStreaming ? true : nextOpen;
      if (!isControlled) {
        setInternalOpen(resolvedOpen);
      }
      onOpenChange?.(resolvedOpen);
    },
    [isControlled, isStreaming, onOpenChange],
  );

  return (
    <ReasoningContext.Provider value={contextValue}>
      <Collapsible
        data-slot="reasoning"
        className={cn("not-prose w-full", className)}
        data-streaming={isStreaming ? "true" : "false"}
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  );
}

type ReasoningTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>;

function ReasoningTrigger({
  className,
  children,
  ...props
}: ReasoningTriggerProps) {
  const { isStreaming, label } = useReasoningContext("ReasoningTrigger");

  return (
    <CollapsibleTrigger
      data-slot="reasoning-trigger"
      data-streaming={isStreaming ? "true" : "false"}
      className={cn(
        "group flex cursor-pointer items-center gap-1.25 text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon
        icon={AiBrain01Icon}
        strokeWidth={1.75}
        className="size-4"
      />
      <span className="text-sm leading-6">{children ?? label}</span>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        strokeWidth={2.0}
        className="ml-0.5 size-4 opacity-0 transition-all group-data-[state=open]:rotate-180 group-hover:opacity-100 group-data-[state=open]:group-data-[streaming=false]:opacity-100"
      />
    </CollapsibleTrigger>
  );
}

type ReasoningContentProps = Omit<
  React.ComponentProps<typeof CollapsibleContent>,
  "children"
> & {
  children: string;
};

function ReasoningContent({
  className,
  children,
  ...props
}: ReasoningContentProps) {
  return (
    <CollapsibleContent
      data-slot="reasoning-content"
      className={cn(
        "mt-2 ml-2 overflow-hidden border-l pl-3 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className,
      )}
      {...props}
    >
      <Streamdown
        className={cn(
          "prose max-w-none text-sm leading-6 font-normal text-muted-foreground",
          // body text
          "[&_p]:mb-2.5",
          // strong
          "prose-strong:font-medium prose-strong:text-foreground",
          // lists
          "**:data-[streamdown=list-item]:pl-4 **:data-[streamdown=list-item]:py-0.25 prose-ol:my-0 prose-ol:pl-3 prose-ul:my-0 prose-li:my-[-0.5px] **:data-[streamdown=list-item]:marker:text-muted-foreground/50",
          "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        )}
      >
        {children}
      </Streamdown>
    </CollapsibleContent>
  );
}

export { Reasoning, ReasoningTrigger, ReasoningContent };
