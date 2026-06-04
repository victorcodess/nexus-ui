"use client";

import type { ComponentProps } from "react";
import {
  Cancel01Icon,
  Delete01Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAISearchContext, useChatContext } from "@/components/ai/search/context";
import {
  formatConversationForCopy,
  isChatEmpty,
  StorageKeyInput,
} from "@/components/ai/search/helpers";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/nexus-ui/toaster";
import { cn } from "@/lib/utils";

const headerActionButtonClass =
  "cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-50 hover:dark:bg-secondary";

export function AISearchPanelHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  const { setOpen } = useAISearchContext();
  const { messages, setMessages, stop, status } = useChatContext();
  const chatIsEmpty = isChatEmpty(messages);
  const isLoading = status === "streaming" || status === "submitted";

  const copyConversation = async () => {
    const text = formatConversationForCopy(messages);
    if (!text) {
      toast.error("Nothing to copy", {
        description: "Start a conversation first.",
      });
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.default("Conversation copied");
  };

  const clearConversation = () => {
    if (isLoading) stop();
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(StorageKeyInput);
    }
    toast.default("Conversation cleared");
  };

  return (
    <div
      className={cn(
        "sticky top-0 flex h-12 w-full items-center justify-between gap-2 bg-background pr-2 pl-4 lg:pr-4 lg:pl-6.5",
        className,
      )}
      {...props}
    >
      <span className="text-sm font-medium text-primary">Nexus AI</span>
      <TooltipProvider delayDuration={400}>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={headerActionButtonClass}
                  aria-label="Copy conversation"
                  disabled={chatIsEmpty}
                  onClick={() => void copyConversation()}
                >
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-full">
              Copy conversation
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={headerActionButtonClass}
                  aria-label="Clear conversation"
                  disabled={chatIsEmpty}
                  onClick={clearConversation}
                >
                  <HugeiconsIcon
                    icon={Delete01Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-full">
              Clear conversation
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={headerActionButtonClass}
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2.0}
                  className="size-4.5"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-full">
              Close
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
