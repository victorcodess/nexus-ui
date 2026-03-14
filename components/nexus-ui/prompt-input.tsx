"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollViewport } from "@/components/ui/scroll-area";

type PromptInputProps = React.HTMLAttributes<HTMLDivElement>;

function PromptInput({
  className,
  role: _role,
  "aria-label": _ariaLabel,
  ...props
}: PromptInputProps) {
  return (
    <div
      role="group"
      aria-label="Chat input"
      className={cn(
        "flex h-auto w-full flex-col gap-0 rounded-[24px] border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
        className,
      )}
      {...props}
    />
  );
}

type PromptInputTextareaProps = React.ComponentProps<typeof Textarea>;

function PromptInputTextarea({
  className,
  "aria-label": _ariaLabel,
  ...props
}: PromptInputTextareaProps) {
  return (
    <ScrollArea className="max-h-40">
      <ScrollViewport>
        <Textarea
          aria-label="Message input"
          placeholder="How can I help you today?"
          className={cn(
            "min-h-14 w-full resize-none border-0 bg-transparent px-4 py-4 text-sm leading-6 font-normal text-gray-900 shadow-none outline-none placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:text-white",
            className,
          )}
          {...props}
        />
      </ScrollViewport>
    </ScrollArea>
  );
}

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

function PromptInputActions({
  className,
  role: _role,
  "aria-label": _ariaLabel,
  ...props
}: PromptInputActionsProps) {
  return (
    <div
      role="group"
      aria-label="Input actions"
      className={cn(
        "flex w-full shrink-0 items-center justify-between px-2 py-2",
        className,
      )}
      {...props}
    />
  );
}

type PromptInputActionGroupProps = React.HTMLAttributes<HTMLDivElement>;

function PromptInputActionGroup({
  className,
  ...props
}: PromptInputActionGroupProps) {
  return <div className={cn("flex gap-2", className)} {...props} />;
}

type PromptInputActionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

function PromptInputAction({
  asChild = false,
  ...props
}: PromptInputActionProps) {
  const Comp = asChild ? Slot : "div";

  return <Comp {...props} />;
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputActionGroup,
  PromptInputAction,
};

export default PromptInput;
