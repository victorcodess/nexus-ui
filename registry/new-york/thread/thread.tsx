"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ArrowDown02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { cn } from "@/lib/utils";

type ThreadProps = React.ComponentProps<typeof StickToBottom>;

function Thread({
  className,
  resize = "smooth",
  initial = "smooth",
  ...props
}: ThreadProps) {
  return (
    <StickToBottom
      data-slot="thread"
      className={cn("relative flex w-full overflow-y-auto", className)}
      resize={resize}
      initial={initial}
      {...props}
    />
  );
}

type ThreadContentProps = React.ComponentProps<typeof StickToBottom.Content>;

function ThreadContent({ className, ...props }: ThreadContentProps) {
  return (
    <StickToBottom.Content
      data-slot="thread-content"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-6 p-6",
        className,
      )}
      {...props}
    />
  );
}

type ThreadScrollToBottomProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
};

function ThreadScrollToBottom({
  asChild = false,
  className,
  children,
  onClick,
  ...props
}: ThreadScrollToBottomProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) {
    return null;
  }

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="thread-scroll-to-bottom"
      type={asChild ? undefined : "button"}
      className={cn(
        !asChild &&
          "absolute bottom-6 left-[50%] flex size-8 translate-x-[-50%] cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-500 shadow-sm transition-all hover:bg-gray-200 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
        className,
      )}
      onClick={(event) => {
        scrollToBottom();
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon
          icon={ArrowDown02Icon}
          strokeWidth={2.0}
          className="size-4.5"
        />
      )}
    </Comp>
  );
}

export { Thread, ThreadContent, ThreadScrollToBottom };
