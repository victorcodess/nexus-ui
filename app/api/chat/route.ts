import {
  tool,
  generateText,
  streamText,
  stepCountIs,
  smoothStream,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { perplexity as perplexityModel } from "@ai-sdk/perplexity";
import { z } from "zod";

const PERPLEXITY_MODEL_IDS = [
  "sonar",
  "sonar-pro",
  "sonar-reasoning",
  "sonar-reasoning-pro",
  "sonar-deep-research",
] as const;

type PerplexityModelId = (typeof PERPLEXITY_MODEL_IDS)[number];

const DEFAULT_GATEWAY_MODEL = "anthropic/claude-sonnet-4.5";
const BASE_TOOL_SYSTEM_PROMPT = [
  "You are a helpful assistant.",
  "When users ask for weather, use displayWeather tool.",
  "When users ask for stock prices, use getStockPrice tool.",
  "When users ask for currency conversion, use convertCurrency tool.",
  "When users ask to look up information, use webSearch tool.",
  "When multiple tools are needed, call exactly one tool at a time.",
  "Wait for each tool result before deciding and calling the next tool.",
  "Do not call tools in parallel in the same step.",
  "After all required tool calls are complete, stream the final answer.",
  "After using tools, summarize the results clearly.",
];

function isPerplexityModelId(
  model: string | undefined,
): model is PerplexityModelId {
  return (
    model != null && (PERPLEXITY_MODEL_IDS as readonly string[]).includes(model)
  );
}

function isAnthropicGatewayModelId(model: string | undefined) {
  return model == null || model.startsWith("anthropic/");
}

function isOpenAIGatewayModelId(model: string | undefined) {
  return model?.startsWith("openai/") ?? false;
}

const demoTools = {
  displayWeather: tool({
    description: "Display weather details for a location",
    inputSchema: z.object({
      location: z.string().describe("Location to check weather for"),
    }),
    execute: async ({ location }) => {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const temperatureC = Math.floor(Math.random() * 15) + 12;
      const conditions = ["Sunny", "Cloudy", "Partly cloudy", "Light rain"];
      const weather = conditions[Math.floor(Math.random() * conditions.length)];

      return {
        location,
        weather,
        temperatureC,
        humidity: `${Math.floor(Math.random() * 30) + 45}%`,
        windKph: Math.floor(Math.random() * 20) + 5,
      };
    },
  }),
  getStockPrice: tool({
    description: "Get a mock stock quote for a ticker symbol",
    inputSchema: z.object({
      symbol: z.string().describe("Ticker symbol like AAPL or MSFT"),
    }),
    execute: async ({ symbol }) => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const normalized = symbol.trim().toUpperCase();
      const base = Math.floor(Math.random() * 250) + 40;
      const cents = Math.floor(Math.random() * 100) / 100;
      const change = Number((Math.random() * 6 - 3).toFixed(2));
      const price = Number((base + cents).toFixed(2));

      return {
        symbol: normalized,
        price,
        change,
        currency: "USD",
        asOf: new Date().toISOString(),
      };
    },
  }),
  convertCurrency: tool({
    description:
      "Convert an amount from one currency to another using a mock exchange rate",
    inputSchema: z.object({
      amount: z.number().positive().describe("Amount to convert"),
      from: z.string().length(3).describe("Source currency code, e.g. USD"),
      to: z.string().length(3).describe("Target currency code, e.g. EUR"),
    }),
    execute: async ({ amount, from, to }) => {
      await new Promise((resolve) => setTimeout(resolve, 650));

      const source = from.trim().toUpperCase();
      const target = to.trim().toUpperCase();
      const rate = Number((0.6 + Math.random() * 1.4).toFixed(4));
      const convertedAmount = Number((amount * rate).toFixed(2));

      return {
        amount,
        from: source,
        to: target,
        rate,
        convertedAmount,
        asOf: new Date().toISOString(),
      };
    },
  }),
  webSearch: tool({
    description: "Search the web for current information",
    inputSchema: z.object({
      query: z.string().min(2).describe("Search query"),
    }),
    execute: async ({ query }) => {
      const normalizedQuery = query.trim();
      const search = await generateText({
        model: perplexityModel("sonar-pro"),
        prompt: normalizedQuery,
      });

      const results = (search.sources ?? [])
        .filter(
          (
            source,
          ): source is Extract<
            NonNullable<typeof search.sources>[number],
            { sourceType: "url" }
          > => source?.sourceType === "url" && typeof source.url === "string",
        )
        .slice(0, 10)
        .map((source) => ({
          title: source.title?.trim() || source.url,
          url: source.url,
          snippet: "",
        }));

      return {
        query: normalizedQuery,
        results,
      };
    },
  }),
} as const;

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model?: string } =
    await req.json();

  const usePerplexity = isPerplexityModelId(model);
  const useOpenAIProvider = isOpenAIGatewayModelId(model);
  const openAIModelId = useOpenAIProvider
    ? (model?.replace(/^openai\//, "") ?? "gpt-4o")
    : null;
  const languageModel = usePerplexity
    ? perplexityModel(model)
    : useOpenAIProvider
      ? openai(openAIModelId ?? "gpt-4o")
      : (model ?? DEFAULT_GATEWAY_MODEL);
  const useAnthropicReasoning =
    !usePerplexity && isAnthropicGatewayModelId(model);
  const tools = usePerplexity ? undefined : demoTools;
  const system = BASE_TOOL_SYSTEM_PROMPT.join(" ");
  const providerOptions = usePerplexity
    ? undefined
    : {
        openai: {
          parallelToolCalls: false,
        },
        ...(useAnthropicReasoning
          ? {
              anthropic: {
                thinking: { type: "enabled", budgetTokens: 1024 },
              },
            }
          : {}),
      };

  const result = streamText({
    model: languageModel,
    system: usePerplexity ? undefined : system,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: tools ? stepCountIs(5) : undefined,
    experimental_transform: smoothStream({
      chunking: "word",
      delayInMs: 18,
    }),
    providerOptions,
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: usePerplexity || useOpenAIProvider,
  });
}
