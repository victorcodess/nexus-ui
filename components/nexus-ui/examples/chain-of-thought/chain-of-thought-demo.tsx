"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useOnChange } from "@/lib/use-on-change";
import { cn } from "@/lib/utils";
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
import {
  ChainOfThought,
  ChainOfThoughtComplete,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtStepContent,
  type ChainOfThoughtStepStatus,
  ChainOfThoughtStepTitle,
  ChainOfThoughtTrigger,
} from "@/components/nexus-ui/chain-of-thought";
import {
  getInlineCitationMarkdown,
  type InlineCitationSource,
} from "@/components/nexus-ui/examples/message/inline-citations";
import PerplexityIcon from "@/components/svgs/perplexity";
import ChatgptIcon from "@/components/svgs/chatgpt";
import { ClaudeIcon2 } from "@/components/svgs/claude";
import GeminiIcon from "@/components/svgs/gemini";
import {
  Alert02Icon,
  Analytics01Icon,
  AiBrain01Icon,
  AiWebBrowsingIcon,
  ArrowUp02Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  Edit04Icon,
  Globe02Icon,
  SunCloud02Icon,
  AppleStocksIcon,
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
 * `value` is either a Vercel AI Gateway id or a Perplexity Sonar id — see `/api/demo/chat`.
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

type ToolStepViewModel = {
  id: string;
  toolType: string;
  label: string;
  activeLabel?: string;
  completedLabel?: string;
  status: ChainOfThoughtStepStatus;
  icon?: React.ReactNode;
  hasContent: boolean;
  content?: React.ReactNode;
  toolOutput?: unknown;
};

type WeatherToolOutput = {
  location: string;
  weather: string;
  temperatureC: number;
  humidity: string;
  windKph: number;
};

type StockToolOutput = {
  symbol: string;
  price: number;
  change: number;
  currency: string;
  asOf: string;
};

type CurrencyToolOutput = {
  amount: number;
  from: string;
  to: string;
  rate: number;
  convertedAmount: number;
  asOf: string;
};

type WebSearchToolOutput = {
  query?: string;
  action?: {
    type?: string;
    query?: string;
  };
  results?: Array<{
    title?: string;
    url?: string;
    snippet?: string;
  }>;
  sources?: Array<{
    title?: string;
    url?: string;
    snippet?: string;
    sourceType?: string;
  }>;
};

type WebSearchSourceItem = {
  title: string;
  url: string;
  snippet: string;
};

function isWebSearchToolType(toolType: string) {
  return toolType === "tool-webSearch" || toolType === "tool-web_search";
}

function formatToolName(toolType: string) {
  const rawName = toolType.replace(/^tool-/, "");
  const words = rawName
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function toolTargetText(toolType: string, value: unknown) {
  if (typeof value !== "object" || value === null) return null;

  if (toolType === "tool-displayWeather") {
    const location = (value as { location?: unknown }).location;
    return typeof location === "string" ? location : null;
  }

  if (toolType === "tool-getStockPrice") {
    const symbol = (value as { symbol?: unknown }).symbol;
    return typeof symbol === "string" ? symbol.toUpperCase() : null;
  }

  if (toolType === "tool-convertCurrency") {
    const from = (value as { from?: unknown }).from;
    const to = (value as { to?: unknown }).to;
    if (typeof from === "string" && typeof to === "string") {
      return `${from.toUpperCase()} -> ${to.toUpperCase()}`;
    }
    return null;
  }

  if (isWebSearchToolType(toolType)) {
    const query = (value as { query?: unknown }).query;
    return typeof query === "string" ? query : null;
  }

  return null;
}

function toolStepContent(value: unknown) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border/50 bg-secondary p-2 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function isWeatherToolOutput(value: unknown): value is WeatherToolOutput {
  if (typeof value !== "object" || value === null) return false;
  const maybe = value as Partial<WeatherToolOutput>;
  return (
    typeof maybe.location === "string" &&
    typeof maybe.weather === "string" &&
    typeof maybe.temperatureC === "number" &&
    typeof maybe.humidity === "string" &&
    typeof maybe.windKph === "number"
  );
}

function isStockToolOutput(value: unknown): value is StockToolOutput {
  if (typeof value !== "object" || value === null) return false;
  const maybe = value as Partial<StockToolOutput>;
  return (
    typeof maybe.symbol === "string" &&
    typeof maybe.price === "number" &&
    typeof maybe.change === "number" &&
    typeof maybe.currency === "string" &&
    typeof maybe.asOf === "string"
  );
}

function isCurrencyToolOutput(value: unknown): value is CurrencyToolOutput {
  if (typeof value !== "object" || value === null) return false;
  const maybe = value as Partial<CurrencyToolOutput>;
  return (
    typeof maybe.amount === "number" &&
    typeof maybe.from === "string" &&
    typeof maybe.to === "string" &&
    typeof maybe.rate === "number" &&
    typeof maybe.convertedAmount === "number" &&
    typeof maybe.asOf === "string"
  );
}

function isWebSearchToolOutput(value: unknown): value is WebSearchToolOutput {
  if (typeof value !== "object" || value === null) return false;
  const maybe = value as Partial<WebSearchToolOutput>;
  const hasQuery =
    typeof maybe.query === "string" || typeof maybe.action?.query === "string";
  const hasResultList =
    Array.isArray(maybe.results) || Array.isArray(maybe.sources);

  return hasQuery || hasResultList || maybe.action?.type === "search";
}

function withFallbackWebSearchSources(
  output: unknown,
  fallbackSources: WebSearchSourceItem[],
) {
  if (!isWebSearchToolOutput(output)) {
    return output;
  }

  const existingSources = [...(output.sources ?? []), ...(output.results ?? [])]
    .filter((item): item is { url: string } => typeof item?.url === "string")
    .slice(0, 10);

  if (existingSources.length > 0 || fallbackSources.length === 0) {
    return output;
  }

  return {
    ...output,
    query: output.query ?? output.action?.query ?? "Web search",
    results: fallbackSources,
  } satisfies WebSearchToolOutput;
}

function WeatherToolResult({ output }: { output: WeatherToolOutput }) {
  return (
    <div className="rounded-[12px] border border-border/50 bg-secondary p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-primary">{output.location}</span>
        <span className="text-muted-foreground">{output.weather}</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="rounded-md bg-background/60 px-2 py-1.5">
          <div className="text-[11px] text-muted-foreground">Temp</div>
          <div className="mt-0.5 font-medium text-primary">
            {output.temperatureC}C
          </div>
        </div>
        <div className="rounded-md bg-background/60 px-2 py-1.5">
          <div className="text-[11px] text-muted-foreground">Humidity</div>
          <div className="mt-0.5 font-medium text-primary">
            {output.humidity}
          </div>
        </div>
        <div className="rounded-md bg-background/60 px-2 py-1.5">
          <div className="text-[11px] text-muted-foreground">Wind</div>
          <div className="mt-0.5 font-medium text-primary">
            {output.windKph} kph
          </div>
        </div>
      </div>
    </div>
  );
}

function StockToolResult({ output }: { output: StockToolOutput }) {
  const formattedTime = new Date(output.asOf).toLocaleString();
  const isUp = output.change >= 0;
  return (
    <div className="rounded-[12px] border border-border/50 bg-secondary p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-primary">{output.symbol}</span>
        <span className="text-muted-foreground">{output.currency}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-base font-semibold text-primary">
          {output.price.toFixed(2)}
        </span>
        <span className={isUp ? "text-emerald-600" : "text-destructive"}>
          {isUp ? "+" : ""}
          {output.change.toFixed(2)}
        </span>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        As of {formattedTime}
      </div>
    </div>
  );
}

function CurrencyToolResult({ output }: { output: CurrencyToolOutput }) {
  const formattedTime = new Date(output.asOf).toLocaleString();
  return (
    <div className="rounded-[12px] border border-border/50 bg-secondary p-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-primary">
          {output.from}
          {" -> "}
          {output.to}
        </span>
        <span className="text-muted-foreground">FX</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-background/60 px-2 py-1.5">
          <div className="text-[11px] text-muted-foreground">Input</div>
          <div className="mt-0.5 font-medium text-primary">
            {output.amount.toFixed(2)} {output.from}
          </div>
        </div>
        <div className="rounded-md bg-background/60 px-2 py-1.5">
          <div className="text-[11px] text-muted-foreground">Converted</div>
          <div className="mt-0.5 font-medium text-primary">
            {output.convertedAmount.toFixed(2)} {output.to}
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Rate: {output.rate.toFixed(4)} | As of {formattedTime}
      </div>
    </div>
  );
}

function WebSearchToolResult({ output }: { output: WebSearchToolOutput }) {
  const resolvedQuery = output.query ?? output.action?.query ?? "Web search";
  const rawSources = (output.sources ?? output.results ?? []).filter(
    (item) => typeof item?.url === "string",
  );
  const sources = rawSources.slice(0, 10).map((result) => {
    let domain = result.url;
    try {
      domain = new URL(result.url ?? "").hostname.replace(/^www\./, "");
    } catch {
      // keep raw URL if parsing fails
    }

    return {
      title: result.title?.trim() || result.url || "Source",
      url: result.url ?? "",
      snippet: result.snippet?.trim() || "",
      domain,
    };
  });

  return (
    <div className="mt-1 space-y-2">
      <div className="-mx-1 mt-1 no-scrollbar flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:overflow-x-visible sm:px-0 sm:pb-0">
        <span className="inline-flex h-6.5 shrink-0 items-center gap-1 rounded-full bg-muted px-2 text-xs leading-4.5 whitespace-nowrap text-muted-foreground sm:max-w-[187.8px] sm:whitespace-normal">
          <HugeiconsIcon
            icon={Globe02Icon}
            strokeWidth={1.75}
            className="size-4 shrink-0 text-muted-foreground/50"
          />
          <span className="min-w-0 sm:truncate">{resolvedQuery}</span>
        </span>
      </div>

      <div className="mt-1.5 no-scrollbar flex max-h-[180px] w-full max-w-full min-w-0 flex-col gap-2 overflow-x-hidden overflow-y-auto rounded-[12px] border border-border/50 bg-secondary p-3">
        {sources.length > 0 ? (
          sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid w-full max-w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_minmax(0,7.5rem)] items-center gap-2 rounded-md px-1.5 py-1 text-xs leading-4.5 transition-colors hover:bg-border/50 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,9rem)] dark:hover:bg-border/40"
              title={source.snippet}
            >
              <img
                alt=""
                loading="lazy"
                width={16}
                height={16}
                className="size-4 shrink-0 rounded"
                src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=128`}
              />
              <div className="min-w-0 truncate text-primary">
                {source.title}
              </div>
              <div
                className="min-w-0 truncate text-right text-muted-foreground tabular-nums"
                title={source.domain}
              >
                {source.domain}
              </div>
            </a>
          ))
        ) : (
          <div className="rounded-md border border-border/40 bg-background/60 px-2 py-1.5 text-[11px] text-muted-foreground">
            Search started. Source links will appear when available.
          </div>
        )}
      </div>
    </div>
  );
}

function renderToolOutput(toolType: string, output: unknown) {
  const wrapWithFade = (node: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {node}
    </motion.div>
  );

  if (toolType === "tool-displayWeather" && isWeatherToolOutput(output)) {
    return wrapWithFade(<WeatherToolResult output={output} />);
  }

  if (toolType === "tool-getStockPrice" && isStockToolOutput(output)) {
    return wrapWithFade(<StockToolResult output={output} />);
  }

  if (toolType === "tool-convertCurrency" && isCurrencyToolOutput(output)) {
    return wrapWithFade(<CurrencyToolResult output={output} />);
  }

  if (isWebSearchToolType(toolType) && isWebSearchToolOutput(output)) {
    return wrapWithFade(<WebSearchToolResult output={output} />);
  }

  return wrapWithFade(toolStepContent(output));
}

function applyWebSourceUrlsToSteps(
  steps: ToolStepViewModel[],
  sourceUrlItems: WebSearchSourceItem[],
) {
  if (sourceUrlItems.length === 0) return steps;

  return steps.map((step) => {
    if (!isWebSearchToolType(step.toolType) || step.status !== "completed") {
      return step;
    }

    const outputWithSources = withFallbackWebSearchSources(
      step.toolOutput,
      sourceUrlItems,
    );

    if (outputWithSources === step.toolOutput) {
      return step;
    }

    return {
      ...step,
      toolOutput: outputWithSources,
      hasContent: true,
      content: renderToolOutput(step.toolType, outputWithSources),
    };
  });
}

function toolStepIcon(toolType: string, status: ChainOfThoughtStepStatus) {
  if (status === "error") {
    return (
      <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.75} className="size-4" />
    );
  }

  if (toolType === "tool-displayWeather") {
    return (
      <HugeiconsIcon
        icon={SunCloud02Icon}
        strokeWidth={1.75}
        className="size-4"
      />
    );
  }

  if (toolType === "tool-getStockPrice") {
    return (
      <HugeiconsIcon
        icon={AppleStocksIcon}
        strokeWidth={1.75}
        className="size-4"
      />
    );
  }

  if (toolType === "tool-convertCurrency") {
    return (
      <HugeiconsIcon icon={Globe02Icon} strokeWidth={1.75} className="size-4" />
    );
  }

  if (isWebSearchToolType(toolType)) {
    return (
      <HugeiconsIcon
        icon={AiWebBrowsingIcon}
        strokeWidth={1.75}
        className="size-4"
      />
    );
  }

  return (
    <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={1.75} className="size-4" />
  );
}

function stepLabelForState(
  toolType: string,
  status: ChainOfThoughtStepStatus,
  input?: unknown,
  output?: unknown,
) {
  const target =
    toolTargetText(toolType, input) ?? toolTargetText(toolType, output);

  if (toolType === "tool-displayWeather") {
    if (status === "active") {
      return target
        ? `Checking weather in ${target}`
        : "Checking weather conditions";
    }

    if (status === "completed") {
      return target
        ? `Checked weather in ${target}`
        : "Checked weather conditions";
    }

    if (status === "error") {
      return target
        ? `Failed checking weather in ${target}`
        : "Failed checking weather";
    }
  }

  if (toolType === "tool-getStockPrice") {
    if (status === "active") {
      return target
        ? `Fetching stock quote for ${target}`
        : "Fetching stock quote";
    }

    if (status === "completed") {
      return target
        ? `Fetched stock quote for ${target}`
        : "Fetched stock quote";
    }

    if (status === "error") {
      return target
        ? `Failed fetching stock quote for ${target}`
        : "Failed fetching stock quote";
    }
  }

  if (toolType === "tool-convertCurrency") {
    if (status === "active") {
      return target
        ? `Converting currency for ${target}`
        : "Converting currency";
    }

    if (status === "completed") {
      return target ? `Converted currency for ${target}` : "Converted currency";
    }

    if (status === "error") {
      return target
        ? `Failed converting currency for ${target}`
        : "Failed converting currency";
    }
  }

  if (isWebSearchToolType(toolType)) {
    if (status === "active") {
      return target ? `Searching the web for ${target}` : "Searching the web";
    }

    if (status === "completed") {
      return target ? `Searched the web for ${target}` : "Searched the web";
    }

    if (status === "error") {
      return target
        ? `Failed searching the web for ${target}`
        : "Failed searching the web";
    }
  }

  const readable = formatToolName(toolType).toLowerCase();
  if (status === "active") {
    return `Running ${readable}`;
  }
  if (status === "completed") {
    return `Finished ${readable}`;
  }
  return `Failed running ${readable}`;
}

function triggerLabelForSteps(
  steps: ToolStepViewModel[],
  _assistantIsPending: boolean,
  allStepsComplete: boolean,
) {
  if (!allStepsComplete) {
    return "Reasoning through the task...";
  }

  const stepCount = steps.length;
  return `Completed the task with ${stepCount} ${
    stepCount === 1 ? "step" : "steps"
  }`;
}

function toolStepsFromAssistantMessage(
  message: UIMessage,
): ToolStepViewModel[] {
  const fallbackWebSources = sourceUrlPartsFromMessage(message)
    .slice(0, 10)
    .map((source) => ({
      title: source.title?.trim() || source.url,
      url: source.url,
      snippet: "",
    })) satisfies WebSearchSourceItem[];

  return message.parts.flatMap<ToolStepViewModel>((part, index) => {
    if (!part.type.startsWith("tool-")) {
      return [];
    }

    const toolPart = part as {
      type: string;
      state?: string;
      input?: unknown;
      output?: unknown;
      errorText?: string;
    };

    switch (toolPart.state) {
      case "input-available":
        const activeLabel = stepLabelForState(
          toolPart.type,
          "active",
          toolPart.input,
          toolPart.output,
        );
        return [
          {
            id: `${toolPart.type}-${index}`,
            toolType: toolPart.type,
            label: activeLabel,
            activeLabel,
            status: "active",
            icon: toolStepIcon(toolPart.type, "active"),
            hasContent: false,
            content: undefined,
          },
        ];
      case "output-available":
        const completedLabel = stepLabelForState(
          toolPart.type,
          "completed",
          toolPart.input,
          toolPart.output,
        );
        const outputForRender = isWebSearchToolType(toolPart.type)
          ? withFallbackWebSearchSources(toolPart.output, fallbackWebSources)
          : toolPart.output;
        return [
          {
            id: `${toolPart.type}-${index}`,
            toolType: toolPart.type,
            label: completedLabel,
            activeLabel: stepLabelForState(
              toolPart.type,
              "active",
              toolPart.input,
              toolPart.output,
            ),
            completedLabel,
            status: "completed",
            icon: toolStepIcon(toolPart.type, "completed"),
            hasContent: toolPart.output !== undefined,
            toolOutput: outputForRender,
            content:
              toolPart.output !== undefined
                ? renderToolOutput(toolPart.type, outputForRender)
                : undefined,
          },
        ];
      case "output-error":
        return [
          {
            id: `${toolPart.type}-${index}`,
            toolType: toolPart.type,
            label: stepLabelForState(
              toolPart.type,
              "error",
              toolPart.input,
              toolPart.output,
            ),
            status: "error",
            icon: toolStepIcon(toolPart.type, "error"),
            hasContent: true,
            content: (
              <div className="text-xs text-destructive">
                {toolPart.errorText ?? "Tool execution failed."}
              </div>
            ),
          },
        ];
      default:
        return [];
    }
  });
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

const STEP_AUTO_CLOSE_DELAY_MS = 900;

function ToolTraceStep({ step }: { step: ToolStepViewModel }) {
  const [isAutoClosed, setIsAutoClosed] = React.useState(false);

  React.useEffect(() => {
    if (!step.hasContent || step.status !== "completed") return;

    const timer = window.setTimeout(() => {
      setIsAutoClosed(true);
    }, STEP_AUTO_CLOSE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [step.hasContent, step.status]);

  const isOpen = step.hasContent
    ? step.status === "completed"
      ? !isAutoClosed
      : true
    : undefined;

  return (
    <ChainOfThoughtStep
      status={step.status}
      hasContent={step.hasContent}
      open={isOpen}
      onOpenChange={
        step.hasContent && step.status === "completed"
          ? (open) => {
              setIsAutoClosed(!open);
            }
          : undefined
      }
      autoCloseOnComplete={false}
    >
      <ChainOfThoughtStepTitle icon={step.icon} collapsible={step.hasContent}>
        {step.label}
      </ChainOfThoughtStepTitle>
      {step.hasContent ? (
        <ChainOfThoughtStepContent>{step.content}</ChainOfThoughtStepContent>
      ) : null}
    </ChainOfThoughtStep>
  );
}

function Messages({
  displayRows,
  status,
  copyMessage,
  busy,
  regenerate,
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

  const toolStepCarryover = React.useMemo(() => {
    const hiddenRowIndexes = new Set<number>();
    const carriedToolStepsByIndex = new Map<number, ToolStepViewModel[]>();
    let pendingToolSteps: ToolStepViewModel[] = [];

    for (let index = 0; index < displayRows.length; index += 1) {
      const current = displayRows[index];
      const next = displayRows[index + 1];

      if (current?.role !== "assistant") {
        pendingToolSteps = [];
        continue;
      }

      const currentText = textFromMessage(current).trim();
      const currentToolSteps = toolStepsFromAssistantMessage(current);
      const mergedToolSteps = [...pendingToolSteps, ...currentToolSteps];
      const currentIsToolOnly =
        currentText.length === 0 && mergedToolSteps.length > 0;
      const hasNextAssistant = next?.role === "assistant";

      if (currentIsToolOnly && hasNextAssistant) {
        hiddenRowIndexes.add(index);
        pendingToolSteps = mergedToolSteps;
        continue;
      }

      carriedToolStepsByIndex.set(index, mergedToolSteps);
      pendingToolSteps = [];
    }

    return { hiddenRowIndexes, carriedToolStepsByIndex };
  }, [displayRows]);

  return (
    <>
      {displayRows.map((m, i) => {
        if (toolStepCarryover.hiddenRowIndexes.has(i)) {
          return null;
        }

        const from = m.role === "user" ? "user" : "assistant";
        const text = textFromMessage(m);
        const sourceUrls = sourceUrlPartsFromMessage(m);
        const sourceUrlItems = sourceUrls.slice(0, 10).map((source) => ({
          title: source.title?.trim() || source.url,
          url: source.url,
          snippet: "",
        })) satisfies WebSearchSourceItem[];
        const rawToolSteps =
          toolStepCarryover.carriedToolStepsByIndex.get(i) ??
          toolStepsFromAssistantMessage(m);
        const toolSteps = applyWebSourceUrlsToSteps(
          rawToolSteps,
          sourceUrlItems,
        );
        const hasToolSteps = toolSteps.length > 0;
        const isLast = i === displayRows.length - 1;
        const inlineCitationSources = sourceUrls.map((source) => ({
          url: source.url,
          title: source.title?.trim() || source.url,
        })) satisfies InlineCitationSource[];
        const { markdownText, components } = getInlineCitationMarkdown(
          text,
          inlineCitationSources,
        );
        const hasEarlierVisibleAssistant = displayRows
          .slice(0, i)
          .some(
            (row, visibleSliceIndex) =>
              row.role === "assistant" &&
              !toolStepCarryover.hiddenRowIndexes.has(visibleSliceIndex),
          );
        const useAssistantMinHeight =
          from === "assistant" && isLast && hasEarlierVisibleAssistant;
        const assistantMinHeightStyle = useAssistantMinHeight
          ? ({
              "--reasoning-prev-user-height": `${previousUserMessageHeight}px`,
            } as React.CSSProperties)
          : undefined;

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
            !hasToolSteps &&
            isLast &&
            (status === "streaming" || status === "submitted");
          const assistantIsPending =
            isPendingAssistantMessage(m) || assistantIsLoading;

          const showAssistantResponse = !assistantIsPending && text.length > 0;
          const showChain = assistantIsPending || hasToolSteps;
          const hasToolError = toolSteps.some(
            (step) => step.status === "error",
          );
          const hasActiveTool = toolSteps.some(
            (step) => step.status === "active",
          );
          const showCompleteRow =
            hasToolSteps &&
            !hasActiveTool &&
            // Final answer has started (streaming or complete), so all tool work is done.
            (showAssistantResponse ||
              // Fallback for finished generations where text may be empty.
              (!assistantIsPending && status !== "streaming"));
          const triggerLabel = triggerLabelForSteps(
            toolSteps,
            assistantIsPending,
            showCompleteRow,
          );

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
                {showChain ? (
                  <ChainOfThought
                    autoCloseOnAllComplete={false}
                    defaultOpen={
                      assistantIsPending || hasActiveTool || hasToolError
                    }
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
                      <ChainOfThoughtStep
                        status={showCompleteRow ? "completed" : "active"}
                        hasContent={false}
                        className="hidden"
                      >
                        <ChainOfThoughtStepTitle className="sr-only">
                          Processing tool workflow
                        </ChainOfThoughtStepTitle>
                      </ChainOfThoughtStep>
                      {toolSteps.map((step) => (
                        <ToolTraceStep
                          key={step.id}
                          step={{
                            ...step,
                            label:
                              !showCompleteRow &&
                              step.status === "completed" &&
                              step.activeLabel
                                ? step.activeLabel
                                : (showCompleteRow &&
                                    step.status === "completed" &&
                                    step.completedLabel) ||
                                  step.label,
                          }}
                        />
                      ))}
                      {showCompleteRow ? (
                        <ChainOfThoughtComplete
                          label={
                            hasToolError
                              ? "Finished with partial errors"
                              : "Task complete"
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
                ) : null}

                {showAssistantResponse ? (
                  <MessageContent>
                    <MessageMarkdown
                      isAnimating={isAssistantTextStreaming(m)}
                      components={components}
                    >
                      {markdownText}
                    </MessageMarkdown>
                  </MessageContent>
                ) : null}

                {showAssistantResponse && !isAssistantTextStreaming(m) ? (
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
                    "min-h-[calc(var(--reasoning-thread-height)-var(--reasoning-prev-user-height)-var(--reasoning-thread-content-gap)-var(--reasoning-thread-content-bottom-padding)-var(--reasoning-min-height-misc))]",
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

export default function ChainOfThoughtDemo() {
  const copyMessage = React.useCallback((text: string) => {
    void navigator.clipboard?.writeText(text);
  }, []);

  const [model, setModel] = React.useState<string>(models[3].value);

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/demo/chat",
        body: () => ({ model }),
      }),
    [model],
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
      <Thread
        className="h-(--reasoning-thread-height)"
        style={
          {
            "--reasoning-thread-height": "75vh",
            "--reasoning-thread-content-gap": "24px",
            "--reasoning-thread-content-bottom-padding": "160px",
            "--reasoning-min-height-misc": "2px",
          } as React.CSSProperties
        }
      >
        <ThreadContent className="mx-auto max-w-2xl gap-(--reasoning-thread-content-gap) pb-(--reasoning-thread-content-bottom-padding)">
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
              placeholder="Try: weather in London or stock price of AAPL"
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
