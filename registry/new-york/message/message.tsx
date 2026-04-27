"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CodeBlock } from "@/components/nexus-ui/codeblock";
import { cn } from "@/lib/utils";

const streamdownPlugins = { cjk, code, math, mermaid } as const;

/** Typography (prose) classes for MessageMarkdown. **/
const messageMarkdownProseClasses = [
  "prose max-w-none text-primary font-normal text-sm leading-6.5",
  // headings
  "prose-headings:font-[450] prose-headings:leading-5.5 prose-h2:tracking-[-0.45px] prose-headings:mb-4 prose-headings:mt-6 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h3:leading-4.5 prose-h3:tracking-[-0.4px] prose-h4:text-sm prose-h5:text-xs prose-h6:text-xs",
  // heading links
  "prose-headings:[&_a]:no-underline prose-headings:[&_a]:shadow-none prose-headings:[&_a]:text-inherit",
  // body text
  "prose-p:mb-1 prose-p:mt-4",
  // lead
  "prose-lead:text-primary",
  // links
  "[&_[data-streamdown=link]]:text-foreground [&_[data-streamdown=link]]:font-normal [&_[data-streamdown=link]]:underline [&_[data-streamdown=link]]:underline-offset-2",
  // strong
  "[&_[data-streamdown=strong]]:text-foreground [&_[data-streamdown=strong]]:font-normal [&_[data-streamdown=strong]]:font-[550]",
  // lists
  "prose-li:my-[-0.5px] prose-li:marker:text-border prose-ul:my-0 prose-ol:my-0 prose-ol:pl-3",
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
          "group/message flex w-full max-w-[90%] items-start gap-2",
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
        "flex w-full flex-col gap-2",
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
        "rounded-[20px] text-sm leading-6.5 text-primary",
        from === "user"
          ? "w-fit bg-muted px-4 py-2"
          : "mb-2 w-full bg-transparent px-2",
        className,
      )}
      {...props}
    />
  );
}

type MessageMarkdownProps = React.ComponentProps<typeof Streamdown>;

function MessageMarkdown({
  className,
  components,
  ...props
}: MessageMarkdownProps) {
  const defaultComponents = {
    code: CodeBlock,
    inlineCode: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLElement>) => (
      <code
        className={cn(
          "rounded-md border-none bg-muted px-1.5 py-0.5 font-mono text-xs font-[450]",
          className,
        )}
        data-slot="message-markdown-inline-code"
        {...props}
      >
        {children}
      </code>
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <div
        data-slot="message-markdown-table-wrap"
        className={[
          "my-6 prose-no-margin overflow-hidden rounded-2xl border border-border bg-muted dark:border-accent dark:bg-background",
          "[&_tbody_tr:first-child_td:first-child]:rounded-ss-xl",
          "[&_tbody_tr:first-child_td:last-child]:rounded-se-xl",
          "[&_tbody_tr:last-child_td:first-child]:rounded-es-xl",
          "[&_tbody_tr:last-child_td:last-child]:rounded-ee-xl",
        ].join(" ")}
      >
        <table
          data-slot="message-markdown-table"
          className="w-full border-separate border-spacing-0 border-none bg-muted text-sm dark:bg-background"
          {...props}
        />
      </div>
    ),
    th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
      <th
        data-slot="message-markdown-th"
        className="border-none px-5 py-2 text-start text-[13px] font-normal! text-muted-foreground! dark:bg-background"
        {...props}
      />
    ),
    td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
      <td
        data-slot="message-markdown-td"
        className="border-0 border-accent bg-card px-5 py-3 text-[13px] text-primary dark:bg-card [tr:not(:first-child)_&]:border-t"
        {...props}
      />
    ),
  };

  const mergedComponents = React.useMemo(
    () => ({
      ...(defaultComponents as object),
      ...((components ?? {}) as object),
    }),
    [components],
  );

  return (
    <Streamdown
      data-slot="message-markdown"
      className={cn(
        ...messageMarkdownProseClasses,
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      components={mergedComponents as MessageMarkdownProps["components"]}
      shikiTheme={["github-light", "github-dark"]}
      plugins={streamdownPlugins}
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
      className={cn("flex items-center gap-1", className)}
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
