"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Message,
  MessageAction,
  MessageActionGroup,
  MessageActions,
  MessageAvatar,
  MessageContent,
  MessageMarkdown,
  MessageStack,
} from "@/components/nexus-ui/message";
import {
  Thread,
  ThreadContent,
  ThreadScrollToBottom,
} from "@/components/nexus-ui/thread";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorGroup,
  ModelSelectorLabel,
  ModelSelectorRadioGroup,
  ModelSelectorRadioItem,
  ModelSelectorTrigger,
} from "@/components/nexus-ui/model-selector";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { Citation, CitationSourcesBadge } from "@/components/nexus-ui/citation";
import { TypingLoader } from "@/components/nexus-ui/loader";
import {
  getInlineCitationMarkdown,
  type InlineCitationSource,
} from "@/components/nexus-ui/examples/message/inline-citations";
import PerplexityIcon from "@/components/svgs/perplexity";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import GeminiIcon from "@/components/svgs/gemini";
import {
  ArrowUp02Icon,
  Copy01Icon,
  Edit04Icon,
  PlusSignIcon,
  RepeatIcon,
  SquareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const imgUser = "/assets/user-avatar.avif";
const imgAssistant = "/assets/nexus-avatar.png";

/**
 * `value` is either a Vercel AI Gateway id or a Perplexity Sonar id — see `/api/chat`.
 */
const models = [
  {
    value: "sonar",
    icon: PerplexityIcon,
    title: "Perplexity Sonar",
    description: "Search + citations",
  },
  {
    value: "sonar-pro",
    icon: PerplexityIcon,
    title: "Perplexity Sonar Pro",
    description: "Deeper search",
  },
  {
    value: "sonar-deep-research",
    icon: PerplexityIcon,
    title: "Perplexity Sonar Deep Research",
    description: "Multi-step research",
  },
  {
    value: "openai/gpt-4o",
    icon: ChatgptIcon,
    title: "GPT-4o",
    description: "Most capable",
  },
  {
    value: "openai/gpt-4o-mini",
    icon: ChatgptIcon,
    title: "GPT-4o Mini",
    description: "Fast",
  },
  {
    value: "anthropic/claude-sonnet-4.5",
    icon: ClaudeIcon2,
    title: "Claude Sonnet 4.5",
    description: "Strong reasoning",
  },
  {
    value: "google/gemini-2.0-flash",
    icon: GeminiIcon,
    title: "Gemini 2.0 Flash",
    description: "Fast and versatile",
  },
] as const;

function textFromMessage(message: UIMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("");
}

function isAssistantTextStreaming(message: UIMessage) {
  return message.parts
    .filter(isTextUIPart)
    .some((p) => p.state === "streaming");
}

function sourceUrlPartsFromMessage(message: UIMessage) {
  return message.parts.filter(
    (p): p is Extract<UIMessage["parts"][number], { type: "source-url" }> =>
      p.type === "source-url",
  );
}

/** Stays the same for the pre-SDK row and the real UIMessage so the shell does not remount. */
const PENDING_ASSISTANT_ID = "__nexus-pending-assistant__";

function isPendingAssistantMessage(m: UIMessage) {
  return m.id === PENDING_ASSISTANT_ID;
}

/**
 * Assumes each assistant is preceded by a user. Keys that pair to one stable row
 * through synthetic → real handoff.
 */
function messageRowListKey(m: UIMessage, index: number, rowList: UIMessage[]) {
  if (m.role === "user" || m.role === "system") {
    return m.id;
  }
  const prev = rowList[index - 1];
  if (prev?.role === "user") {
    return `${prev.id}::assistant-handoff`;
  }
  return m.id;
}

type MessagesProps = {
  displayRows: UIMessage[];
  status: ReturnType<typeof useChat>["status"];
  copyMessage: (text: string) => void;
  busy: boolean;
  regenerate: ReturnType<typeof useChat>["regenerate"];
};

function Messages({
  displayRows,
  status,
  copyMessage,
  busy,
  regenerate,
}: MessagesProps) {
  const pendingAssistantNoEntryColumn = (
    <div className="relative flex min-h-7 min-w-0 flex-1 items-stretch px-2 pt-1">
      <TypingLoader size="md" className="absolute" />
    </div>
  );

  return (
    <>
      {displayRows.map((m, i) => {
        const from = m.role === "user" ? "user" : "assistant";
        const text = textFromMessage(m);
        const isLast = i === displayRows.length - 1;
        const sourceUrls = sourceUrlPartsFromMessage(m);
        const inlineCitationSources = sourceUrls.map((source) => ({
          url: source.url,
          title: source.title?.trim() || source.url,
        })) satisfies InlineCitationSource[];
        const { markdownText, components } = getInlineCitationMarkdown(
          text,
          inlineCitationSources,
        );

        let mainColumn: React.ReactNode;
        if (from === "user") {
          mainColumn = (
            <MessageStack>
              <MessageContent>
                <MessageMarkdown>{text}</MessageMarkdown>
              </MessageContent>
              <MessageActions className="opacity-0 transition-opacity group-hover/message:opacity-100">
                <MessageActionGroup>
                  <MessageAction asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                      aria-label="Edit message"
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
                      className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                      aria-label="Copy message"
                      onClick={() => copyMessage(text)}
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
          );
        } else {
          const assistantIsLoading =
            text === "" &&
            isLast &&
            (status === "streaming" || status === "submitted");
          if (isPendingAssistantMessage(m) || assistantIsLoading) {
            mainColumn = pendingAssistantNoEntryColumn;
          } else {
            mainColumn = (
              <motion.div
                className="flex min-w-0 flex-1 flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <MessageStack>
                  <MessageContent>
                    <MessageMarkdown
                      isAnimating={isAssistantTextStreaming(m)}
                      components={components}
                    >
                      {markdownText}
                    </MessageMarkdown>
                  </MessageContent>
                  {!isAssistantTextStreaming(m) && text.length > 0 ? (
                    <MessageActions>
                      <MessageActionGroup>
                        <MessageAction asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                            aria-label="Copy message"
                            onClick={() => copyMessage(text)}
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
                            className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                            aria-label="Good response"
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
                            className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                            aria-label="Bad response"
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
                            className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                            aria-label="Regenerate"
                            disabled={busy}
                            onClick={() => void regenerate({ messageId: m.id })}
                          >
                            <HugeiconsIcon
                              icon={RepeatIcon}
                              strokeWidth={2.0}
                              className="size-4"
                            />
                          </Button>
                        </MessageAction>
                        <MessageAction className="ml-1">
                          {sourceUrls.length > 0 ? (
                            <Citation
                              citations={sourceUrls.map((s) => ({
                                url: s.url,
                                title: s.title?.trim() || s.url,
                              }))}
                            >
                              <CitationSourcesBadge />
                            </Citation>
                          ) : null}
                        </MessageAction>
                      </MessageActionGroup>
                    </MessageActions>
                  ) : null}
                </MessageStack>
              </motion.div>
            );
          }
        }

        return (
          <motion.div
            key={messageRowListKey(m, i, displayRows)}
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
              delay: from === "assistant" ? 0.14 : 0,
            }}
          >
            {from === "user" ? (
              <Message from="user">
                {mainColumn}
                <MessageAvatar src={imgUser} alt="" fallback="U" />
              </Message>
            ) : (
              <Message from="assistant">
                <MessageAvatar src={imgAssistant} alt="" fallback="A" />
                {mainColumn}
              </Message>
            )}
          </motion.div>
        );
      })}
    </>
  );
}

export default function MessageDemo() {
  const copyMessage = React.useCallback((text: string) => {
    void navigator.clipboard?.writeText(text);
  }, []);

  const [model, setModel] = React.useState<string>(models[0].value);
  const modelRef = React.useRef(model);
  modelRef.current = model;

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ model: modelRef.current }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop, regenerate, error, clearError } =
    useChat({ transport });

  const [input, setInput] = React.useState("");

  const busy = status === "streaming" || status === "submitted";

  const visibleMessages = React.useMemo(
    () => messages.filter((m) => m.role !== "system"),
    [messages],
  );

  const lastMessage = visibleMessages[visibleMessages.length - 1];

  const showPendingAssistantRow =
    status === "submitted" && lastMessage?.role === "user";

  const displayRows: UIMessage[] = React.useMemo(() => {
    if (showPendingAssistantRow) {
      return [
        ...visibleMessages,
        {
          id: PENDING_ASSISTANT_ID,
          role: "assistant" as const,
          parts: [],
        },
      ];
    }
    return visibleMessages;
  }, [visibleMessages, showPendingAssistantRow]);

  const handleSubmit = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || busy) return;
      setInput("");
      await sendMessage({ text: trimmed });
    },
    [busy, sendMessage],
  );

  return (
    <div className="relative flex h-screen items-start px-0 pt-5 lg:px-0 lg:pt-20">
      <Thread className="h-[75vh]">
        <ThreadContent className="mx-auto max-w-2xl pb-40">
          <Messages
            displayRows={displayRows}
            status={status}
            copyMessage={copyMessage}
            busy={busy}
            regenerate={regenerate}
          />
        </ThreadContent>
        <ThreadScrollToBottom className="bottom-0 z-50" />
      </Thread>

      <div className="fixed right-0 bottom-0 left-0 z-10 flex w-full items-center justify-center border-t border-accent bg-background/70 px-6 pt-6 pb-12 backdrop-blur-sm dark:bg-background/95">
        <div className="mx-auto w-full max-w-xl space-y-2">
          {error ? (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <span className="min-w-0 flex-1">{error.message}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => clearError()}
              >
                Dismiss
              </Button>
            </div>
          ) : null}
          <PromptInput
            onSubmit={(v) => void handleSubmit(v)}
            className="shadow-sm"
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={busy}
            />
            <PromptInputActions>
              <PromptInputActionGroup>
                <PromptInputAction asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer rounded-full text-secondary-foreground active:scale-97 disabled:opacity-70 hover:dark:bg-secondary"
                    aria-label="More actions"
                    disabled={busy}
                  >
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      strokeWidth={2.0}
                      className="size-4"
                    />
                  </Button>
                </PromptInputAction>
              </PromptInputActionGroup>
              <PromptInputActionGroup>
                <PromptInputAction asChild>
                  <ModelSelector
                    value={model}
                    onValueChange={setModel}
                    items={[...models]}
                  >
                    <ModelSelectorTrigger variant="ghost" disabled={busy} />
                    <ModelSelectorContent className="w-[264px]" align="end">
                      <ModelSelectorGroup>
                        <ModelSelectorLabel>Select model</ModelSelectorLabel>
                        <ModelSelectorRadioGroup
                          value={model}
                          onValueChange={setModel}
                        >
                          {models.map((m) => (
                            <ModelSelectorRadioItem
                              key={m.value}
                              value={m.value}
                              icon={m.icon}
                              title={m.title}
                              description={m.description}
                            />
                          ))}
                        </ModelSelectorRadioGroup>
                      </ModelSelectorGroup>
                    </ModelSelectorContent>
                  </ModelSelector>
                </PromptInputAction>
                <PromptInputAction asChild>
                  <Button
                    type="button"
                    size="icon-sm"
                    className="cursor-pointer rounded-full active:scale-97 disabled:opacity-70"
                    disabled={!busy && !input.trim()}
                    onClick={() => {
                      if (busy) {
                        void stop();
                        return;
                      }
                      void handleSubmit(input);
                    }}
                    aria-label={busy ? "Stop generation" : "Send message"}
                  >
                    {busy ? (
                      <HugeiconsIcon
                        icon={SquareIcon}
                        strokeWidth={2.0}
                        className="size-3.5 fill-current"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={ArrowUp02Icon}
                        strokeWidth={2.0}
                        className="size-4"
                      />
                    )}
                  </Button>
                </PromptInputAction>
              </PromptInputActionGroup>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
