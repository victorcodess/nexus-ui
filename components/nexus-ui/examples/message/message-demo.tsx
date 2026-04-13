"use client";

import * as React from "react";
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
import PromptInput, {
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { TypingLoader } from "@/components/nexus-ui/loader";
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
import { defaultRehypePlugins } from "streamdown";

/**
 * Second demo reply only: omit `rehype-harden` so
 * https://medlineplus.gov/healthyhabits.html is not treated as a blocked
 * external link (sanitize + raw still run).
 */
const ASSISTANT_SHORT_REHYPE_PLUGINS = [
  defaultRehypePlugins.raw,
  defaultRehypePlugins.sanitize,
] as const;

const imgUser = "/assets/user-avatar.avif";
const imgAssistant = "/assets/nexus-avatar.png";

/** Predetermined assistant copy — cycles per exchange (0 → 1 → 2 → …). */
const ASSISTANT_RESPONSE_HELLO = `Hello! I'm here whenever you want to **brainstorm**, draft something, or step through a problem—just say what you're working on.`;

/** Reads like an answer to: “I’m wiped after work and keep dropping my own plans—any gentle tips?” */
const ASSISTANT_RESPONSE_SHORT = `That’s such a normal place to be—*evening you* rarely has the same fuel *morning you* assumed.

**Shrink the bar first.** Ten minutes still counts: a short walk, one chore, or a single checklist item builds momentum you can ride the next day.

A few patterns people swear by:

- Anchor the habit to something you **already** do—laptop closed, kettle on, kids in bed
- Keep one *“minimum viable day”* version (five minutes of piano, one stretch, one journal line)
- When you slip, treat it as a bump—not proof you’ve failed; small overview of sleep and routine from [NIH MedlinePlus](https://medlineplus.gov/healthyhabits.html) if you want a grounded reference

You don’t need a perfect schedule—just the next small step you’ll actually take.`;

/** Reads like an answer to: “Rough idea for a weekend trip budget?” */
const ASSISTANT_RESPONSE_TABLE_CODE = `## Weekend trip — ballpark budget

Plug in your own numbers, but this frame keeps surprises smaller:

| Category | Rough range | What it usually covers |
| -------- | ----------- | ---------------------- |
| Stay | $180–450 | Hotels or short rentals, taxes/fees |
| Food | $100–220 | Mix of groceries, cafés, one nicer dinner |
| Getting around | $35–90 | Gas, trains, parking, or a few rideshares |
| Fun | $40–150 | Tickets, shops, whatever fills your cup |

Treat it as a starting point—your city, season, and travel style will move the rows up or down.`;

const ASSISTANT_RESPONSES = [
  ASSISTANT_RESPONSE_HELLO,
  ASSISTANT_RESPONSE_SHORT,
  ASSISTANT_RESPONSE_TABLE_CODE,
] as const;

const models = [
  {
    value: "gpt-4",
    icon: ChatgptIcon,
    title: "GPT-4",
    description: "Most capable",
  },
  {
    value: "gpt-4o-mini",
    icon: ChatgptIcon,
    title: "GPT-4o Mini",
    description: "Fast",
  },
  {
    value: "claude-3.5",
    icon: ClaudeIcon2,
    title: "Claude 3.5",
    description: "Strong reasoning",
  },
  {
    value: "gemini-1.5-flash",
    icon: GeminiIcon,
    title: "Gemini 1.5 Flash",
    description: "Fast and versatile",
  },
] as const;

type UserMessage = {
  id: string;
  from: "user";
  text: string;
};

type AssistantMessage = {
  id: string;
  from: "assistant";
  /** Streamed markdown shown in the thread. */
  text: string;
  /** Full predetermined markdown; `text` catches up via streaming. */
  targetText: string;
  /** Typing loader in the thread before streaming starts. */
  pending: boolean;
  /** False until `text` reaches `targetText`. */
  streamComplete: boolean;
};

type ChatMessage = UserMessage | AssistantMessage;

const ASSISTANT_STREAM_MS_PER_CHAR = 14;

/**
 * Appends `targetText` to the assistant message character by character.
 * Clears any existing interval for the same `assistantId`.
 */
function streamAssistantResponse(
  assistantId: string,
  targetText: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  intervalsRef: React.MutableRefObject<Map<string, number>>,
) {
  const prevInterval = intervalsRef.current.get(assistantId);
  if (prevInterval != null) {
    window.clearInterval(prevInterval);
  }

  let nextLen = 0;
  const intervalId = window.setInterval(() => {
    nextLen += 1;
    const slice = targetText.slice(0, nextLen);
    const done = nextLen >= targetText.length;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantId && msg.from === "assistant"
          ? {
              ...msg,
              text: slice,
              streamComplete: done,
            }
          : msg,
      ),
    );

    if (done) {
      window.clearInterval(intervalId);
      intervalsRef.current.delete(assistantId);
    }
  }, ASSISTANT_STREAM_MS_PER_CHAR);

  intervalsRef.current.set(assistantId, intervalId);
}

export default function MessageDemo() {
  const copyMessage = React.useCallback((text: string) => {
    void navigator.clipboard?.writeText(text);
  }, []);

  const assistantRevealTimeoutsRef = React.useRef<number[]>([]);
  const assistantStreamIntervalsRef = React.useRef<Map<string, number>>(
    new Map(),
  );

  React.useEffect(() => {
    const timeouts = assistantRevealTimeoutsRef.current;
    const intervals = assistantStreamIntervalsRef.current;
    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      intervals.forEach((id) => window.clearInterval(id));
      intervals.clear();
    };
  }, []);

  const [model, setModel] = React.useState<string>(models[0].value);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  const awaitingAssistantResponse = messages.some(
    (msg) => msg.from === "assistant" && (msg.pending || !msg.streamComplete),
  );

  const handleSubmit = React.useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();

    setInput("");
    let assistantTarget = "";
    setMessages((prev) => {
      const assistantIndex =
        prev.filter((msg) => msg.from === "assistant").length %
        ASSISTANT_RESPONSES.length;
      assistantTarget = ASSISTANT_RESPONSES[assistantIndex];
      return [
        ...prev,
        { id: userId, from: "user", text: trimmed },
        {
          id: assistantId,
          from: "assistant",
          text: "",
          targetText: assistantTarget,
          pending: true,
          streamComplete: false,
        },
      ];
    });

    const revealId = window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId && msg.from === "assistant"
            ? { ...msg, pending: false, text: "" }
            : msg,
        ),
      );
      streamAssistantResponse(
        assistantId,
        assistantTarget,
        setMessages,
        assistantStreamIntervalsRef,
      );
    }, 2000);
    assistantRevealTimeoutsRef.current.push(revealId);
  }, []);

  return (
    <div className="relative flex h-screen items-start px-10 pt-20">
      <Thread className="h-[75vh]">
        <ThreadContent className="mx-auto max-w-2xl pb-40">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
                delay: m.from === "assistant" ? 0.14 : 0,
              }}
            >
              <Message from={m.from}>
                {m.from === "assistant" ? (
                  <MessageAvatar src={imgAssistant} alt="" fallback="A" />
                ) : null}
                {m.from === "assistant" && m.pending ? (
                  <div className="flex min-h-7 min-w-0 flex-1 items-center px-2 pt-1">
                    <TypingLoader size="md" />
                  </div>
                ) : m.from === "assistant" ? (
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
                          // animated={{ animation: "fadeIn", sep: "char" }}
                          isAnimating={!m.streamComplete}
                          linkSafety={
                            m.targetText === ASSISTANT_RESPONSE_SHORT
                              ? { enabled: false }
                              : undefined
                          }
                          rehypePlugins={
                            m.targetText === ASSISTANT_RESPONSE_SHORT
                              ? [...ASSISTANT_SHORT_REHYPE_PLUGINS]
                              : undefined
                          }
                        >
                          {m.text}
                        </MessageMarkdown>
                      </MessageContent>
                      {m.streamComplete ? (
                        <MessageActions>
                          <MessageActionGroup>
                            <MessageAction asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97 dark:text-white dark:hover:bg-border"
                                aria-label="Copy message"
                                onClick={() => copyMessage(m.targetText)}
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
                                className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97 dark:text-white dark:hover:bg-border"
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
                                className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97 dark:text-white dark:hover:bg-border"
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
                                className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97 dark:text-white dark:hover:bg-border"
                                aria-label="Regenerate"
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
                ) : (
                  <MessageStack>
                    <MessageContent>
                      <MessageMarkdown>{m.text}</MessageMarkdown>
                    </MessageContent>
                    <MessageActions>
                      <MessageActionGroup>
                        <MessageAction asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97 dark:text-white dark:hover:bg-border"
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
                            className="cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97 dark:text-white dark:hover:bg-border"
                            aria-label="Copy message"
                            onClick={() => copyMessage(m.text)}
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
                )}
                {m.from === "user" ? (
                  <MessageAvatar src={imgUser} alt="" fallback="U" />
                ) : null}
              </Message>
            </motion.div>
          ))}
        </ThreadContent>
        <ThreadScrollToBottom className="-bottom-0 z-50" />
      </Thread>

      <div className="fixed right-0 bottom-0 left-0 z-10 border-t border-border bg-background/70 pt-6 pb-12 backdrop-blur-sm dark:bg-background/95">
        <div className="mx-auto w-full max-w-xl">
          <PromptInput onSubmit={handleSubmit} className="shadow-sm">
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
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
                    <ModelSelectorTrigger variant="ghost" />
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
                    disabled={!awaitingAssistantResponse && !input.trim()}
                    onClick={() => input.trim() && handleSubmit(input)}
                    aria-label={
                      awaitingAssistantResponse
                        ? "Waiting for response"
                        : "Send message"
                    }
                  >
                    {awaitingAssistantResponse ? (
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
