"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Streamdown, type PluginConfig } from "streamdown";
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

const messageMarkdownDefaultPlugins: PluginConfig = {
  code,
  cjk,
  math,
  mermaid,
};

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

function Message({ className, from, children, ...props }: MessageProps) {
  return (
    <MessageContext.Provider value={{ from }}>
      <div
        className={cn(
          "flex w-full",
          from === "user" ? "justify-end" : "justify-start",
          className,
        )}
        {...props}
      >
        <div className="flex w-auto max-w-[90%] items-start gap-2">
          {children}
        </div>
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
      className={cn(
        "flex w-auto flex-col gap-2",
        from === "user" ? "items-end" : "items-start",
        className,
      )}
      {...props}
    />
  );
}

type MessageContentProps = React.HTMLAttributes<HTMLDivElement> & {
  from?: MessageFrom;
};

function MessageContent({
  className,
  from: fromProp,
  ...props
}: MessageContentProps) {
  const ctx = useMessageContext();
  const from = fromProp ?? ctx?.from ?? "assistant";

  return (
    <div
      className={cn(
        "min-h-10 w-fit rounded-[20px] text-sm leading-6 text-gray-900",
        from === "user" ? "bg-gray-100 dark:bg-gray-700 px-4 py-2" : "bg-transparent px-2",
        className,
      )}
      {...props}
    />
  );
}

type MessageMarkdownProps = React.ComponentProps<typeof Streamdown>;

function MessageMarkdown({
  className,
  plugins,
  ...props
}: MessageMarkdownProps) {
  return (
    <Streamdown
      className={cn(
        ...messageMarkdownProseClasses,
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      plugins={{ ...messageMarkdownDefaultPlugins, ...plugins }}
      {...props}
    />
  );
}

type MessageActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  from?: MessageFrom;
};

function MessageActions({
  className,
  from: fromProp,
  ...props
}: MessageActionsProps) {
  const ctx = useMessageContext();
  const from = fromProp ?? ctx?.from ?? "assistant";

  return (
    <div
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
  return <div className={cn("flex gap-1", className)} {...props} />;
}

type MessageActionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

function MessageAction({ asChild = false, ...props }: MessageActionProps) {
  const Comp = asChild ? Slot : "div";

  return <Comp {...props} />;
}

function MessageAvatar({
  className,
  ...props
}: React.ComponentProps<typeof Avatar>) {
  return <Avatar className={cn("shrink-0", className)} {...props} />;
}

function MessageAvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarImage>) {
  return <AvatarImage className={cn("my-0!", className)} {...props} />;
}

function MessageAvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarFallback>) {
  return (
    <AvatarFallback className={cn("my-0! shrink-0", className)} {...props} />
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
  MessageAvatarImage,
  MessageAvatarFallback,
};
