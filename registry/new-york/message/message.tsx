"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** Typography (prose) classes for MessageMarkdown — mirrors `components/ui/prose.tsx`. */
const messageMarkdownProseClasses = [
  "prose prose-invert max-w-none text-gray-900 dark:text-gray-200 font-normal text-sm leading-6",
  // headings
  "prose-headings:scroll-mt-28 lg:prose-headings:scroll-mt-24 prose-headings:text-gray-900 dark:prose-headings:text-gray-50 prose-headings:font-[450] prose-headings:leading-5.5 prose-h2:tracking-[-0.45px] prose-headings:mb-4 prose-headings:mt-8 prose-h1:text-2xl prose-h2:text-lg prose-h3:text-base prose-h3:leading-4.5 prose-h3:tracking-[-0.4px] prose-h4:text-sm prose-h5:text-xs prose-h6:text-xs",
  // heading links
  "prose-headings:[&_a]:no-underline prose-headings:[&_a]:shadow-none prose-headings:[&_a]:text-inherit",
  // body text
  "prose-p:mb-4 prose-p:mt-4",
  // lead
  "prose-lead:text-gray-900 dark:prose-lead:text-gray-50",
  // links
  "prose-a:text-gray-900 dark:prose-a:text-gray-50 prose-a:font-normal",
  // link underline
  "prose-a:underline prose-a:underline-offset-3",
  // strong
  "prose-strong:text-gray-900 dark:prose-strong:text-gray-50 prose-strong:font-normal",
  // code
  "prose-code:text-gray-900 dark:prose-code:text-gray-50 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:border-none prose-code:rounded-md prose-code:font-[450]",
  // lists
  "prose-li:my-[-0.5px] prose-li:marker:text-gray-200 dark:prose-li:marker:text-gray-700",
] as const;

type MessageFrom = "user" | "assistant";

type MessageContextValue = {
  from: MessageFrom;
};

const MessageContext = React.createContext<MessageContextValue | null>(null);

function useMessageContext() {
  return React.useContext(MessageContext);
}

type MessageProps = React.HTMLAttributes<HTMLDivElement> & {
  from: MessageFrom;
};

function Message({
  className,
  from,
  children,
  "aria-label": ariaLabelProp,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: MessageProps) {
  const ariaLabel =
    ariaLabelProp ??
    (ariaLabelledBy == null
      ? from === "user"
        ? "User message"
        : "Assistant message"
      : undefined);

  return (
    <MessageContext.Provider value={{ from }}>
      <div
        data-slot="message"
        role="article"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          "flex w-auto max-w-[90%] items-start gap-2",
          from === "user" ? "ms-auto" : "me-auto",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </MessageContext.Provider>
  );
}

type MessageStackProps = React.HTMLAttributes<HTMLDivElement>;

function MessageStack({ className, ...props }: MessageStackProps) {
  const ctx = useMessageContext();
  const from = ctx?.from ?? "assistant";

  return (
    <div
      data-slot="message-stack"
      className={cn(
        "flex w-auto flex-col gap-2",
        from === "user" ? "items-end" : "items-start",
        className,
      )}
      {...props}
    />
  );
}

type MessageContentProps = React.HTMLAttributes<HTMLDivElement>;

function MessageContent({ className, ...props }: MessageContentProps) {
  const ctx = useMessageContext();
  const from = ctx?.from ?? "assistant";

  return (
    <div
      data-slot="message-content"
      className={cn(
        "min-h-10 w-fit rounded-[20px] text-sm leading-6 text-gray-900",
        from === "user"
          ? "bg-gray-100 px-4 py-2 dark:bg-gray-700"
          : "bg-transparent px-2",
        className,
      )}
      {...props}
    />
  );
}

type MessageMarkdownProps = React.ComponentProps<typeof Streamdown>;

function MessageMarkdown({ className, ...props }: MessageMarkdownProps) {
  return (
    <Streamdown
      data-slot="message-markdown"
      className={cn(
        ...messageMarkdownProseClasses,
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      controls={{
        table: {
          copy: false,
          download: false,
          fullscreen: false,
        },
        code: {
          copy: false,
          download: false,
        },
      }}
      components={{
        table: (props) => (
          <div
            data-slot="message-markdown-table-wrap"
            className={[
              "my-6 prose-no-margin overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-950",
              "[&_tbody_tr:first-child_td:first-child]:rounded-ss-xl",
              "[&_tbody_tr:first-child_td:last-child]:rounded-se-xl",
              "[&_tbody_tr:last-child_td:first-child]:rounded-es-xl",
              "[&_tbody_tr:last-child_td:last-child]:rounded-ee-xl",
            ].join(" ")}
          >
            <table
              data-slot="message-markdown-table"
              className="w-full border-separate border-spacing-0 border-none bg-gray-100 text-sm dark:bg-gray-950"
              {...props}
            />
          </div>
        ),
        th: (props) => (
          <th
            data-slot="message-markdown-th"
            className="border-none px-6 py-2.5 text-start text-[14px] font-normal! text-gray-400! dark:bg-gray-950 dark:text-gray-500!"
            {...props}
          />
        ),
        td: (props) => (
          <td
            data-slot="message-markdown-td"
            className="border-0 border-gray-100 bg-white px-6 py-3.5 text-[14px] text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 [tr:not(:first-child)_&]:border-t"
            {...props}
          />
        ),
      }}
      shikiTheme={["github-light", "github-dark"]}
      plugins={{ cjk, code, math, mermaid }}
      {...props}
    />
  );
}

type MessageActionsProps = React.HTMLAttributes<HTMLDivElement>;

function MessageActions({ className, ...props }: MessageActionsProps) {
  const ctx = useMessageContext();
  const from = ctx?.from ?? "assistant";

  return (
    <div
      data-slot="message-actions"
      className={cn(
        "flex w-full",
        from === "user" ? "justify-end" : "justify-start",
        className,
      )}
      {...props}
    />
  );
}

type MessageActionGroupProps = React.HTMLAttributes<HTMLDivElement>;

function MessageActionGroup({ className, ...props }: MessageActionGroupProps) {
  return (
    <div
      data-slot="message-action-group"
      className={cn("flex gap-1", className)}
      {...props}
    />
  );
}

type MessageActionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

function MessageAction({ asChild = false, ...props }: MessageActionProps) {
  const Comp = asChild ? Slot : "div";

  return <Comp data-slot="message-action" {...props} />;
}

export type MessageAvatarProps = {
  src: string;
  alt?: string;
  /** Shown while the image loads and when it fails to load. */
  fallback?: React.ReactNode;
  delayMs?: React.ComponentProps<typeof AvatarFallback>["delayMs"];
  size?: React.ComponentProps<typeof Avatar>["size"];
  className?: string;
};

function MessageAvatar({
  src,
  alt = "",
  fallback,
  delayMs,
  size,
  className,
}: MessageAvatarProps) {
  return (
    <Avatar
      data-slot="message-avatar"
      size={size}
      className={cn("size-7 shrink-0", className)}
    >
      <AvatarImage
        data-slot="message-avatar-image"
        src={src}
        alt={alt}
        className="my-0!"
      />
      <AvatarFallback
        data-slot="message-avatar-fallback"
        delayMs={delayMs}
        className="my-0! shrink-0"
      >
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}

export {
  Message,
  MessageStack,
  MessageContent,
  MessageMarkdown,
  MessageActions,
  MessageActionGroup,
  MessageAction,
  MessageAvatar,
};
