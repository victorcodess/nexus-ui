"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "motion/react";
import {
  Tool,
  ToolContent,
  ToolInput,
  ToolOutput,
  ToolTrigger,
  type ToolStatus,
} from "@/components/nexus-ui/tool";
import {
  Suggestion,
  SuggestionList,
  Suggestions,
} from "@/components/nexus-ui/suggestions";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";

type ToolPartLike = Extract<
  UIMessage["parts"][number],
  { type: `tool-${string}` }
>;
type DemoRun = {
  id: string;
  prompt: string;
};
type DemoEntry = {
  id: string;
  fallbackName: string;
  part?: ToolPartLike;
};

const promptPresets = [
  "What's the weather in London right now?",
  "What's the weather in Tokyo this evening?",
  "Get me the latest stock price for AAPL.",
  "Get me the latest stock price for NVDA.",
  "Convert 250 USD to EUR.",
  "Convert 1200 GBP to JPY.",
  // "Search the web for today's top AI product launches.",
  "Search the web for today's major climate tech news.",
  "Search the web for recent frontend framework releases.",
] as const;
const STATUS_STEP_MS = 1500;

function toolNameFromPartType(type: string): string {
  return type.startsWith("tool-") ? type.slice(5) : type;
}

function fallbackToolNameFromPrompt(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("weather")) return "displayWeather";
  if (lower.includes("stock")) return "getStockPrice";
  if (lower.includes("convert")) return "convertCurrency";
  if (lower.includes("search")) return "webSearch";
  return "tool_call";
}

function toolPartsFromMessage(message: UIMessage) {
  return message.parts.filter((part) =>
    part.type.startsWith("tool-"),
  ) as ToolPartLike[];
}

function ToolCard({
  entry,
  isOpen,
  onOpenChange,
}: {
  entry: DemoEntry;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const part = entry.part;
  const partState = part?.state;
  const finalStatus: ToolStatus =
    partState === "output-error" ? "error" : "completed";
  const [displayStatus, setDisplayStatus] =
    React.useState<ToolStatus>("pending");

  React.useEffect(() => {
    let nextStatus: ToolStatus | null = null;

    if (!part || partState === "input-streaming") return;

    if (partState === "input-available") {
      if (displayStatus === "pending") nextStatus = "ready";
      else if (displayStatus === "ready") nextStatus = "running";
    } else if (
      partState === "output-available" ||
      partState === "output-error"
    ) {
      if (displayStatus === "pending") nextStatus = "ready";
      else if (displayStatus === "ready") nextStatus = "running";
      else if (displayStatus === "running") nextStatus = finalStatus;
    }

    if (!nextStatus) return;

    const timer = window.setTimeout(() => {
      setDisplayStatus(nextStatus);
    }, STATUS_STEP_MS);

    return () => window.clearTimeout(timer);
  }, [displayStatus, finalStatus, part, partState]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 1 }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: displayStatus === "running" ? "saturate(1)" : "saturate(0.96)",
      }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <Tool
        status={displayStatus}
        open={isOpen}
        onOpenChange={onOpenChange}
        className="max-w-none h-fit"
      >
        <motion.div
          layout
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <ToolTrigger
            name={part ? toolNameFromPartType(part.type) : entry.fallbackName}
          />
        </motion.div>
        <ToolContent>
          <AnimatePresence mode="popLayout">
            {part?.input !== undefined && displayStatus !== "pending" ? (
              <motion.div
                key="tool-input"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ToolInput payload={part.input} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {displayStatus === "pending" ? (
            <motion.div
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TextShimmer invertLight>
                Streaming tool arguments from the model...
              </TextShimmer>
            </motion.div>
          ) : null}
          {displayStatus === "running" ? (
            <motion.div
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TextShimmer invertLight>Executing tool call...</TextShimmer>
            </motion.div>
          ) : null}

          <AnimatePresence mode="popLayout">
            {(displayStatus === "completed" || displayStatus === "error") && part ? (
              <motion.div
                key="tool-output"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <ToolOutput
                  payload={part.output}
                  errorText={part.errorText}
                  showWhen={["completed", "error"]}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </ToolContent>
      </Tool>
    </motion.div>
  );
}

export default function ToolDemo() {
  const nextRunIdRef = React.useRef(0);
  const [runs, setRuns] = React.useState<DemoRun[]>([]);
  const [openById, setOpenById] = React.useState<Record<string, boolean>>({});
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { model: "openai/gpt-4o-mini" },
    }),
  });

  const assistantToolParts = React.useMemo(
    () =>
      messages
        .filter((message) => message.role === "assistant")
        .flatMap((message) => toolPartsFromMessage(message)),
    [messages],
  );
  const toolEntries = React.useMemo<DemoEntry[]>(() => {
    const mappedFromRuns = runs.map((run, index) => ({
      id: run.id,
      fallbackName: fallbackToolNameFromPrompt(run.prompt),
      part: assistantToolParts[index],
    }));

    const overflowFromAssistant = assistantToolParts
      .slice(runs.length)
      .map((part, index) => ({
        id: `assistant-overflow-${index}-${part.type}`,
        fallbackName: toolNameFromPartType(part.type),
        part,
      }));

    return [...mappedFromRuns, ...overflowFromAssistant];
  }, [assistantToolParts, runs]);
  const latestEntryId = toolEntries[toolEntries.length - 1]?.id;

  const busy = status === "submitted" || status === "streaming";

  const submit = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      const runId = `run-${nextRunIdRef.current++}`;
      setOpenById((current) => {
        const next: Record<string, boolean> = {};
        for (const [id] of Object.entries(current)) {
          next[id] = false;
        }
        next[runId] = true;
        return next;
      });
      setRuns((current) => [...current, { id: runId, prompt: trimmed }]);
      await sendMessage({ text: trimmed });
    },
    [busy, sendMessage],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background px-4 py-10 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="mx-auto w-full max-w-7xl"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, delay: 0.04 }}
          className="rounded-2xl bg-card/40 p-4 sm:p-6"
        >
          <Suggestions onSelect={(value) => void submit(value)}>
            <SuggestionList className="justify-start">
              {promptPresets.map((preset) => (
                <motion.div
                  key={preset}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.001 }}
                  transition={{ duration: 0.16 }}
                >
                  <Suggestion
                    disabled={busy}
                    value={preset}
                    className="max-w-full justify-start text-left whitespace-normal"
                  >
                    {preset}
                  </Suggestion>
                </motion.div>
              ))}
            </SuggestionList>
          </Suggestions>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.24, delay: 0.08 }}
          className="mt-4 rounded-2xl bg- card/40 p-4 sm:p-6"
        >
          <AnimatePresence mode="popLayout">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error.message}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {toolEntries.length > 0 ? (
              <motion.div
                key="tool-grid"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-3"
              >
                {toolEntries.map((entry) => (
                  <ToolCard
                    key={entry.id}
                    entry={entry}
                    isOpen={openById[entry.id] ?? entry.id === latestEntryId}
                    onOpenChange={(open) => {
                      setOpenById((current) => ({
                        ...current,
                        [entry.id]: open,
                      }));
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground"
              >
                Click a suggestion to run a real tool call.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
