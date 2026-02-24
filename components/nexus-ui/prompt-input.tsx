"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollViewport } from "@/components/ui/scroll-area";

type PromptInputProps = React.HTMLAttributes<HTMLDivElement>;

const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-auto w-full flex-col gap-0 rounded-[28px] border border-border-primary bg-surface-elevated shadow-sm",
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
>(({ className, ...props }, ref) => (
  <ScrollArea className="max-h-40 rounded-t-[28px]">
    <ScrollViewport>
      <Textarea
        ref={ref}
        className={cn(
          "min-h-16 w-full resize-none rounded-t-[28px] rounded-b-none border-0 bg-transparent! px-6 py-4 text-base leading-6 font-normal text-[#171717] shadow-none outline-none placeholder:text-[#737373] focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white",
          className,
        )}
        {...props}
      />
    </ScrollViewport>
  </ScrollArea>
));

PromptInputTextarea.displayName = "PromptInputTextarea";

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

const PromptInputActions = React.forwardRef<
  HTMLDivElement,
  PromptInputActionsProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full shrink-0 items-center justify-between rounded-t-none rounded-b-[28px] px-3 py-2.5",
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
  const Comp = asChild ? Slot.Root : "div";

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
