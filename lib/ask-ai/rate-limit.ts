import { parseAskAiClientSessionId } from "@/lib/ask-ai/client-session";
import { getRedisClient } from "@/lib/install-tracking/storage";

const KEY_PREFIX = "ask-ai:rate:";
const DEFAULT_MAX = 30;
const DEFAULT_UNKNOWN_MAX = 5;

export type AskAiRateLimitUnavailable = "unavailable";

export type AskAiRateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Unix ms when the current window resets */
  reset: number;
};

export type AskAiRateLimitUsage = {
  limit: number;
  used: number;
  remaining: number;
  reset: number;
};

type DevWindow = { count: number; expiresAt: number };

declare global {
  var __askAiRateLimitDev: Map<string, DevWindow> | undefined;
}

function isDisabled() {
  return process.env.ASK_AI_RATE_LIMIT_DISABLED === "true";
}

function maxPerDay(unknownIdentity: boolean) {
  const envMax = Number(
    process.env[
      unknownIdentity
        ? "ASK_AI_RATE_LIMIT_UNKNOWN_MAX"
        : "ASK_AI_RATE_LIMIT_MAX"
    ] ?? (unknownIdentity ? DEFAULT_UNKNOWN_MAX : DEFAULT_MAX),
  );
  const fallback = unknownIdentity ? DEFAULT_UNKNOWN_MAX : DEFAULT_MAX;
  return Number.isFinite(envMax) && envMax > 0 ? Math.floor(envMax) : fallback;
}

function rateLimitBucket(req: Request): { bucket: string; max: number } {
  const ip = getClientIp(req);
  if (ip !== "unknown") {
    return { bucket: ip, max: maxPerDay(false) };
  }

  const sessionId = parseAskAiClientSessionId(req.headers);
  if (sessionId) {
    return { bucket: `session:${sessionId}`, max: maxPerDay(true) };
  }

  return { bucket: "unknown", max: maxPerDay(true) };
}

/** Prefer Vercel’s forwarded IP on production. */
function getClientIp(request: Request): string {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelForwarded) {
    const first = vercelForwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}

function utcDayId(): string {
  return new Date().toISOString().slice(0, 10);
}

function utcMidnightAfter(now = Date.now()): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
}

function secondsUntilUtcMidnight(now = Date.now()): number {
  return Math.max(1, Math.ceil((utcMidnightAfter(now) - now) / 1000));
}

function formatTimeUntilReset(resetMs: number): string {
  const sec = Math.max(0, Math.ceil((resetMs - Date.now()) / 1000));
  if (sec < 60) return "in about a minute";
  if (sec < 3600) return `in about ${Math.ceil(sec / 60)} minutes`;
  const hours = Math.ceil(sec / 3600);
  return hours === 1 ? "in about 1 hour" : `in about ${hours} hours`;
}

export function dailyRateLimitMessage(
  result: Pick<AskAiRateLimitResult, "limit" | "reset">,
): string {
  const until = formatTimeUntilReset(result.reset);
  return `You've used all ${result.limit} Ask AI messages for today. Try again tomorrow (${until}).`;
}

function logRedisRateLimitError(op: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[ask-ai] Redis ${op} failed:`, message);
}

async function peekBucketCount(
  bucket: string,
): Promise<number | AskAiRateLimitUnavailable> {
  const redis = getRedisClient();
  const dayKey = `${KEY_PREFIX}${bucket}:${utcDayId()}`;
  if (redis) {
    try {
      const n = Number(await redis.get(dayKey));
      return Number.isFinite(n) && n > 0 ? n : 0;
    } catch (err) {
      logRedisRateLimitError("get", err);
      if (process.env.NODE_ENV === "production") return "unavailable";
    }
  }
  const win = globalThis.__askAiRateLimitDev?.get(`${bucket}:${utcDayId()}`);
  return win && win.expiresAt > Date.now() ? win.count : 0;
}

export async function getAskAiRateLimitUsage(
  req: Request,
): Promise<AskAiRateLimitUsage | AskAiRateLimitUnavailable | null> {
  if (isDisabled()) return null;
  const { bucket, max } = rateLimitBucket(req);
  if (!getRedisClient() && process.env.NODE_ENV === "production") {
    return "unavailable";
  }
  const used = await peekBucketCount(bucket);
  if (used === "unavailable") return "unavailable";
  const reset = utcMidnightAfter();
  return {
    limit: max,
    used,
    remaining: Math.max(0, max - used),
    reset,
  };
}

function checkDevMemory(clientId: string, max: number): AskAiRateLimitResult {
  if (!globalThis.__askAiRateLimitDev) {
    globalThis.__askAiRateLimitDev = new Map();
  }

  const now = Date.now();
  const key = `${clientId}:${utcDayId()}`;
  const reset = utcMidnightAfter(now);
  let window = globalThis.__askAiRateLimitDev.get(key);
  if (!window || window.expiresAt <= now) {
    window = { count: 0, expiresAt: reset };
    globalThis.__askAiRateLimitDev.set(key, window);
  }

  window.count += 1;

  return {
    ok: window.count <= max,
    limit: max,
    remaining: Math.max(0, max - window.count),
    reset: window.expiresAt,
  };
}

async function checkRedis(
  clientId: string,
  max: number,
): Promise<AskAiRateLimitResult | AskAiRateLimitUnavailable> {
  const redis = getRedisClient();
  const reset = utcMidnightAfter();

  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[ask-ai] Rate limit unavailable: UPSTASH_REDIS_REST_URL/TOKEN not set",
      );
      return "unavailable";
    }
    return checkDevMemory(clientId, max);
  }

  const key = `${KEY_PREFIX}${clientId}:${utcDayId()}`;
  try {
    const count = await redis.incr(key);
    const ttlSec = secondsUntilUtcMidnight();
    if (count === 1) {
      await redis.expire(key, ttlSec);
    } else {
      const ttl = await redis.ttl(key);
      if (ttl < 0) await redis.expire(key, ttlSec);
    }

    return {
      ok: count <= max,
      limit: max,
      remaining: Math.max(0, max - count),
      reset,
    };
  } catch (err) {
    logRedisRateLimitError("incr", err);
    if (process.env.NODE_ENV === "production") return "unavailable";
    return checkDevMemory(clientId, max);
  }
}

export async function checkAskAiRateLimit(
  req: Request,
): Promise<AskAiRateLimitResult | AskAiRateLimitUnavailable | null> {
  if (isDisabled()) return null;
  const { bucket, max } = rateLimitBucket(req);
  return checkRedis(bucket, max);
}

export function rateLimitUnavailableResponse() {
  return Response.json(
    {
      error: "Ask AI is temporarily unavailable. Please try again later.",
      code: "service_unavailable",
    },
    { status: 503 },
  );
}

type AskAiApiErrorBody = {
  error?: string;
  code?: string;
};

/** AI SDK often surfaces the full JSON body as `chat.error.message`. */
export function parseAskAiChatError(raw: string): {
  isRateLimited: boolean;
  message: string;
} {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const data = JSON.parse(trimmed) as AskAiApiErrorBody;
      if (
        data.code === "rate_limit_exceeded" &&
        typeof data.error === "string"
      ) {
        return { isRateLimited: true, message: data.error };
      }
      if (typeof data.error === "string") {
        return { isRateLimited: false, message: data.error };
      }
    } catch {
      // fall through
    }
  }

  const isRateLimited =
    trimmed.includes("rate_limit_exceeded") ||
    trimmed.includes("daily limit") ||
    trimmed.includes("for today");

  return { isRateLimited, message: trimmed };
}

export function rateLimitResponse(result: AskAiRateLimitResult) {
  const retryAfterSec = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  return Response.json(
    {
      error: dailyRateLimitMessage(result),
      code: "rate_limit_exceeded",
      window: "day",
      limit: result.limit,
      resetAt: Math.ceil(result.reset / 1000),
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
      },
    },
  );
}
