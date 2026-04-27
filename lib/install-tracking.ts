import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

const TOTAL_INSTALLS_KEY = "installs:total";
const COMPONENT_INDEX_KEY = "installs:components";
const DAILY_KEY_PREFIX = "installs:day";
const COMPONENT_KEY_PREFIX = "installs:component";
const UNIQUE_DAILY_KEY_PREFIX = "installs:unique:day";
const UNIQUE_COMPONENT_DAILY_KEY_PREFIX = "installs:unique:component";
const DAILY_TTL_SECONDS = 60 * 60 * 24 * 366;
const DEFAULT_DEDUPE_WINDOW_SECONDS = 60;
const DEDUPE_KEY_PREFIX = "installs:dedupe";

type SummaryDay = {
  date: string;
  installs: number;
  uniqueInstallers: number;
};

type SummaryComponent = {
  name: string;
  installs: number;
};

export type InstallSummary = {
  enabled: boolean;
  storage: "upstash" | "memory" | "disabled";
  totalInstalls: number;
  components: SummaryComponent[];
  daily: SummaryDay[];
};

type InMemoryInstallStore = {
  totalInstalls: number;
  components: Map<string, number>;
  dailyInstalls: Map<string, number>;
  uniqueDailyInstallers: Map<string, Set<string>>;
  dedupe: Map<string, number>;
};

declare global {
  // eslint-disable-next-line no-var
  var __nexusInMemoryInstallStore: InMemoryInstallStore | undefined;
}

let redisClient: Redis | null = null;

function toISODateUTC(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function key(prefix: string, suffix: string): string {
  return `${prefix}:${suffix}`;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getDedupeWindowSeconds(): number {
  const parsed = Number(process.env.INSTALL_TRACKING_DEDUPE_SECONDS);
  if (!Number.isFinite(parsed)) return DEFAULT_DEDUPE_WINDOW_SECONDS;
  const rounded = Math.round(parsed);
  return Math.max(1, Math.min(600, rounded));
}

function isTrackingEnabled(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedisClient(): Redis | null {
  if (!isTrackingEnabled()) return null;
  if (redisClient) return redisClient;

  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return redisClient;
}

function getInMemoryStore(): InMemoryInstallStore | null {
  if (process.env.NODE_ENV === "production") return null;

  if (!globalThis.__nexusInMemoryInstallStore) {
    globalThis.__nexusInMemoryInstallStore = {
      totalInstalls: 0,
      components: new Map(),
      dailyInstalls: new Map(),
      uniqueDailyInstallers: new Map(),
      dedupe: new Map(),
    };
  }

  // Backfill for existing dev-server globals created before dedupe existed.
  if (!globalThis.__nexusInMemoryInstallStore.dedupe) {
    globalThis.__nexusInMemoryInstallStore.dedupe = new Map();
  }

  return globalThis.__nexusInMemoryInstallStore;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function hashInstaller(request: NextRequest): string {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const salt = process.env.INSTALL_TRACKING_SALT ?? "nexus-ui-install-tracking";
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${salt}`)
    .digest("hex");
}

export function getInstallDashboardKey(): string | null {
  return process.env.INSTALL_ANALYTICS_DASHBOARD_KEY ?? null;
}

export async function recordInstall(componentName: string, request: NextRequest): Promise<void> {
  const redis = getRedisClient();
  const inMemoryStore = redis ? null : getInMemoryStore();
  if (!redis && !inMemoryStore) return;

  const day = toISODateUTC();
  const installerHash = hashInstaller(request);
  const nowMs = Date.now();
  const dedupeKey = `${componentName}:${installerHash}`;
  const dedupeWindowSeconds = getDedupeWindowSeconds();

  if (inMemoryStore) {
    const dedupeUntil = inMemoryStore.dedupe.get(dedupeKey) ?? 0;
    if (dedupeUntil > nowMs) return;
    inMemoryStore.dedupe.set(dedupeKey, nowMs + dedupeWindowSeconds * 1000);

    inMemoryStore.totalInstalls += 1;
    inMemoryStore.components.set(
      componentName,
      (inMemoryStore.components.get(componentName) ?? 0) + 1,
    );
    inMemoryStore.dailyInstalls.set(day, (inMemoryStore.dailyInstalls.get(day) ?? 0) + 1);

    const uniqueInstallers = inMemoryStore.uniqueDailyInstallers.get(day) ?? new Set<string>();
    uniqueInstallers.add(installerHash);
    inMemoryStore.uniqueDailyInstallers.set(day, uniqueInstallers);
    return;
  }
  if (!redis) return;
  const redisDedupeKey = key(DEDUPE_KEY_PREFIX, dedupeKey);

  const dayInstallKey = key(DAILY_KEY_PREFIX, day);
  const componentInstallKey = key(COMPONENT_KEY_PREFIX, componentName);
  const componentDailyKey = key(key(COMPONENT_KEY_PREFIX, componentName), day);
  const uniqueDayKey = key(UNIQUE_DAILY_KEY_PREFIX, day);
  const uniqueComponentDailyKey = key(
    key(UNIQUE_COMPONENT_DAILY_KEY_PREFIX, componentName),
    day,
  );

  try {
    const dedupeAccepted = await redis.set(redisDedupeKey, "1", {
      nx: true,
      ex: dedupeWindowSeconds,
    });
    if (dedupeAccepted !== "OK") return;

    const pipeline = redis.multi();
    pipeline.incr(TOTAL_INSTALLS_KEY);
    pipeline.incr(componentInstallKey);
    pipeline.incr(dayInstallKey);
    pipeline.incr(componentDailyKey);
    pipeline.sadd(COMPONENT_INDEX_KEY, componentName);
    pipeline.sadd(uniqueDayKey, installerHash);
    pipeline.sadd(uniqueComponentDailyKey, installerHash);
    pipeline.expire(dayInstallKey, DAILY_TTL_SECONDS);
    pipeline.expire(componentDailyKey, DAILY_TTL_SECONDS);
    pipeline.expire(uniqueDayKey, DAILY_TTL_SECONDS);
    pipeline.expire(uniqueComponentDailyKey, DAILY_TTL_SECONDS);
    await pipeline.exec();
  } catch (error) {
    console.error("[install-tracking] failed to record install", error);
  }
}

function getRecentDates(days: number): string[] {
  const safeDays = Math.max(1, Math.min(90, days));
  const dates: string[] = [];

  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - offset);
    dates.push(toISODateUTC(date));
  }

  return dates;
}

export async function getInstallSummary(days = 14): Promise<InstallSummary> {
  const redis = getRedisClient();
  const inMemoryStore = redis ? null : getInMemoryStore();

  if (!redis && !inMemoryStore) {
    return {
      enabled: false,
      storage: "disabled",
      totalInstalls: 0,
      components: [],
      daily: [],
    };
  }

  if (inMemoryStore) {
    const dates = getRecentDates(days);
    const components = [...inMemoryStore.components.entries()]
      .map(([name, installs]) => ({ name, installs }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const daily = dates.map((date) => ({
      date,
      installs: inMemoryStore.dailyInstalls.get(date) ?? 0,
      uniqueInstallers: inMemoryStore.uniqueDailyInstallers.get(date)?.size ?? 0,
    }));

    return {
      enabled: true,
      storage: "memory",
      totalInstalls: inMemoryStore.totalInstalls,
      components,
      daily,
    };
  }
  if (!redis) {
    return {
      enabled: false,
      storage: "disabled",
      totalInstalls: 0,
      components: [],
      daily: [],
    };
  }

  const [totalRaw, componentNamesRaw] = await Promise.all([
    redis.get<number | string | null>(TOTAL_INSTALLS_KEY),
    redis.smembers<string[]>(COMPONENT_INDEX_KEY),
  ]);

  const componentNames = [...(componentNamesRaw ?? [])].sort((a, b) => a.localeCompare(b));
  const dates = getRecentDates(days);

  const [componentTotalsRaw, dailyInstallsRaw, dailyUniqueRaw] = await Promise.all([
    Promise.all(componentNames.map((name) => redis.get<number | string | null>(key(COMPONENT_KEY_PREFIX, name)))),
    Promise.all(dates.map((date) => redis.get<number | string | null>(key(DAILY_KEY_PREFIX, date)))),
    Promise.all(dates.map((date) => redis.scard(key(UNIQUE_DAILY_KEY_PREFIX, date)))),
  ]);

  const components = componentNames.map((name, index) => ({
    name,
    installs: toNumber(componentTotalsRaw[index]),
  }));

  const daily = dates.map((date, index) => ({
    date,
    installs: toNumber(dailyInstallsRaw[index]),
    uniqueInstallers: toNumber(dailyUniqueRaw[index]),
  }));

  return {
    enabled: true,
    storage: "upstash",
    totalInstalls: toNumber(totalRaw),
    components,
    daily,
  };
}
