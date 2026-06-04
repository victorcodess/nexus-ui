"use client";

import * as React from "react";
import { type ComponentProps, type CSSProperties, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useMediaQuery } from "fumadocs-core/utils/use-media-query";
import { cn } from "@/lib/utils";
import { useOnChange } from "@/lib/use-on-change";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Suggestions,
  Suggestion,
  SuggestionList,
} from "@/components/nexus-ui/suggestions";
import {
  Thread,
  ThreadContent,
  ThreadScrollToBottom,
} from "@/components/nexus-ui/thread";
import { Toaster, toast } from "@/components/nexus-ui/toaster";
import type { ChatUIMessage } from "@/lib/ai/types";
import {
  useAISearchContext,
  useChatContext,
} from "@/components/ai/search/context";
import { AISearchPanelHeader } from "@/components/ai/search/header";
import {
  buildDisplayMessages,
  displayMessageRowKey,
  isPendingAssistantMessage,
  sendPromptMessage,
  starterPrompts,
} from "@/components/ai/search/helpers";
import {
  askAiAssistantRowDelay,
  askAiMessageFade,
  askAiPanelSlide,
  askAiStaggerItemVariants,
  askAiStaggerListVariants,
  useAnimateOnce,
  useAskAiEmptyEnter,
} from "@/components/ai/search/animation";
import { useHotKey } from "@/components/ai/search/hotkey";
import { AISearchInput } from "@/components/ai/search/input";
import { ChatMessage } from "@/components/ai/search/message";

const panelDescription = "Grounded in nexus-ui docs. Verify important details.";
const panelInputId = "nd-ai-input";

function focusPanelInput() {
  requestAnimationFrame(() => {
    document.getElementById(panelInputId)?.focus();
  });
}

function preventDismissOutside(event: Event) {
  event.preventDefault();
}

function AnimatedSheetPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex h-full min-h-0 w-(--ai-chat-width) shrink-0 flex-col"
      initial={reduceMotion ? false : { x: "100%" }}
      animate={{ x: reduceMotion || open ? 0 : "100%" }}
      transition={askAiPanelSlide}
    >
      {children}
    </motion.div>
  );
}

function AISearchPanelBody() {
  const { open } = useAISearchContext();
  const chat = useChatContext();
  const isLoading = chat.status === "streaming" || chat.status === "submitted";
  const isEmpty =
    buildDisplayMessages(chat.messages, isLoading).length === 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden lg:gap-3">
      <AISearchPanelHeader />
      <AISearchPanelList className="min-h-0 flex-1" />
      <div className="flex items-center justify-center p-3 pt-1 lg:p-4 lg:pt-1">
        <AISearchInput open={open} isEmpty={isEmpty} />
      </div>
      <div className="absolute">
        <Toaster position="bottom-left" />
      </div>
    </div>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext();
  const isDesktop = useMediaQuery("(width >= 1024px)");
  useHotKey();

  if (isDesktop === undefined) return null;

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetContent
          embedded
          showCloseButton={false}
          showOverlay={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            focusPanelInput();
          }}
          onInteractOutside={preventDismissOutside}
          onPointerDownOutside={preventDismissOutside}
          className={cn(
            "z-30 text-foreground [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]",
            "sticky top-14 ms-auto h-[calc(100dvh-3.5rem)] gap-0 border-s p-0 shadow-none dark:border-t-0",
            "in-[#nd-docs-layout]:[grid-area:toc] in-[#nd-notebook-layout]:col-start-5 in-[#nd-notebook-layout]:row-span-full",
            "dark:border-accent",
            "overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            open
              ? "w-(--ai-chat-width)"
              : "pointer-events-none w-0 min-w-0 border-transparent",
          )}
        >
          <SheetTitle className="sr-only">Ask AI</SheetTitle>
          <SheetDescription className="sr-only">
            {panelDescription}
          </SheetDescription>
          <AnimatedSheetPanel open={open}>
            <AISearchPanelBody />
          </AnimatedSheetPanel>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          focusPanelInput();
        }}
        className={cn(
          "top-4 left-1/2 flex h-[calc(100dvh-2rem)] w-[calc(100%-1rem)] max-w-none translate-x-[-50%] translate-y-0 flex-col gap-0 overflow-hidden rounded-t-3xl rounded-b-[35px] p-0 sm:max-w-none dark:border-accent",
        )}
      >
        <DialogTitle className="sr-only">Ask AI</DialogTitle>
        <DialogDescription className="sr-only">
          {panelDescription}
        </DialogDescription>
        <AISearchPanelBody />
      </DialogContent>
    </Dialog>
  );
}

type PanelMessagesProps = {
  displayMessages: ChatUIMessage[];
  isLoading: boolean;
  lastAssistantIndex: number;
  onFollowUp: (prompt: string) => void;
};

function StarterSuggestions({
  isLoading,
  onSelect,
  open,
  isEmpty,
}: {
  isLoading: boolean;
  onSelect: (prompt: string) => void;
  open: boolean;
  isEmpty: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const { active, enterKey } = useAskAiEmptyEnter(open, isEmpty);

  if (reduceMotion || !active) {
    return (
      <Suggestions onSelect={onSelect}>
        <SuggestionList className="justify-start">
          {starterPrompts.map((prompt) => (
            <Suggestion key={prompt} disabled={isLoading}>
              {prompt}
            </Suggestion>
          ))}
        </SuggestionList>
      </Suggestions>
    );
  }

  return (
    <Suggestions onSelect={onSelect}>
      <motion.div
        key={enterKey}
        role="group"
        aria-label="Suggestions"
        data-slot="suggestion-list"
        className="flex flex-row flex-wrap items-center justify-start gap-2 duration-150"
        initial="hidden"
        animate="visible"
        variants={askAiStaggerListVariants}
      >
        {starterPrompts.map((prompt) => (
          <motion.div key={prompt} variants={askAiStaggerItemVariants}>
            <Suggestion disabled={isLoading}>{prompt}</Suggestion>
          </motion.div>
        ))}
      </motion.div>
    </Suggestions>
  );
}

function PanelMessageRow({
  rowKey,
  isAssistant,
  reduceMotion,
  children,
}: {
  rowKey: string;
  isAssistant: boolean;
  reduceMotion: boolean | null;
  children: React.ReactNode;
}) {
  const rowAnim = useAnimateOnce(`row:${rowKey}`);

  return (
    <motion.div
      className="w-full"
      initial={rowAnim.initial}
      animate={{ opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              ...askAiMessageFade,
              delay: isAssistant ? askAiAssistantRowDelay : 0,
            }
      }
      onAnimationComplete={rowAnim.onAnimationComplete}
    >
      {children}
    </motion.div>
  );
}

function PanelMessages({
  displayMessages,
  isLoading,
  lastAssistantIndex,
  onFollowUp,
}: PanelMessagesProps) {
  const reduceMotion = useReducedMotion();
  const previousUserMessageRef = React.useRef<HTMLDivElement | null>(null);
  const [previousUserMessageHeight, setPreviousUserMessageHeight] =
    React.useState(0);

  const previousUserMessageIndex = React.useMemo(() => {
    const lastIndex = displayMessages.length - 1;
    if (lastIndex < 0 || displayMessages[lastIndex]?.role !== "assistant") {
      return -1;
    }

    for (let index = lastIndex - 1; index >= 0; index -= 1) {
      if (displayMessages[index]?.role === "user") {
        return index;
      }
    }

    return -1;
  }, [displayMessages]);

  const attachPreviousUserMessageRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      previousUserMessageRef.current = node;
      setPreviousUserMessageHeight(node?.clientHeight ?? 0);
    },
    [],
  );

  useOnChange(previousUserMessageIndex, (current) => {
    if (current < 0) {
      setPreviousUserMessageHeight(0);
    }
  });

  React.useLayoutEffect(() => {
    if (previousUserMessageIndex < 0) return;

    const element = previousUserMessageRef.current;
    if (!element) {
      return;
    }

    const measureHeight = () => {
      setPreviousUserMessageHeight(element.clientHeight);
    };

    const resizeObserver = new ResizeObserver(measureHeight);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [previousUserMessageIndex]);

  return (
    <>
      {displayMessages.map((item, index) => {
        const isLast = index === displayMessages.length - 1;
        const assistantTurnNumber = displayMessages
          .slice(0, index + 1)
          .filter((row) => row.role === "assistant").length;
        const useAssistantMinHeight =
          item.role === "assistant" && isLast && assistantTurnNumber >= 2;
        const assistantMinHeightStyle = useAssistantMinHeight
          ? ({
              "--panel-prev-user-height": `${previousUserMessageHeight}px`,
            } as React.CSSProperties)
          : undefined;

        const isAssistant = item.role === "assistant";
        const rowKey = displayMessageRowKey(item, index, displayMessages);

        return (
          <PanelMessageRow
            key={rowKey}
            rowKey={rowKey}
            isAssistant={isAssistant}
            reduceMotion={reduceMotion}
          >
            <ChatMessage
              ref={
                index === previousUserMessageIndex
                  ? attachPreviousUserMessageRef
                  : undefined
              }
              message={item}
              turnKey={rowKey}
              messageClassName={
                useAssistantMinHeight
                  ? "min-h-[calc(var(--panel-thread-height)-var(--panel-prev-user-height)-var(--panel-thread-content-gap)-var(--panel-thread-content-bottom-padding)-var(--panel-min-height-misc))]"
                  : undefined
              }
              messageStyle={assistantMinHeightStyle}
              isStreaming={
                isLoading && isAssistant && index === lastAssistantIndex
              }
              canRegenerate={
                !isPendingAssistantMessage(item) &&
                isAssistant &&
                index === lastAssistantIndex &&
                !isLoading
              }
              showFollowUps={
                !isPendingAssistantMessage(item) &&
                isAssistant &&
                index === lastAssistantIndex &&
                !isLoading
              }
              onFollowUp={onFollowUp}
            />
          </PanelMessageRow>
        );
      })}
    </>
  );
}

export function AISearchPanelList({
  className,
  style,
  ...props
}: ComponentProps<"div">) {
  const { open } = useAISearchContext();
  const chat = useChatContext();
  const isLoading = chat.status === "streaming" || chat.status === "submitted";
  const displayMessages = buildDisplayMessages(chat.messages, isLoading);
  const lastAssistantIndex = displayMessages.findLastIndex(
    (message) => message.role === "assistant",
  );
  const threadMeasureRef = React.useRef<HTMLDivElement>(null);
  const [threadHeight, setThreadHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const element = threadMeasureRef.current;
    if (!element) return;

    const measureHeight = () => {
      setThreadHeight(element.clientHeight);
    };

    measureHeight();
    const resizeObserver = new ResizeObserver(measureHeight);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!chat.error) return;
    toast.error("Ask AI request failed", { description: chat.error.message });
  }, [chat.error]);

  const threadVars = {
    maskImage:
      "linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)",
    "--panel-thread-height": threadHeight > 0 ? `${threadHeight}px` : "100%",
    "--panel-thread-content-gap": "12px",
    "--panel-thread-content-bottom-padding": "160px",
    "--panel-min-height-misc": "14px",
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={threadMeasureRef}
      className={cn("relative h-full min-h-0", className)}
      {...props}
    >
      <Thread className="h-full min-h-0" style={threadVars} initial={"instant"}>
        <ThreadContent
          className={cn(
            "mx-auto max-w-(--ai-chat-width) gap-(--panel-thread-content-gap) p-0 px-2 pt-4 pb-(--panel-thread-content-bottom-padding)",
            displayMessages.length === 0 && "h-full pb-3",
          )}
        >
          {displayMessages.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-end gap-3">
              <StarterSuggestions
                isLoading={isLoading}
                open={open}
                isEmpty={displayMessages.length === 0}
                onSelect={(prompt) =>
                  sendPromptMessage(chat.sendMessage, prompt)
                }
              />
            </div>
          ) : (
            <PanelMessages
              displayMessages={displayMessages}
              isLoading={isLoading}
              lastAssistantIndex={lastAssistantIndex}
              onFollowUp={(prompt) =>
                sendPromptMessage(chat.sendMessage, prompt)
              }
            />
          )}
        </ThreadContent>
        <ThreadScrollToBottom className="bottom-2 z-10" />
      </Thread>
    </div>
  );
}
