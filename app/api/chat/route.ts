import { streamText, UIMessage, convertToModelMessages } from "ai";
import { perplexity as perplexityModel } from "@ai-sdk/perplexity";

const PERPLEXITY_MODEL_IDS = [
  "sonar",
  "sonar-pro",
  "sonar-reasoning",
  "sonar-reasoning-pro",
  "sonar-deep-research",
] as const;

type PerplexityModelId = (typeof PERPLEXITY_MODEL_IDS)[number];

const DEFAULT_GATEWAY_MODEL = "anthropic/claude-sonnet-4.5";

function isPerplexityModelId(
  model: string | undefined,
): model is PerplexityModelId {
  return (
    model != null &&
    (PERPLEXITY_MODEL_IDS as readonly string[]).includes(model)
  );
}

function isAnthropicGatewayModelId(model: string | undefined) {
  return model == null || model.startsWith("anthropic/");
}

export async function POST(req: Request) {
  const {
    messages,
    model,
  }: { messages: UIMessage[]; model?: string } = await req.json();

  const usePerplexity = isPerplexityModelId(model);
  const languageModel = usePerplexity
    ? perplexityModel(model)
    : (model ?? DEFAULT_GATEWAY_MODEL);
  const useAnthropicReasoning = !usePerplexity && isAnthropicGatewayModelId(model);

  const result = streamText({
    model: languageModel,
    messages: await convertToModelMessages(messages),
    providerOptions: useAnthropicReasoning
      ? {
          anthropic: {
            thinking: { type: "enabled", budgetTokens: 1024 },
          },
        }
      : undefined,
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    sendSources: usePerplexity,
  });
}
