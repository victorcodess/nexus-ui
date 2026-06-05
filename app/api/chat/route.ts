import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import { z } from "zod";
import {
  checkAskAiRateLimit,
  rateLimitResponse,
  rateLimitUnavailableResponse,
} from "@/lib/ask-ai/rate-limit";
import type { ChatUIMessage, SearchTool } from "@/lib/ai/types";
import {
  buildRetrievalQueryFromMessages,
  formatRetrievedContext,
  KNOWLEDGE_CONTEXT,
  retrieveKnowledge,
  toSearchToolOutput,
} from "@/lib/knowledge";
import { SITE_URL } from "@/lib/site";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = [
  "You are Nexus AI, the official AI assistant for Nexus UI documentation.",
  `Public docs base URL: ${SITE_URL}/docs`,
  "You receive <retrieved_context> on every turn (built from the full user thread, not only the latest message). Treat it as the primary evidence for your answer.",
  "You may call `search` again to refine retrieval, but never contradict or ignore <retrieved_context> when it already answers the question.",
  "After any search, write a complete final answer in markdown. Never end with only tool calls.",
  "When the last search returns, immediately stream the final answer.",
  "Ground every factual claim in retrieved chunks. If evidence exists, never say the docs lack an answer.",
  "Link only to public docs URLs from citeable chunks (under /docs). Never link GitHub source or skill file paths to users.",
  "Install: `npx shadcn@latest add @nexus-ui/<registry-name>`. Import: `@/components/nexus-ui/<file>`. Never `@nexus-ui/<name>` as a runtime import.",
  "Point users to the relevant docs page and section (Installation, Usage, API) when applicable.",
  "If evidence is insufficient, say what is missing and which docs pages are closest.",
  "Use the full conversation for follow-ups. If <retrieved_context> is empty or unrelated, call `search` with a query that includes the topic from earlier turns.",
].join("\n");

export async function POST(req: Request, ctx: RouteContext<"/api/chat">) {
  const rateLimit = await checkAskAiRateLimit(req);
  if (rateLimit === "unavailable") {
    return rateLimitUnavailableResponse();
  }
  if (rateLimit && !rateLimit.ok) {
    return rateLimitResponse(rateLimit);
  }

  const reqJson = await req.json();
  const messages: ChatUIMessage[] = reqJson.messages ?? [];
  const retrievalQuery = buildRetrievalQueryFromMessages(
    messages,
    KNOWLEDGE_CONTEXT.retrievalQueryMaxChars,
  );
  const modelId = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o";

  const stream = createUIMessageStream<ChatUIMessage>({
    originalMessages: messages,
    async execute({ writer }) {
      const preRetrieved = await retrieveKnowledge(retrievalQuery, {
        limit: KNOWLEDGE_CONTEXT.preRetrieveLimit,
        includeImplementation: true,
      });
      const contextBlock = formatRetrievedContext(preRetrieved);

      const result = streamText({
        model: openrouter.chat(modelId),
        stopWhen: stepCountIs(8),
        tools: {
          search: createSearchTool(),
        },
        messages: [
          {
            role: "system",
            content: `${systemPrompt}\n\n<retrieved_context>\n${contextBlock}\n</retrieved_context>`,
          },
          ...(await convertToModelMessages<ChatUIMessage>(messages, {
            convertDataPart(part) {
              if (part.type === "data-client")
                return {
                  type: "text",
                  text: `[Client Context: ${JSON.stringify(part.data)}]`,
                };
            },
          })),
        ],
        toolChoice: "auto",
        experimental_transform: smoothStream({
          chunking: "word",
          delayInMs: 0,
        }),
        providerOptions: {
          openai: {
            parallelToolCalls: false,
          },
        },
      });

      writer.merge(
        result.toUIMessageStream({
          originalMessages: messages,
        }),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function createSearchTool() {
  return tool({
    description:
      "Search Nexus UI docs, skill reference, and implementation source. Use to refine when <retrieved_context> is insufficient. Keep the user's topic in the query.",
    inputSchema: z.object({
      query: z.string(),
      limit: z.number().int().min(1).max(30).default(8),
    }),
    async execute({ query, limit }) {
      const result = await retrieveKnowledge(query, {
        limit: Math.max(limit, KNOWLEDGE_CONTEXT.searchToolLimit),
        includeImplementation: true,
      });
      return toSearchToolOutput(result, limit);
    },
  }) satisfies SearchTool;
}
