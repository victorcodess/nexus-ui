import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FeedbackBarTooltip =
  | string
  | {
      content?: string;
      side?: "top" | "right" | "bottom" | "left";
      shortcut?: string;
    };

type FeedbackBarProps = React.HTMLAttributes<HTMLDivElement>;

function FeedbackBar({ className, ...props }: FeedbackBarProps) {
  return (
    <div
      data-slot="feedback-bar"
      role="group"
      aria-label="Feedback bar"
      className={cn(
        "inline-flex h-12 w-full max-w-110 rounded-xl border dark:border-accent bg-card text-sm",
        className,
      )}
      {...props}
    />
  );
}

type FeedbackBarContentProps = React.HTMLAttributes<HTMLDivElement>;

function FeedbackBarContent({ className, ...props }: FeedbackBarContentProps) {
  return (
    <div
      data-slot="feedback-bar-content"
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    />
  );
}

type FeedbackBarPromptProps = React.HTMLAttributes<HTMLDivElement>;

function FeedbackBarPrompt({ className, ...props }: FeedbackBarPromptProps) {
  return (
    <div
      data-slot="feedback-bar-prompt"
      className={cn(
        "flex h-full w-full items-center justify-start gap-2.5 pl-4",
        className,
      )}
      {...props}
    />
  );
}

type FeedbackBarLabelProps = React.HTMLAttributes<HTMLSpanElement>;

function FeedbackBarLabel({ className, ...props }: FeedbackBarLabelProps) {
  return (
    <span
      data-slot="feedback-bar-label"
      className={cn("text-sm font-[350] text-foreground", className)}
      {...props}
    />
  );
}

type FeedbackBarActionsProps = React.HTMLAttributes<HTMLDivElement>;

function FeedbackBarActions({ className, ...props }: FeedbackBarActionsProps) {
  return (
    <div
      data-slot="feedback-bar-actions"
      className={cn(
        "flex h-full items-center justify-center gap-1.5 px-2",
        className,
      )}
      {...props}
    />
  );
}

type FeedbackBarActionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  tooltip?: FeedbackBarTooltip;
};

function FeedbackBarAction({
  asChild = false,
  tooltip,
  className,
  ...props
}: FeedbackBarActionProps) {
  const Comp = asChild ? Slot : "div";
  const { content, side, shortcut } =
    typeof tooltip === "string" ? { content: tooltip } : (tooltip ?? {});

  if (!content) {
    return (
      <Comp
        data-slot="feedback-bar-action"
        className={cn(className)}
        {...props}
      />
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            data-slot="feedback-bar-action"
            className={cn(className)}
            {...props}
          />
        </TooltipTrigger>
        <TooltipContent className="rounded-full" side={side}>
          {content}
          {shortcut ? <Kbd className="rounded-md!">{shortcut}</Kbd> : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type FeedbackBarCloseProps = React.HTMLAttributes<HTMLDivElement> & {
  tooltip?: FeedbackBarTooltip;
};

function FeedbackBarClose({
  className,
  children,
  ...props
}: FeedbackBarCloseProps) {
  return (
    <FeedbackBarAction
      asChild
      className={cn(
        "flex h-full items-center justify-center border-l dark:border-accent px-2",
        className,
      )}
      {...props}
    >
      <div data-slot="feedback-bar-close">{children}</div>
    </FeedbackBarAction>
  );
}

export {
  FeedbackBar,
  FeedbackBarContent,
  FeedbackBarPrompt,
  FeedbackBarLabel,
  FeedbackBarActions,
  FeedbackBarAction,
  FeedbackBarClose,
};
