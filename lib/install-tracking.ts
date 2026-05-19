import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

const TOTAL_INSTALLS_KEY = "installs:total";
const RAW_TOTAL_INSTALLS_KEY = "installs:raw:total";
const CONFIRMED_TOTAL_INSTALLS_KEY = "installs:confirmed:total";
const COMPONENT_INDEX_KEY = "installs:components";
const DAILY_KEY_PREFIX = "installs:day";
const RAW_DAILY_KEY_PREFIX = "installs:raw:day";
const CONFIRMED_DAILY_KEY_PREFIX = "installs:confirmed:day";
const COMPONENT_KEY_PREFIX = "installs:component";
const RAW_COMPONENT_KEY_PREFIX = "installs:raw:component";
const CONFIRMED_COMPONENT_KEY_PREFIX = "installs:confirmed:component";
const UNIQUE_DAILY_KEY_PREFIX = "installs:unique:day";
const UNIQUE_COMPONENT_DAILY_KEY_PREFIX = "installs:unique:component";
const DAILY_TTL_SECONDS = 60 * 60 * 24 * 366;
const DEFAULT_DEDUPE_WINDOW_SECONDS = 60;
const DEDUPE_KEY_PREFIX = "installs:dedupe";
const SESSION_REQUIRED_PREFIX = "installs:session:required";
const SESSION_FILES_PREFIX = "installs:session:files";
const SESSION_CONFIRMED_PREFIX = "installs:session:confirmed";
const TIMELINE_KEY_PREFIX = "installs:timeline";
const RAW_TIMELINE_KEY_PREFIX = "installs:timeline:raw";
const DEFAULT_SESSION_TTL_SECONDS = 60 * 5;
export const DEFAULT_SUMMARY_DAYS = 30;

type SummaryDay = {
  date: string;
  installs: number;
  uniqueInstallers: number;
};

type SummaryComponent = {
  name: string;
  installs: number;
};

type SummaryMetrics = {
  rawRequests: number;
  dedupedIntents: number;
  confirmedInstalls: number;
};

type SummaryComponentMetrics = {
  name: string;
  rawRequests: number;
  dedupedIntents: number;
  confirmedInstalls: number;
};

type SummaryDailyMetrics = {
  date: string;
  rawRequests: number;
  dedupedIntents: number;
  confirmedInstalls: number;
  uniqueInstallers: number;
};

export type InstallTimelineEvent = {
  component: string;
  timestamp: number;
};

export type InstallTimelineMetric = "confirmed" | "raw";

export type InstallSummary = {
  enabled: boolean;
  storage: "upstash" | "memory" | "disabled";
  totalInstalls: number;
  components: SummaryComponent[];
  daily: SummaryDay[];
  metrics: SummaryMetrics;
  componentMetrics: SummaryComponentMetrics[];
  dailyMetrics: SummaryDailyMetrics[];
};

type InMemoryInstallSession = {
  requiredFiles: number;
  fetchedFiles: Set<string>;
  confirmed: boolean;
  expiresAt: number;
};

type InMemoryInstallStore = {
  rawTotalInstalls: number;
  dedupedTotalInstalls: number;
  confirmedTotalInstalls: number;
  rawComponents: Map<string, number>;
  dedupedComponents: Map<string, number>;
  confirmedComponents: Map<string, number>;
  rawDailyInstalls: Map<string, number>;
  dedupedDailyInstalls: Map<string, number>;
  confirmedDailyInstalls: Map<string, number>;
  uniqueDailyInstallers: Map<string, Set<string>>;
  dedupe: Map<string, number>;
  sessions: Map<string, InMemoryInstallSession>;
  timelineByDay: Map<string, InstallTimelineEvent[]>;
  rawTimelineByDay: Map<string, InstallTimelineEvent[]>;
};

declare global {
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

export function toInstallSummaryDays(value: unknown): number {
  if (typeof value === "string" && value.trim() === "") {
    return DEFAULT_SUMMARY_DAYS;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) return DEFAULT_SUMMARY_DAYS;
  const rounded = Math.round(parsed);
  return Math.max(1, Math.min(90, rounded));
}

function getDedupeWindowSeconds(): number {
  const parsed = Number(process.env.INSTALL_TRACKING_DEDUPE_SECONDS);
  if (!Number.isFinite(parsed)) return DEFAULT_DEDUPE_WINDOW_SECONDS;
  const rounded = Math.round(parsed);
  return Math.max(1, Math.min(600, rounded));
}

function getSessionTtlSeconds(): number {
  const parsed = Number(process.env.INSTALL_TRACKING_SESSION_TTL_SECONDS);
  if (!Number.isFinite(parsed)) return DEFAULT_SESSION_TTL_SECONDS;
  const rounded = Math.round(parsed);
  return Math.max(30, Math.min(3600, rounded));
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
      rawTotalInstalls: 0,
      dedupedTotalInstalls: 0,
      confirmedTotalInstalls: 0,
      rawComponents: new Map(),
      dedupedComponents: new Map(),
      confirmedComponents: new Map(),
      rawDailyInstalls: new Map(),
      dedupedDailyInstalls: new Map(),
      confirmedDailyInstalls: new Map(),
      uniqueDailyInstallers: new Map(),
      dedupe: new Map(),
      sessions: new Map(),
      timelineByDay: new Map(),
      rawTimelineByDay: new Map(),
    };
  }

  // Backfill for existing dev-server globals created before dedupe existed.
  if (!globalThis.__nexusInMemoryInstallStore.dedupe) {
    globalThis.__nexusInMemoryInstallStore.dedupe = new Map();
  }
  if (!globalThis.__nexusInMemoryInstallStore.sessions) {
    globalThis.__nexusInMemoryInstallStore.sessions = new Map();
  }
  if (!globalThis.__nexusInMemoryInstallStore.timelineByDay) {
    globalThis.__nexusInMemoryInstallStore.timelineByDay = new Map();
  }
  if (!globalThis.__nexusInMemoryInstallStore.rawTimelineByDay) {
    globalThis.__nexusInMemoryInstallStore.rawTimelineByDay = new Map();
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

type RecordInstallOptions = {
  requiredFiles?: number;
  confirmOnIntent?: boolean;
};

function isLikelyBrowserNavigation(request: NextRequest): boolean {
  const userAgent = (request.headers.get("user-agent") ?? "").toLowerCase();
  const secFetchDest = (request.headers.get("sec-fetch-dest") ?? "").toLowerCase();
  const secFetchMode = (request.headers.get("sec-fetch-mode") ?? "").toLowerCase();
  const secFetchSite = (request.headers.get("sec-fetch-site") ?? "").toLowerCase();
  const accept = (request.headers.get("accept") ?? "").toLowerCase();

  // Browsers attach sec-fetch-* headers for both navigations and XHR/fetch.
  // We only want CLI/package-manager traffic for install intent metrics.
  if (secFetchDest || secFetchMode || secFetchSite) return true;
  if (secFetchDest === "document" || secFetchMode === "navigate") return true;
  if (userAgent.includes("mozilla/5.0") && accept.includes("text/html")) return true;
  return false;
}

function getSessionKey(componentName: string, installerHash: string): string {
  return `${componentName}:${installerHash}`;
}

function toSafeRequiredFiles(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(25, Math.round(value!)));
}

function pruneExpiredSessions(store: InMemoryInstallStore, nowMs: number): void {
  for (const [sessionKey, session] of store.sessions.entries()) {
    if (session.expiresAt <= nowMs) {
      store.sessions.delete(sessionKey);
    }
  }
}

function bumpCount(map: Map<string, number>, item: string, amount = 1): void {
  map.set(item, (map.get(item) ?? 0) + amount);
}

function appendTimelineEventInMemory(
  eventsByDay: Map<string, InstallTimelineEvent[]>,
  day: string,
  event: InstallTimelineEvent,
): void {
  const events = eventsByDay.get(day) ?? [];
  events.push(event);
  if (events.length > 5000) {
    events.shift();
  }
  eventsByDay.set(day, events);
}

export async function recordInstall(
  componentName: string,
  request: NextRequest,
  options: RecordInstallOptions = {},
): Promise<void> {
  const redis = getRedisClient();
  const inMemoryStore = redis ? null : getInMemoryStore();
  if (!redis && !inMemoryStore) return;

  const day = toISODateUTC();
  const installerHash = hashInstaller(request);
  const isBrowserNavigation = isLikelyBrowserNavigation(request);
  const nowMs = Date.now();
  const dedupeKey = getSessionKey(componentName, installerHash);
  const sessionKey = getSessionKey(componentName, installerHash);
  const requiredFiles = toSafeRequiredFiles(options.requiredFiles);
  const confirmOnIntent = Boolean(options.confirmOnIntent);
  const dedupeWindowSeconds = getDedupeWindowSeconds();
  const sessionTtlSeconds = getSessionTtlSeconds();

  if (inMemoryStore) {
    pruneExpiredSessions(inMemoryStore, nowMs);
    inMemoryStore.rawTotalInstalls += 1;
    bumpCount(inMemoryStore.rawComponents, componentName);
    bumpCount(inMemoryStore.rawDailyInstalls, day);
    appendTimelineEventInMemory(inMemoryStore.rawTimelineByDay, day, {
      component: componentName,
      timestamp: nowMs,
    });

    if (isBrowserNavigation) return;

    const dedupeUntil = inMemoryStore.dedupe.get(dedupeKey) ?? 0;
    if (dedupeUntil > nowMs) return;
    inMemoryStore.dedupe.set(dedupeKey, nowMs + dedupeWindowSeconds * 1000);

    inMemoryStore.dedupedTotalInstalls += 1;
    bumpCount(inMemoryStore.dedupedComponents, componentName);
    bumpCount(inMemoryStore.dedupedDailyInstalls, day);

    const uniqueInstallers = inMemoryStore.uniqueDailyInstallers.get(day) ?? new Set<string>();
    uniqueInstallers.add(installerHash);
    inMemoryStore.uniqueDailyInstallers.set(day, uniqueInstallers);

    if (confirmOnIntent) {
      inMemoryStore.confirmedTotalInstalls += 1;
      bumpCount(inMemoryStore.confirmedComponents, componentName);
      bumpCount(inMemoryStore.confirmedDailyInstalls, day);
      appendTimelineEventInMemory(inMemoryStore.timelineByDay, day, {
        component: componentName,
        timestamp: nowMs,
      });
      return;
    }

    inMemoryStore.sessions.set(sessionKey, {
      requiredFiles,
      fetchedFiles: new Set<string>(),
      confirmed: false,
      expiresAt: nowMs + sessionTtlSeconds * 1000,
    });
    return;
  }
  if (!redis) return;
  const redisDedupeKey = key(DEDUPE_KEY_PREFIX, dedupeKey);
  const rawDayInstallKey = key(RAW_DAILY_KEY_PREFIX, day);
  const rawComponentInstallKey = key(RAW_COMPONENT_KEY_PREFIX, componentName);
  const rawTimelineDayKey = key(RAW_TIMELINE_KEY_PREFIX, day);
  const sessionRequiredKey = key(SESSION_REQUIRED_PREFIX, sessionKey);
  const sessionFilesKey = key(SESSION_FILES_PREFIX, sessionKey);

  const dayInstallKey = key(DAILY_KEY_PREFIX, day);
  const componentInstallKey = key(COMPONENT_KEY_PREFIX, componentName);
  const componentDailyKey = key(key(COMPONENT_KEY_PREFIX, componentName), day);
  const uniqueDayKey = key(UNIQUE_DAILY_KEY_PREFIX, day);
  const uniqueComponentDailyKey = key(
    key(UNIQUE_COMPONENT_DAILY_KEY_PREFIX, componentName),
    day,
  );

  try {
    const rawPipeline = redis.multi();
    rawPipeline.incr(RAW_TOTAL_INSTALLS_KEY);
    rawPipeline.incr(rawComponentInstallKey);
    rawPipeline.incr(rawDayInstallKey);
    rawPipeline.sadd(COMPONENT_INDEX_KEY, componentName);
    rawPipeline.expire(rawDayInstallKey, DAILY_TTL_SECONDS);
    rawPipeline.rpush(
      rawTimelineDayKey,
      JSON.stringify({
        component: componentName,
        timestamp: nowMs,
      } satisfies InstallTimelineEvent),
    );
    rawPipeline.expire(rawTimelineDayKey, DAILY_TTL_SECONDS);
    await rawPipeline.exec();

    if (isBrowserNavigation) return;

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
    if (confirmOnIntent) {
      const confirmedComponentKey = key(CONFIRMED_COMPONENT_KEY_PREFIX, componentName);
      const confirmedDayKey = key(CONFIRMED_DAILY_KEY_PREFIX, day);
      const timelineDayKey = key(TIMELINE_KEY_PREFIX, day);
      pipeline.incr(CONFIRMED_TOTAL_INSTALLS_KEY);
      pipeline.incr(confirmedComponentKey);
      pipeline.incr(confirmedDayKey);
      pipeline.expire(confirmedDayKey, DAILY_TTL_SECONDS);
      pipeline.rpush(
        timelineDayKey,
        JSON.stringify({
          component: componentName,
          timestamp: nowMs,
        } satisfies InstallTimelineEvent),
      );
      pipeline.expire(timelineDayKey, DAILY_TTL_SECONDS);
    } else {
      pipeline.set(sessionRequiredKey, String(requiredFiles), {
        ex: sessionTtlSeconds,
      });
      pipeline.del(sessionFilesKey);
      pipeline.expire(sessionFilesKey, sessionTtlSeconds);
    }
    await pipeline.exec();
  } catch (error) {
    console.error("[install-tracking] failed to record install", error);
  }
}

export async function recordInstallFileFetch(
  componentName: string,
  fileIdentifier: string,
  request: NextRequest,
): Promise<void> {
  if (isLikelyBrowserNavigation(request)) return;

  const redis = getRedisClient();
  const inMemoryStore = redis ? null : getInMemoryStore();
  if (!redis && !inMemoryStore) return;

  const day = toISODateUTC();
  const installerHash = hashInstaller(request);
  const sessionKey = getSessionKey(componentName, installerHash);
  const nowMs = Date.now();

  if (inMemoryStore) {
    pruneExpiredSessions(inMemoryStore, nowMs);
    const session = inMemoryStore.sessions.get(sessionKey);
    if (!session || session.expiresAt <= nowMs) return;
    if (session.confirmed) return;

    session.fetchedFiles.add(fileIdentifier);
    if (session.fetchedFiles.size < session.requiredFiles) return;

    session.confirmed = true;
    inMemoryStore.confirmedTotalInstalls += 1;
    bumpCount(inMemoryStore.confirmedComponents, componentName);
    bumpCount(inMemoryStore.confirmedDailyInstalls, day);
    appendTimelineEventInMemory(inMemoryStore.timelineByDay, day, {
      component: componentName,
      timestamp: nowMs,
    });
    return;
  }
  if (!redis) return;

  const sessionRequiredKey = key(SESSION_REQUIRED_PREFIX, sessionKey);
  const sessionFilesKey = key(SESSION_FILES_PREFIX, sessionKey);
  const sessionConfirmedKey = key(SESSION_CONFIRMED_PREFIX, sessionKey);
  const confirmedComponentKey = key(CONFIRMED_COMPONENT_KEY_PREFIX, componentName);
  const confirmedDayKey = key(CONFIRMED_DAILY_KEY_PREFIX, day);
  const timelineDayKey = key(TIMELINE_KEY_PREFIX, day);

  try {
    const requiredRaw = await redis.get<number | string | null>(sessionRequiredKey);
    const requiredFiles = Math.max(1, toNumber(requiredRaw));
    if (requiredFiles <= 0) return;

    await redis.sadd(sessionFilesKey, fileIdentifier);
    await redis.expire(sessionFilesKey, getSessionTtlSeconds());
    const fetchedCount = await redis.scard(sessionFilesKey);
    if (toNumber(fetchedCount) < requiredFiles) return;

    const confirmAccepted = await redis.set(sessionConfirmedKey, "1", {
      nx: true,
      ex: getSessionTtlSeconds(),
    });
    if (confirmAccepted !== "OK") return;

    const pipeline = redis.multi();
    pipeline.incr(CONFIRMED_TOTAL_INSTALLS_KEY);
    pipeline.incr(confirmedComponentKey);
    pipeline.incr(confirmedDayKey);
    pipeline.expire(confirmedDayKey, DAILY_TTL_SECONDS);
    pipeline.rpush(
      timelineDayKey,
      JSON.stringify({
        component: componentName,
        timestamp: nowMs,
      } satisfies InstallTimelineEvent),
    );
    pipeline.expire(timelineDayKey, DAILY_TTL_SECONDS);
    await pipeline.exec();
  } catch (error) {
    console.error("[install-tracking] failed to confirm install", error);
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
  const safeDays = toInstallSummaryDays(days);
  const redis = getRedisClient();
  const inMemoryStore = redis ? null : getInMemoryStore();

  if (!redis && !inMemoryStore) {
    return {
      enabled: false,
      storage: "disabled",
      totalInstalls: 0,
      components: [],
      daily: [],
      metrics: {
        rawRequests: 0,
        dedupedIntents: 0,
        confirmedInstalls: 0,
      },
      componentMetrics: [],
      dailyMetrics: [],
    };
  }

  if (inMemoryStore) {
    const dates = getRecentDates(safeDays);
    const componentNameSet = new Set<string>([
      ...inMemoryStore.rawComponents.keys(),
      ...inMemoryStore.dedupedComponents.keys(),
      ...inMemoryStore.confirmedComponents.keys(),
    ]);
    const componentNames = [...componentNameSet].sort((a, b) => a.localeCompare(b));

    const components = componentNames.map((name) => ({
      name,
      installs: inMemoryStore.dedupedComponents.get(name) ?? 0,
    }));

    const daily = dates.map((date) => ({
      date,
      installs: inMemoryStore.dedupedDailyInstalls.get(date) ?? 0,
      uniqueInstallers: inMemoryStore.uniqueDailyInstallers.get(date)?.size ?? 0,
    }));

    const componentMetrics = componentNames.map((name) => ({
      name,
      rawRequests: inMemoryStore.rawComponents.get(name) ?? 0,
      dedupedIntents: inMemoryStore.dedupedComponents.get(name) ?? 0,
      confirmedInstalls: inMemoryStore.confirmedComponents.get(name) ?? 0,
    }));

    const dailyMetrics = dates.map((date) => ({
      date,
      rawRequests: inMemoryStore.rawDailyInstalls.get(date) ?? 0,
      dedupedIntents: inMemoryStore.dedupedDailyInstalls.get(date) ?? 0,
      confirmedInstalls: inMemoryStore.confirmedDailyInstalls.get(date) ?? 0,
      uniqueInstallers: inMemoryStore.uniqueDailyInstallers.get(date)?.size ?? 0,
    }));

    return {
      enabled: true,
      storage: "memory",
      totalInstalls: inMemoryStore.dedupedTotalInstalls,
      components,
      daily,
      metrics: {
        rawRequests: inMemoryStore.rawTotalInstalls,
        dedupedIntents: inMemoryStore.dedupedTotalInstalls,
        confirmedInstalls: inMemoryStore.confirmedTotalInstalls,
      },
      componentMetrics,
      dailyMetrics,
    };
  }
  if (!redis) {
    return {
      enabled: false,
      storage: "disabled",
      totalInstalls: 0,
      components: [],
      daily: [],
      metrics: {
        rawRequests: 0,
        dedupedIntents: 0,
        confirmedInstalls: 0,
      },
      componentMetrics: [],
      dailyMetrics: [],
    };
  }

  const [totalRaw, rawTotalRaw, confirmedTotalRaw, componentNamesRaw] = await Promise.all([
    redis.get<number | string | null>(TOTAL_INSTALLS_KEY),
    redis.get<number | string | null>(RAW_TOTAL_INSTALLS_KEY),
    redis.get<number | string | null>(CONFIRMED_TOTAL_INSTALLS_KEY),
    redis.smembers<string[]>(COMPONENT_INDEX_KEY),
  ]);

  const componentNames = [...(componentNamesRaw ?? [])].sort((a, b) => a.localeCompare(b));
  const dates = getRecentDates(safeDays);

  const [
    componentTotalsRaw,
    componentRawTotalsRaw,
    componentConfirmedTotalsRaw,
    dailyInstallsRaw,
    dailyRawInstallsRaw,
    dailyConfirmedRaw,
    dailyUniqueRaw,
  ] = await Promise.all([
    Promise.all(componentNames.map((name) => redis.get<number | string | null>(key(COMPONENT_KEY_PREFIX, name)))),
    Promise.all(componentNames.map((name) => redis.get<number | string | null>(key(RAW_COMPONENT_KEY_PREFIX, name)))),
    Promise.all(componentNames.map((name) => redis.get<number | string | null>(key(CONFIRMED_COMPONENT_KEY_PREFIX, name)))),
    Promise.all(dates.map((date) => redis.get<number | string | null>(key(DAILY_KEY_PREFIX, date)))),
    Promise.all(dates.map((date) => redis.get<number | string | null>(key(RAW_DAILY_KEY_PREFIX, date)))),
    Promise.all(dates.map((date) => redis.get<number | string | null>(key(CONFIRMED_DAILY_KEY_PREFIX, date)))),
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

  const componentMetrics = componentNames.map((name, index) => ({
    name,
    rawRequests: toNumber(componentRawTotalsRaw[index]),
    dedupedIntents: toNumber(componentTotalsRaw[index]),
    confirmedInstalls: toNumber(componentConfirmedTotalsRaw[index]),
  }));

  const dailyMetrics = dates.map((date, index) => ({
    date,
    rawRequests: toNumber(dailyRawInstallsRaw[index]),
    dedupedIntents: toNumber(dailyInstallsRaw[index]),
    confirmedInstalls: toNumber(dailyConfirmedRaw[index]),
    uniqueInstallers: toNumber(dailyUniqueRaw[index]),
  }));

  return {
    enabled: true,
    storage: "upstash",
    totalInstalls: toNumber(totalRaw),
    components,
    daily,
    metrics: {
      rawRequests: toNumber(rawTotalRaw),
      dedupedIntents: toNumber(totalRaw),
      confirmedInstalls: toNumber(confirmedTotalRaw),
    },
    componentMetrics,
    dailyMetrics,
  };
}

export async function getInstallTimeline(
  day: string,
  metric: InstallTimelineMetric = "confirmed",
  limit = 250,
): Promise<InstallTimelineEvent[]> {
  const maxItems = Math.max(1, Math.min(1000, Math.round(limit)));
  const redis = getRedisClient();
  const inMemoryStore = redis ? null : getInMemoryStore();

  if (inMemoryStore) {
    const eventsByDay =
      metric === "raw" ? inMemoryStore.rawTimelineByDay : inMemoryStore.timelineByDay;
    const events = eventsByDay.get(day) ?? [];
    return [...events].slice(-maxItems).reverse();
  }
  if (!redis) return [];

  const timelineDayKey = key(
    metric === "raw" ? RAW_TIMELINE_KEY_PREFIX : TIMELINE_KEY_PREFIX,
    day,
  );
  const raw = await redis.lrange<unknown>(timelineDayKey, -maxItems, -1);
  return (raw ?? [])
    .map((item) => {
      try {
        const parsed =
          typeof item === "string"
            ? (JSON.parse(item) as InstallTimelineEvent)
            : (item as InstallTimelineEvent);
        if (
          typeof parsed?.component !== "string" ||
          typeof parsed?.timestamp !== "number"
        ) {
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    })
    .filter((item): item is InstallTimelineEvent => item !== null)
    .reverse();
}
