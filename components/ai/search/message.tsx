"use client";

import { type ComponentProps, useCallback, useState } from "react";
import {
  AiBrain01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  RepeatIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  isReasoningUIPart,
  isTextUIPart,
  type Tool,
  type UIToolInvocation,
} from "ai";
import type {
  ChatUIMessage,
  SearchTool,
  SearchToolOutput,
} from "@/lib/ai/types";
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
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import {
  Suggestions,
  Suggestion,
  SuggestionList,
} from "@/components/nexus-ui/suggestions";
import {
  Citation,
  CitationContent,
  CitationItem,
  CitationSourcesBadge,
  CitationTrigger,
} from "@/components/nexus-ui/citation";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/nexus-ui/reasoning";
import {
  ChainOfThought,
  ChainOfThoughtComplete,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepContent,
  ChainOfThoughtStepTitle,
  ChainOfThoughtTrigger,
} from "@/components/nexus-ui/chain-of-thought";
import { toast } from "@/components/nexus-ui/toaster";
import { cn } from "@/lib/utils";
import { useChatContext } from "./context";
import { followupPrompts, normalizeSearchToolOutput } from "./helpers";

const messageActionButtonClass =
  "cursor-pointer rounded-full bg-transparent text-muted-foreground transition-all hover:bg-muted active:scale-97";

const hoverRevealActionsClass =
  "opacity-0 transition-opacity group-hover/message:opacity-100 group-focus-within/message:opacity-100";

async function copyMessageText(text: string) {
  if (!text.trim()) return;
  await navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

function parseAssistantMessage(message: ChatUIMessage) {
  const textParts = (message.parts ?? []).filter(isTextUIPart);
  const reasoningParts = (message.parts ?? []).filter(isReasoningUIPart);
  const searchCalls: UIToolInvocation<SearchTool>[] = [];

  for (const part of message.parts ?? []) {
    if (!part.type.startsWith("tool-")) continue;
    const toolName = part.type.slice("tool-".length);
    const p = part as UIToolInvocation<Tool>;
    if (toolName === "search" && p.toolCallId) searchCalls.push(p);
  }

  const markdown = textParts.map((part) => part.text).join("");
  const reasoningText = reasoningParts.map((part) => part.text).join("");
  const textIsStreaming = textParts.some((part) => part.state === "streaming");
  const reasoningIsStreaming = reasoningParts.some(
    (part) => part.state === "streaming",
  );

  return {
    markdown,
    reasoningText,
    searchCalls,
    textIsStreaming,
    reasoningIsStreaming,
    hasReasoning: reasoningParts.length > 0,
    hasToolSteps: searchCalls.length > 0,
  };
}

export function ChatMessage({
  message,
  showFollowUps = false,
  isStreaming = false,
  canRegenerate = false,
  onFollowUp,
  ...props
}: {
  message: ChatUIMessage;
  showFollowUps?: boolean;
  isStreaming?: boolean;
  canRegenerate?: boolean;
  onFollowUp?: (text: string) => void;
} & ComponentProps<"div">) {
  const { regenerate, status } = useChatContext();
  const [reaction, setReaction] = useState<"helpful" | "not-helpful" | null>(
    null,
  );
  const busy = status === "streaming" || status === "submitted";

  const isUser = message.role === "user";
  const userMarkdown = isUser
    ? (message.parts ?? [])
        .filter(isTextUIPart)
        .map((part) => part.text)
        .join("")
    : "";

  const assistant = !isUser ? parseAssistantMessage(message) : null;
  const citationSources = assistant
    ? getCitationSourcesFromSearchCalls(assistant.searchCalls)
    : [];

  const showInitialLoading =
    isStreaming &&
    assistant &&
    !assistant.hasReasoning &&
    !assistant.hasToolSteps &&
    assistant.markdown.trim().length === 0 &&
    !assistant.textIsStreaming;

  const showReasoning =
    assistant &&
    (assistant.hasReasoning || assistant.reasoningIsStreaming);

  const showChain = assistant?.hasToolSteps ?? false;

  const allSearchStepsDone =
    assistant &&
    assistant.hasToolSteps &&
    !assistant.searchCalls.some((call) => {
      const output = normalizeSearchToolOutput(call.output);
      return (
        !output &&
        call.state !== "output-error" &&
        call.state !== "output-denied"
      );
    });

  const canShowAnswerText =
    !assistant?.hasToolSteps || Boolean(allSearchStepsDone);

  const showAssistantResponse =
    assistant &&
    canShowAnswerText &&
    (assistant.markdown.trim().length > 0 || assistant.textIsStreaming);

  const showMissingResponse =
    assistant &&
    allSearchStepsDone &&
    !isStreaming &&
    assistant.markdown.trim().length === 0;

  const showAssistantActions =
    assistant &&
    assistant.markdown.trim().length > 0 &&
    !isStreaming &&
    !assistant.textIsStreaming;

  const toggleReaction = useCallback((vote: "helpful" | "not-helpful") => {
    setReaction((current) => (current === vote ? null : vote));
  }, []);

  return (
    <div onClick={(e) => e.stopPropagation()} {...props}>
      <Message from={isUser ? "user" : "assistant"} className="max-w-full">
        {isUser ? (
          <MessageStack>
            <MessageContent>
              <MessageMarkdown>{userMarkdown}</MessageMarkdown>
            </MessageContent>
            <MessageActions className={hoverRevealActionsClass}>
              <MessageActionGroup>
                <MessageAction asChild tooltip="Copy">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className={messageActionButtonClass}
                    aria-label="Copy message"
                    onClick={() => void copyMessageText(userMarkdown)}
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
        ) : (
          <MessageStack>
            {showInitialLoading ? (
              <MessageContent>
                <TextShimmer className="text-sm leading-6 text-muted-foreground">
                  Thinking...
                </TextShimmer>
              </MessageContent>
            ) : null}

            {showReasoning && assistant ? (
              <Reasoning
                isStreaming={
                  assistant.reasoningIsStreaming ||
                  (isStreaming && assistant.markdown.trim().length === 0)
                }
                className="mb-1 ml-2"
              >
                <ReasoningTrigger />
                <ReasoningContent>{assistant.reasoningText}</ReasoningContent>
              </Reasoning>
            ) : null}

            {showChain && assistant ? (
              <SearchChainOfThought
                searchCalls={assistant.searchCalls}
                isStreaming={isStreaming}
              />
            ) : null}

            {showMissingResponse ? (
              <MessageContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Search finished but no answer was generated. Try regenerating
                  or rephrasing your question.
                </p>
              </MessageContent>
            ) : null}

            {showAssistantResponse && assistant ? (
              <MessageContent>
                <MessageMarkdown isAnimating={assistant.textIsStreaming}>
                  {assistant.markdown}
                </MessageMarkdown>
              </MessageContent>
            ) : null}

            {showAssistantActions && assistant ? (
              <MessageActions>
                <MessageActionGroup>
                  <MessageAction asChild tooltip="Copy response">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className={messageActionButtonClass}
                      aria-label="Copy response"
                      onClick={() =>
                        void copyMessageText(assistant.markdown)
                      }
                    >
                      <HugeiconsIcon
                        icon={Copy01Icon}
                        strokeWidth={2.0}
                        className="size-4"
                      />
                    </Button>
                  </MessageAction>
                  {canRegenerate ? (
                    <MessageAction asChild tooltip="Regenerate">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className={messageActionButtonClass}
                        aria-label="Regenerate"
                        disabled={busy}
                        onClick={() =>
                          void regenerate({ messageId: message.id })
                        }
                      >
                        <HugeiconsIcon
                          icon={RepeatIcon}
                          strokeWidth={2.0}
                          className="size-4"
                        />
                      </Button>
                    </MessageAction>
                  ) : null}
                  {citationSources.length > 0 ? (
                    <MessageAction className="ml-1">
                      <Citation citations={citationSources}>
                        <CitationSourcesBadge />
                      </Citation>
                    </MessageAction>
                  ) : null}
                </MessageActionGroup>
              </MessageActions>
            ) : null}
          </MessageStack>
        )}
      </Message>

      {showFollowUps && onFollowUp && (
        <Suggestions onSelect={onFollowUp} className="mt-3">
          <SuggestionList className="justify-start">
            {followupPrompts.map((prompt) => (
              <Suggestion key={prompt} variant="outline" className="text-xs">
                {prompt}
              </Suggestion>
            ))}
          </SuggestionList>
        </Suggestions>
      )}
    </div>
  );
}

function searchQueryFromCall(call: UIToolInvocation<SearchTool>) {
  const input = call.input;
  if (input && typeof input === "object" && "query" in input) {
    const query = (input as { query: unknown }).query;
    if (typeof query === "string" && query.trim().length > 0) {
      return query.trim();
    }
  }
  return "nexus-ui docs";
}

function SearchChainOfThought({
  searchCalls,
  isStreaming,
}: {
  searchCalls: UIToolInvocation<SearchTool>[];
  isStreaming: boolean;
}) {
  const hasActiveSearch = searchCalls.some((call) => {
    const output = normalizeSearchToolOutput(call.output);
    return (
      !output &&
      call.state !== "output-error" &&
      call.state !== "output-denied"
    );
  });
  const hasToolError = searchCalls.some(
    (call) =>
      call.state === "output-error" || call.state === "output-denied",
  );
  const allToolStepsDone = searchCalls.length > 0 && !hasActiveSearch;
  const showCompleteRow = allToolStepsDone && !isStreaming;

  const triggerLabel = hasActiveSearch
    ? "Searching nexus-ui docs..."
    : allToolStepsDone && isStreaming
      ? "Preparing answer..."
      : showCompleteRow
        ? searchCalls.length === 1
          ? "Search complete"
          : `Completed search with ${searchCalls.length} steps`
        : "Searching nexus-ui docs...";

  return (
    <ChainOfThought
      autoCloseOnAllComplete={false}
      defaultOpen={hasActiveSearch || hasToolError || isStreaming}
      className="mb-1 ml-2"
    >
      <ChainOfThoughtTrigger
        icon={
          <HugeiconsIcon
            icon={AiBrain01Icon}
            strokeWidth={1.75}
            className="size-4"
          />
        }
      >
        {triggerLabel}
      </ChainOfThoughtTrigger>
      <ChainOfThoughtContent>
        {searchCalls.map((call) => (
          <SearchToolStep key={call.toolCallId} call={call} />
        ))}
        {showCompleteRow ? (
          <ChainOfThoughtComplete
            label={
              hasToolError
                ? "Finished with partial errors"
                : "Search complete"
            }
            icon={
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                strokeWidth={1.75}
                className="size-4"
              />
            }
          />
        ) : null}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}

function SearchToolStep({ call }: { call: UIToolInvocation<SearchTool> }) {
  const output = normalizeSearchToolOutput(call.output);
  const isLoading =
    !output &&
    call.state !== "output-error" &&
    call.state !== "output-denied";

  if (call.state === "output-error" || call.state === "output-denied") {
    return (
      <ChainOfThoughtStep status="error">
        <ChainOfThoughtStepTitle
          icon={
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
          }
          label={call.errorText ?? "Failed to search docs"}
        />
      </ChainOfThoughtStep>
    );
  }

  return (
    <ChainOfThoughtStep
      status={isLoading ? "active" : "completed"}
      hasContent={!isLoading && (output?.results.length ?? 0) > 0}
    >
      <ChainOfThoughtStepTitle
        icon={<HugeiconsIcon icon={Search01Icon} className="size-4" />}
        label={
          isLoading
            ? `Searching “${searchQueryFromCall(call)}”`
            : `Results for “${searchQueryFromCall(call)}”`
        }
      />
      {!isLoading && output && output.results.length > 0 ? (
        <ChainOfThoughtStepContent>
          <p className="text-xs text-muted-foreground">
            {output.resultCount} result
            {output.resultCount === 1 ? "" : "s"}
            {output.querySuggestion ? ` • Try: ${output.querySuggestion}` : ""}
          </p>
          <SourceCitationList output={output} />
        </ChainOfThoughtStepContent>
      ) : isLoading ? (
        <ChainOfThoughtStepContent>
          <TextShimmer className="text-xs text-muted-foreground">
            Finding the best docs sections for this question...
          </TextShimmer>
        </ChainOfThoughtStepContent>
      ) : null}
    </ChainOfThoughtStep>
  );
}

function getCitationSourcesFromSearchCalls(
  searchCalls: UIToolInvocation<SearchTool>[],
) {
  const seen = new Set<string>();
  const sources: { url: string; title: string; description?: string }[] = [];

  for (const call of searchCalls) {
    const output = normalizeSearchToolOutput(call.output);
    if (!output) continue;
    for (const result of output.results.slice(0, 3)) {
      const key = `${result.url}:${result.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      sources.push({
        url: result.url,
        title: result.title,
        description: [result.section, result.snippet].filter(Boolean).join(" — "),
      });
    }
  }

  return sources;
}

function SourceCitationList({ output }: { output: SearchToolOutput | null }) {
  if (!output || output.results.length === 0) return null;
  const sources = output.results.slice(0, 3).map((result) => ({
    url: result.url,
    title: result.title,
    description: [result.section, result.snippet].filter(Boolean).join(" — "),
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {sources.map((source) => (
        <Citation key={`${source.url}:${source.title}`} citations={[source]}>
          <CitationTrigger />
          <CitationContent>
            <CitationItem />
          </CitationContent>
        </Citation>
      ))}
    </div>
  );
}
