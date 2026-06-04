import { getRedisClient } from "@/lib/install-tracking/storage";

const KEY_PREFIX = "ask-ai:rate:";
/** Requests allowed per IP per UTC calendar day. */
const DEFAULT_MAX = 20;

export type AskAiRateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Unix ms when the current window resets */
  reset: number;
};

type DevWindow = { count: number; expiresAt: number };

declare global {
  var __askAiRateLimitDev: Map<string, DevWindow> | undefined;
}

function isDisabled() {
  return process.env.ASK_AI_RATE_LIMIT_DISABLED === "true";
}

function limits() {
  const max = Number(process.env.ASK_AI_RATE_LIMIT_MAX ?? DEFAULT_MAX);
  return {
    max: Number.isFinite(max) && max > 0 ? Math.floor(max) : DEFAULT_MAX,
  };
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

/**
 * Best-effort client id for public docs (no auth).
 * On Vercel, `x-forwarded-for` / `x-real-ip` are set at the edge (not client-controlled).
 * Weak against VPN rotation; all unidentified clients share the `unknown` bucket.
 */
export function getAskAiClientId(req: Request): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  return "unknown";
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

function checkDevMemory(id: string, max: number): AskAiRateLimitResult {
  if (!globalThis.__askAiRateLimitDev) {
    globalThis.__askAiRateLimitDev = new Map();
  }

  const now = Date.now();
  const bucketKey = `${id}:${utcDayId()}`;
  const reset = utcMidnightAfter(now);
  let window = globalThis.__askAiRateLimitDev.get(bucketKey);
  if (!window || window.expiresAt <= now) {
    window = { count: 0, expiresAt: reset };
    globalThis.__askAiRateLimitDev.set(bucketKey, window);
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
  id: string,
  max: number,
): Promise<AskAiRateLimitResult> {
  const redis = getRedisClient();
  const reset = utcMidnightAfter();

  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[ask-ai] Rate limit skipped: UPSTASH_REDIS_REST_URL/TOKEN not set",
      );
    }
    return checkDevMemory(id, max);
  }

  const key = `${KEY_PREFIX}${id}:${utcDayId()}`;
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
}

export async function checkAskAiRateLimit(
  req: Request,
): Promise<AskAiRateLimitResult | null> {
  if (isDisabled()) return null;

  const { max } = limits();
  const id = getAskAiClientId(req);
  return checkRedis(id, max);
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
