"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RepeatIcon,
  Edit04Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Message,
  MessageAction,
  MessageActionGroup,
  MessageActions,
  MessageContent,
  MessageMarkdown,
  MessageStack,
} from "@/components/nexus-ui/message";

const MessageWithActions = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6">
      <Message from="user">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>Tell me about Nexus UI.</MessageMarkdown>
          </MessageContent>
          <MessageActions>
            <MessageActionGroup>
              <MessageAction asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={Edit04Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </MessageAction>
              <MessageAction asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </MessageAction>
            </MessageActionGroup>
          </MessageActions>
        </MessageStack>
      </Message>

      <Message from="assistant">
        <MessageStack>
          <MessageContent>
            <MessageMarkdown>
              Nexus UI is an open-source React component library aimed at AI-powered UIs—chat, streaming, and multimodal flows—built with Tailwind CSS v4 and Radix UI.
            </MessageMarkdown>
          </MessageContent>
          <MessageActions>
            <MessageActionGroup>
              <MessageAction asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </MessageAction>
              <MessageAction asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={ThumbsUpIcon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </MessageAction>
              <MessageAction asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={ThumbsDownIcon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </MessageAction>
              <MessageAction asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer rounded-full bg-transparent text-gray-500 transition-all hover:bg-gray-100 active:scale-97 dark:text-white dark:hover:bg-gray-700"
                >
                  <HugeiconsIcon
                    icon={RepeatIcon}
                    strokeWidth={2.0}
                    className="size-4"
                  />
                </Button>
              </MessageAction>
            </MessageActionGroup>
          </MessageActions>
        </MessageStack>
      </Message>
    </div>
  );
};

export default MessageWithActions;
