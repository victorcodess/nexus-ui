"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

type PromptInputProps = React.HTMLAttributes<HTMLDivElement>;

const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, role: _role, "aria-label": _ariaLabel, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label="Chat input"
      className={cn(
        "flex h-auto w-full flex-col rounded-3xl border bg-background shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);

PromptInput.displayName = "PromptInput";

type PromptInputTextareaProps = React.ComponentProps<typeof Textarea>;

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(({ className, "aria-label": _ariaLabel, ...props }, ref) => (
  <ScrollArea className="max-h-40">
    <Textarea
      ref={ref}
      aria-label="Message input"
      placeholder="How can I help you today?"
      className={cn(
        "min-h-14 w-full resize-none border-0 bg-transparent px-4 py-4 text-base leading-6 font-normal shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
        className,
      )}
      {...props}
    />
  </ScrollArea>
));

PromptInputTextarea.displayName = "PromptInputTextarea";

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

const PromptInputActions = React.forwardRef<
  HTMLDivElement,
  PromptInputActionsProps
>(({ className, role: _role, "aria-label": _ariaLabel, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    aria-label="Input actions"
    className={cn(
      "flex w-full shrink-0 items-center justify-between px-2 py-2",
      className,
    )}
    {...props}
  />
));

PromptInputActions.displayName = "PromptInputActions";

type PromptInputActionGroupProps = React.HTMLAttributes<HTMLDivElement>;

const PromptInputActionGroup = React.forwardRef<
  HTMLDivElement,
  PromptInputActionGroupProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex gap-2", className)} {...props} />
));

PromptInputActionGroup.displayName = "PromptInputActionGroup";

type PromptInputActionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

const PromptInputAction = React.forwardRef<
  HTMLDivElement,
  PromptInputActionProps
>(({ asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";

  return <Comp ref={ref} {...props} />;
});

PromptInputAction.displayName = "PromptInputAction";

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputActionGroup,
  PromptInputAction,
};

export default PromptInput;
