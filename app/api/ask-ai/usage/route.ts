import {
  getAskAiRateLimitUsage,
  rateLimitUnavailableResponse,
} from "@/lib/ask-ai/rate-limit";

export async function GET(req: Request) {
  const usage = await getAskAiRateLimitUsage(req);
  if (usage === "unavailable") return rateLimitUnavailableResponse();
  if (!usage) return Response.json({ disabled: true });

  return Response.json({
    limit: usage.limit,
    used: usage.used,
    remaining: usage.remaining,
    reset: usage.reset,
    resetAt: Math.ceil(usage.reset / 1000),
  });
}
