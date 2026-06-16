"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnChange } from "@/lib/use-on-change";
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
import { toast, Toaster } from "@/components/nexus-ui/toaster";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import {
  Question,
  QuestionOption,
  QuestionOptions,
  QuestionOther,
  type QuestionInput,
  Questions,
  QuestionsCarousel,
  QuestionsCarouselContent,
  QuestionsCarouselIndex,
  QuestionsCarouselItem,
  QuestionsCarouselNext,
  QuestionsCarouselPagination,
  QuestionsCarouselPrev,
  QuestionsFooter,
  QuestionsHeader,
  QuestionsSkip,
  QuestionsSubmit,
  QuestionsTitle,
  type QuestionsSubmission,
} from "@/components/nexus-ui/questions";
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
const DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";
const TOASTER_ID = "questions-demo-toaster";

const models = [
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

type ClarifyingQuestionsInput = {
  questions: QuestionInput[];
};

type ToolPartLike = Extract<
  UIMessage["parts"][number],
  { type: `tool-${string}` }
>;

type ClarifyingQuestionsToolPart = ToolPartLike & {
  type: "tool-askClarifyingQuestions";
  input?: ClarifyingQuestionsInput;
};

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

function clarifyingQuestionsPartFromMessage(
  message: UIMessage,
): ClarifyingQuestionsToolPart | undefined {
  const part = message.parts.find(
    (p) => p.type === "tool-askClarifyingQuestions",
  );
  if (!part || part.type !== "tool-askClarifyingQuestions") {
    return undefined;
  }
  return part as ClarifyingQuestionsToolPart;
}

const PENDING_ASSISTANT_ID = "__nexus-pending-assistant__";

function isPendingAssistantMessage(m: UIMessage) {
  return m.id === PENDING_ASSISTANT_ID;
}

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

function promptFromSubmissionEntry(
  prompt: QuestionsSubmission[number]["prompt"],
): string {
  if (typeof prompt === "string") return prompt;
  return String(prompt);
}

function formatAnswers(submission: QuestionsSubmission): string {
  return submission
    .map((entry) => {
      const prompt = promptFromSubmissionEntry(entry.prompt);
      if (entry.type === "single") {
        const answer =
          typeof entry.answer.label === "string"
            ? entry.answer.label
            : String(entry.answer.label);
        return `Q: ${prompt}\nA: ${answer}`;
      }
      const labels = entry.answer
        .map((item) =>
          typeof item.label === "string" ? item.label : String(item.label),
        )
        .join(", ");
      return `Q: ${prompt}\nA: ${labels}`;
    })
    .join("\n\n");
}

function isQaAnswersMessage(text: string) {
  return /^Q:\s/m.test(text.trim());
}

type ClarifyingQuestionsBlockProps = {
  items: QuestionInput[];
  toolCallId: string;
  chatReady: boolean;
  onSubmit: (toolCallId: string, submission: QuestionsSubmission) => void;
};

function ClarifyingQuestionsBlock({
  items,
  toolCallId,
  chatReady,
  onSubmit,
}: ClarifyingQuestionsBlockProps) {
  const hasMultiple = items.length > 1;
  const skippableItems = React.useMemo(
    () => items.map((question) => ({ ...question, required: false })),
    [items],
  );

  return (
    <Questions
      items={skippableItems}
      onSubmit={(submission) => onSubmit(toolCallId, submission)}
      className="w-full max-w-none shadow-sm"
    >
      <QuestionsCarousel>
        <QuestionsHeader>
          <QuestionsTitle />
          {hasMultiple ? (
            <QuestionsCarouselPagination>
              <QuestionsCarouselPrev />
              <QuestionsCarouselIndex format="of" />
              <QuestionsCarouselNext />
            </QuestionsCarouselPagination>
          ) : null}
        </QuestionsHeader>

        <QuestionsCarouselContent className="mx-0">
          {skippableItems.map((question) => (
            <QuestionsCarouselItem key={question.id}>
              <Question id={question.id}>
                <QuestionOptions>
                  {question.options.map((option) => (
                    <QuestionOption key={option.value} value={option.value}>
                      {option.label}
                    </QuestionOption>
                  ))}
                  <QuestionOther />
                </QuestionOptions>
              </Question>
            </QuestionsCarouselItem>
          ))}
        </QuestionsCarouselContent>
      </QuestionsCarousel>

      <QuestionsFooter>
        {hasMultiple ? <QuestionsSkip /> : null}
        <QuestionsSubmit disabled={!chatReady} />
      </QuestionsFooter>
    </Questions>
  );
}

type MessagesProps = {
  displayRows: UIMessage[];
  status: ReturnType<typeof useChat>["status"];
  copyMessage: (text: string) => void;
  busy: boolean;
  regenerate: ReturnType<typeof useChat>["regenerate"];
  messageReactions: Record<string, "helpful" | "not-helpful">;
  onMessageReactionToggle: (
    messageId: string,
    vote: "helpful" | "not-helpful",
  ) => void;
  submittedClarificationToolCallIds: ReadonlySet<string>;
  onQuestionsSubmit: (
    toolCallId: string,
    submission: QuestionsSubmission,
  ) => void;
};

function Messages({
  displayRows,
  status,
  copyMessage,
  busy,
  regenerate,
  messageReactions,
  onMessageReactionToggle,
  submittedClarificationToolCallIds,
  onQuestionsSubmit,
}: MessagesProps) {
  const previousUserMessageRef = React.useRef<HTMLDivElement | null>(null);
  const [previousUserMessageHeight, setPreviousUserMessageHeight] =
    React.useState(0);

  const previousUserMessageIndex = React.useMemo(() => {
    const lastIndex = displayRows.length - 1;
    if (lastIndex < 0 || displayRows[lastIndex]?.role !== "assistant") {
      return -1;
    }

    for (let index = lastIndex - 1; index >= 0; index -= 1) {
      if (displayRows[index]?.role === "user") {
        return index;
      }
    }

    return -1;
  }, [displayRows]);

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

  const chatReady = status === "ready";

  return (
    <>
      {displayRows.map((m, i) => {
        const from = m.role === "user" ? "user" : "assistant";
        const messageReaction = messageReactions[m.id] ?? null;
        const text = textFromMessage(m);
        const clarifyingPart = clarifyingQuestionsPartFromMessage(m);
        const clarifyingQuestions = clarifyingPart?.input?.questions ?? [];
        const isLast = i === displayRows.length - 1;
        const clarifyingResolved =
          clarifyingPart &&
          submittedClarificationToolCallIds.has(clarifyingPart.toolCallId);
        const showClarifyingQuestions =
          clarifyingPart?.state === "input-available" &&
          clarifyingQuestions.length > 0 &&
          !clarifyingResolved;
        const showClarifyingStreaming =
          clarifyingPart?.state === "input-streaming";
        const introTextComplete =
          text.length > 0 &&
          !isAssistantTextStreaming(m) &&
          !isPendingAssistantMessage(m);
        const hasPendingClarifyingTool =
          clarifyingPart &&
          !clarifyingResolved &&
          clarifyingPart.state !== "output-available" &&
          clarifyingPart.state !== "output-error";
        const showPreparingQuestions =
          isLast &&
          hasPendingClarifyingTool &&
          !showClarifyingQuestions &&
          introTextComplete &&
          (showClarifyingStreaming ||
            (clarifyingPart?.state === "input-available" &&
              clarifyingQuestions.length === 0));

        let mainColumn: React.ReactNode;
        if (from === "user") {
          mainColumn = (
            <MessageStack>
              <MessageContent>
                {isQaAnswersMessage(text) ? (
                  <div className="text-sm leading-6 whitespace-pre-line">
                    {text}
                  </div>
                ) : (
                  <MessageMarkdown>{text}</MessageMarkdown>
                )}
              </MessageContent>
              <MessageActions className="opacity-0 transition-opacity group-hover/message:opacity-100">
                <MessageActionGroup>
                  <MessageAction
                    asChild
                    tooltip={{ content: "Edit", shortcut: "E" }}
                  >
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
                  <MessageAction asChild tooltip="Copy">
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
            !showClarifyingQuestions &&
            !showClarifyingStreaming &&
            isLast &&
            (status === "streaming" || status === "submitted");
          const assistantIsPending =
            isPendingAssistantMessage(m) || assistantIsLoading;
          const showAssistantResponse = text.length > 0;
          const showThinking =
            (assistantIsPending || showClarifyingStreaming) &&
            !showClarifyingQuestions &&
            !showPreparingQuestions &&
            text.length === 0;

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
                {showThinking ? (
                  <TextShimmer
                    className="mb-1 ml-2 text-sm leading-6 text-muted-foreground"
                    spread={10}
                    invertLight
                  >
                    Thinking...
                  </TextShimmer>
                ) : null}
                {showAssistantResponse ? (
                  <MessageContent>
                    <MessageMarkdown isAnimating={isAssistantTextStreaming(m)}>
                      {text}
                    </MessageMarkdown>
                  </MessageContent>
                ) : null}
                {showPreparingQuestions ? (
                  <TextShimmer
                    className="mt-2 ml-2 text-sm leading-6 text-muted-foreground"
                    spread={10}
                    invertLight
                  >
                    Preparing questions...
                  </TextShimmer>
                ) : null}
                {showClarifyingQuestions ? (
                  <ClarifyingQuestionsBlock
                    items={clarifyingQuestions}
                    toolCallId={clarifyingPart.toolCallId}
                    chatReady={chatReady}
                    onSubmit={onQuestionsSubmit}
                  />
                ) : null}
                {showAssistantResponse &&
                !isAssistantTextStreaming(m) &&
                text.length > 0 ? (
                  <MessageActions>
                    <MessageActionGroup>
                      <MessageAction asChild tooltip="Copy response">
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
                      <MessageAction asChild tooltip="Like">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                          aria-label="Good response"
                          onClick={(event) => {
                            event.currentTarget.blur();
                            onMessageReactionToggle(m.id, "helpful");
                            toast.default("Marked response as helpful.", {
                              description:
                                "Thanks for the feedback on this answer.",
                              toasterId: TOASTER_ID,
                              position: "bottom-center",
                              action: {
                                label: "Undo",
                                onClick: () =>
                                  onMessageReactionToggle(m.id, "helpful"),
                              },
                            });
                          }}
                        >
                          <HugeiconsIcon
                            icon={ThumbsUpIcon}
                            strokeWidth={2.0}
                            className={cn(
                              "size-4",
                              messageReaction === "helpful" && "fill-current",
                            )}
                          />
                        </Button>
                      </MessageAction>
                      <MessageAction asChild tooltip="Dislike">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97"
                          aria-label="Bad response"
                          onClick={(event) => {
                            event.currentTarget.blur();
                            onMessageReactionToggle(m.id, "not-helpful");
                            toast.default("Marked response as not helpful.", {
                              description:
                                "Your feedback helps improve future responses.",
                              toasterId: TOASTER_ID,
                              position: "bottom-center",
                              action: {
                                label: "Undo",
                                onClick: () =>
                                  onMessageReactionToggle(m.id, "not-helpful"),
                              },
                            });
                          }}
                        >
                          <HugeiconsIcon
                            icon={ThumbsDownIcon}
                            strokeWidth={2.0}
                            className={cn(
                              "size-4",
                              messageReaction === "not-helpful" &&
                                "fill-current",
                            )}
                          />
                        </Button>
                      </MessageAction>
                      <MessageAction asChild tooltip="Regenerate">
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
                    </MessageActionGroup>
                  </MessageActions>
                ) : null}
              </MessageStack>
            </motion.div>
          );
        }

        const rowKey = messageRowListKey(m, i, displayRows);
        const hasEarlierAssistant = displayRows
          .slice(0, i)
          .some((row) => row.role === "assistant");
        const useAssistantMinHeight =
          from === "assistant" && isLast && hasEarlierAssistant;
        const assistantMinHeightStyle = useAssistantMinHeight
          ? ({
              "--questions-prev-user-height": `${previousUserMessageHeight}px`,
            } as React.CSSProperties)
          : undefined;

        return (
          <motion.div
            key={rowKey}
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
              <Message
                from="user"
                ref={
                  i === previousUserMessageIndex
                    ? attachPreviousUserMessageRef
                    : undefined
                }
              >
                {mainColumn}
                <MessageAvatar src={imgUser} alt="" fallback="U" />
              </Message>
            ) : (
              <Message
                from="assistant"
                className={cn(
                  useAssistantMinHeight &&
                    "min-h-[calc(var(--questions-thread-height)-var(--questions-prev-user-height)-var(--questions-thread-content-gap)-var(--questions-thread-content-bottom-padding)-var(--questions-min-height-misc))]",
                )}
                style={assistantMinHeightStyle}
              >
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

export default function QuestionsDemo() {
  const copyMessage = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.default("Message copied to clipboard.", {
        toasterId: TOASTER_ID,
        position: "bottom-right",
      });
    } catch {
      toast.error("Copy failed.", {
        description: "Could not write to clipboard. Try again.",
        toasterId: TOASTER_ID,
        position: "top-center",
      });
    }
  }, []);

  const [model, setModel] = React.useState<string>(DEFAULT_MODEL);

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/demo/questions-chat",
        body: () => ({ model }),
      }),
    [model],
  );

  const {
    messages,
    sendMessage,
    status,
    stop,
    regenerate,
    error,
    addToolOutput,
  } = useChat({
    transport,
  });

  const [input, setInput] = React.useState("");
  const [
    submittedClarificationToolCallIds,
    setSubmittedClarificationToolCallIds,
  ] = React.useState<ReadonlySet<string>>(() => new Set());
  const [messageReactions, setMessageReactions] = React.useState<
    Record<string, "helpful" | "not-helpful">
  >({});
  const modelToastRef = React.useRef(model);
  const lastErrorToastMessageRef = React.useRef<string | null>(null);

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

  React.useEffect(() => {
    if (modelToastRef.current === model) {
      return;
    }

    const selectedModel = models.find((item) => item.value === model);
    toast.info("Model switched.", {
      description: `Now using ${selectedModel?.title ?? model}.`,
      toasterId: TOASTER_ID,
      position: "bottom-left",
    });
    modelToastRef.current = model;
  }, [model]);

  React.useEffect(() => {
    const currentErrorMessage = error?.message ?? null;

    if (!currentErrorMessage) {
      lastErrorToastMessageRef.current = null;
      return;
    }

    if (lastErrorToastMessageRef.current === currentErrorMessage) {
      return;
    }

    toast.error("Request failed.", {
      description: currentErrorMessage,
      toasterId: TOASTER_ID,
      position: "top-center",
    });
    lastErrorToastMessageRef.current = currentErrorMessage;
  }, [error]);

  const handleSubmit = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || busy) return;
      setInput("");
      await sendMessage({ text: trimmed });
    },
    [busy, sendMessage],
  );

  const handleQuestionsSubmit = React.useCallback(
    async (toolCallId: string, submission: QuestionsSubmission) => {
      setSubmittedClarificationToolCallIds((prev) => {
        const next = new Set(prev);
        next.add(toolCallId);
        return next;
      });

      await addToolOutput({
        tool: "askClarifyingQuestions",
        toolCallId,
        output: { submittedViaUserMessage: true },
      });

      await sendMessage({ text: formatAnswers(submission) });
    },
    [addToolOutput, sendMessage],
  );

  const showSimulatedErrorToast = React.useCallback(() => {
    toast.error("Attachment upload failed.", {
      description: "File exceeded the 20MB limit.",
      toasterId: TOASTER_ID,
      position: "top-right",
    });
  }, []);

  return (
    <div className="relative flex h-screen items-start px-0 pt-5 lg:px-0 lg:pt-17.25">
      <Toaster id={TOASTER_ID} />
      <Thread
        className="h-(--questions-thread-height)"
        style={
          {
            "--questions-thread-height": "75vh",
            "--questions-thread-content-gap": "24px",
            "--questions-thread-content-bottom-padding": "160px",
            "--questions-min-height-misc": "2px",
          } as React.CSSProperties
        }
      >
        <ThreadContent className="mx-auto max-w-2xl gap-(--questions-thread-content-gap) pb-(--questions-thread-content-bottom-padding)">
          <Messages
            displayRows={displayRows}
            status={status}
            copyMessage={copyMessage}
            busy={busy}
            regenerate={regenerate}
            messageReactions={messageReactions}
            onMessageReactionToggle={(messageId, vote) =>
              setMessageReactions((prev) => {
                if (prev[messageId] === vote) {
                  const next = { ...prev };
                  delete next[messageId];
                  return next;
                }

                return { ...prev, [messageId]: vote };
              })
            }
            submittedClarificationToolCallIds={
              submittedClarificationToolCallIds
            }
            onQuestionsSubmit={handleQuestionsSubmit}
          />
        </ThreadContent>
        <ThreadScrollToBottom className="bottom-0 z-50" />
      </Thread>

      <div className="fixed right-0 bottom-0 left-0 z-10 flex w-full items-center justify-center border-t border-accent bg-background/70 px-6 pt-6 pb-12 backdrop-blur-sm dark:bg-background/95">
        <div className="mx-auto w-full max-w-xl">
          <PromptInput
            onSubmit={(v) => void handleSubmit(v)}
            className="shadow-sm"
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something vague — e.g. help me plan a trip…"
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
                    aria-label="Simulate tool error toast"
                    disabled={busy}
                    onClick={showSimulatedErrorToast}
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
