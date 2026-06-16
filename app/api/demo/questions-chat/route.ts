import {
  convertToModelMessages,
  smoothStream,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

const DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";

const questionSchema = z.object({
  id: z.string(),
  type: z.enum(["single", "multiple"]),
  prompt: z.string(),
  required: z
    .boolean()
    .optional()
    .describe(
      "Optional. Default skippable—only set true when the user must answer before continuing.",
    ),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .min(2)
    .max(4),
});

const SYSTEM_PROMPT = [
  "You are a helpful assistant.",
  "Keep every response under 1600 characters.",
  "When the user's request is ambiguous or missing details you need for a good answer:",
  "1) Write one brief sentence telling the user you need to ask a/some clarifying question(s) before you can help.",
  "2) Call askClarifyingQuestions with only the questions you actually need—often just one.",
  "Ask the minimum number of questions and options required. Use 1 question when one missing detail blocks a good answer; add more only when multiple distinct unknowns remain.",
  "Provide 2–4 options per question—use fewer when fewer meaningful choices exist. Never pad to 3 questions or 4 options.",
  "Questions are skippable by default—omit required or set required: false unless one answer is strictly necessary.",
  "Do not answer the user's original question in that same turn.",
  "When the user replies with Q: / A: formatted answers, use those answers to provide a clear, helpful response.",
  "Use single-choice (type: single) by default for one question.",
  "When you ask 2 or more questions, at least one must be multiple-choice (type: multiple) where the user may select several options.",
  "Use multiple-choice when several options may apply to the same question.",
  "Do not call askClarifyingQuestions when the user already gave enough context.",
].join(" ");

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model?: string } =
    await req.json();

  const result = streamText({
    model: model ?? DEFAULT_MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 600,
    tools: {
      askClarifyingQuestions: tool({
        description:
          "Ask clarifying questions before continuing. Write a brief intro sentence first. Ask only what you need—up to 3 questions, up to 4 options each. If asking 2+ questions, include at least one multiple-choice question (type: multiple).",
        inputSchema: z.object({
          questions: z.array(questionSchema).min(1).max(3),
        }),
      }),
    },
    experimental_transform: smoothStream({
      chunking: "word",
      delayInMs: 18,
    }),
  });

  return result.toUIMessageStreamResponse();
}
