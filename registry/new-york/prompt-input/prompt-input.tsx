"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { mergeRefs } from "@/lib/merge-refs";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollViewport } from "@/components/ui/scroll-area";

type PromptInputContextValue = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit?: (value: string) => void;
};

const PromptInputContext = React.createContext<PromptInputContextValue | null>(
  null,
);

type PromptInputProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSubmit"
> & {
  /**
   * Called when Enter is pressed in the textarea (without Shift). Use with
   * value/onChange on PromptInputTextarea for controlled mode. Shift+Enter
   * inserts a new line.
   */
  onSubmit?: (value: string) => void;
};

function PromptInput({
  className,
  role: _role,
  "aria-label": _ariaLabel,
  onClick,
  onSubmit,
  ...props
}: PromptInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(
          'button, a, input, textarea, [role="button"], [role="tab"]',
        )
      ) {
        textareaRef.current?.focus();
      }
      onClick?.(e);
    },
    [onClick],
  );

  const contextValue = React.useMemo<PromptInputContextValue>(
    () => ({ textareaRef, onSubmit }),
    [onSubmit],
  );

  return (
    <PromptInputContext.Provider value={contextValue}>
      <div
        role="group"
        aria-label="Chat input"
        className={cn(
          "relative flex h-auto w-full cursor-text flex-col gap-0 overflow-hidden rounded-[24px] border border-border dark:border-border/50 bg-card dark:bg-input/30",
          className,
        )}
        onClick={handleClick}
        {...props}
      />
    </PromptInputContext.Provider>
  );
}

type PromptInputTextareaProps = React.ComponentProps<typeof Textarea>;

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(function PromptInputTextarea(
  { className, "aria-label": _ariaLabel, onKeyDown, ...props },
  ref,
) {
  const context = React.useContext(PromptInputContext);
  const textareaRef = context?.textareaRef;
  const onSubmit = context?.onSubmit;
  const mergedRef = textareaRef
    ? mergeRefs<HTMLTextAreaElement>(textareaRef, ref)
    : ref;

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && onSubmit) {
        e.preventDefault();
        onSubmit(e.currentTarget.value);
      }
      onKeyDown?.(e);
    },
    [onSubmit, onKeyDown],
  );

  return (
    <ScrollArea className="max-h-40">
      <ScrollViewport>
        <Textarea
          ref={mergedRef}
          aria-label="Message input"
          placeholder="How can I help you today?"
          className={cn(
            "min-h-14 w-full resize-none border-0 bg-transparent px-4 py-4 text-sm leading-6 font-normal text-primary shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent",
            className,
          )}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </ScrollViewport>
    </ScrollArea>
  );
});

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
