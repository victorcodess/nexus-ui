"use client";

import { type ComponentProps, useEffect } from "react";
import { MessageCircleIcon } from "lucide-react";
import { useMediaQuery } from "fumadocs-core/utils/use-media-query";
import { cn } from "@/lib/utils";
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
import { useAISearchContext, useChatContext } from "./context";
import { useHotKey } from "./hotkey";
import {
  buildDisplayMessages,
  displayMessageRowKey,
  isPendingAssistantMessage,
  sendPromptMessage,
  starterPrompts,
} from "./helpers";
import { AISearchInput } from "./input";
import { ChatMessage } from "./message";
import { AISearchPanelHeader } from "./header";

const panelDescription = "Grounded in nexus-ui docs. Verify important details.";

function preventDismissOutside(event: Event) {
  event.preventDefault();
}

function AISearchPanelBody() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden lg:gap-3">
      <AISearchPanelHeader />
      <AISearchPanelList className="min-h-0 flex-1" />
      <div className="flex items-center justify-center p-2 pt-1 lg:p-4 lg:pt-1">
        <AISearchInput />
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
          onInteractOutside={preventDismissOutside}
          onPointerDownOutside={preventDismissOutside}
          className={cn(
            "z-30 overflow-hidden text-foreground [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]",
            "sticky top-14 ms-auto h-[calc(100dvh-3.5rem)] w-(--ai-chat-width) gap-0 border-s p-0 shadow-none",
            "in-[#nd-docs-layout]:[grid-area:toc] in-[#nd-notebook-layout]:col-start-5 in-[#nd-notebook-layout]:row-span-full",
            "dark:border-accent",
          )}
        >
          <SheetTitle className="sr-only">Ask AI</SheetTitle>
          <SheetDescription className="sr-only">
            {panelDescription}
          </SheetDescription>
          <AISearchPanelBody />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={preventDismissOutside}
        onPointerDownOutside={preventDismissOutside}
        className={cn(
          "top-4 left-1/2 flex h-[calc(100dvh-2rem)] w-[calc(100%-1rem)] max-w-none translate-x-[-50%] translate-y-0 flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-none",
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

export function AISearchPanelList({
  className,
  style,
  ...props
}: ComponentProps<"div">) {
  const chat = useChatContext();
  const isLoading = chat.status === "streaming" || chat.status === "submitted";
  const displayMessages = buildDisplayMessages(chat.messages, isLoading);
  const lastAssistantIndex = displayMessages.findLastIndex(
    (message) => message.role === "assistant",
  );

  useEffect(() => {
    if (!chat.error) return;
    toast.error("Ask AI request failed", { description: chat.error.message });
  }, [chat.error]);

  return (
    <Thread
      className={cn("h-(--panel-thread-height)", className)}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)",
        // "--panel-thread-height": "75vh",
        // "--panel-thread-content-gap": "24px",
        // "--panel-thread-content-bottom-padding": "160px",
        // "--panel-min-height-misc": "2px",

        ...style,
      }}
      {...props}
    >
      <ThreadContent className={cn("(--reasoning-thread-content-bottom-padding) max-w-(--ai-chat-width) gap-(--reasoning-thread-content-gap) px-1 pb-40 lg:px-2", displayMessages.length === 0 && "h-full mx-auto pb-3")}>
        {displayMessages.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-end gap-3">
            <Suggestions
              onSelect={(prompt) => sendPromptMessage(chat.sendMessage, prompt)}
            >
              <SuggestionList className="justify-start">
                {starterPrompts.map((prompt) => (
                  <Suggestion key={prompt} disabled={isLoading}>
                    {prompt}
                  </Suggestion>
                ))}
              </SuggestionList>
            </Suggestions>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayMessages.map((item, index) => (
              <ChatMessage
                key={displayMessageRowKey(item, index, displayMessages)}
                message={item}
                isStreaming={
                  isLoading &&
                  item.role === "assistant" &&
                  index === lastAssistantIndex
                }
                canRegenerate={
                  !isPendingAssistantMessage(item) &&
                  item.role === "assistant" &&
                  index === lastAssistantIndex &&
                  !isLoading
                }
                showFollowUps={
                  !isPendingAssistantMessage(item) &&
                  item.role === "assistant" &&
                  index === lastAssistantIndex &&
                  !isLoading
                }
                onFollowUp={(prompt) =>
                  sendPromptMessage(chat.sendMessage, prompt)
                }
              />
            ))}
          </div>
        )}
      </ThreadContent>
      <ThreadScrollToBottom />
    </Thread>
  );
}
