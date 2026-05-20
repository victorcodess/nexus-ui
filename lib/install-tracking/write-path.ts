import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import type { InMemoryInstallStore, InstallTimelineEvent } from "@/lib/install-tracking/types";
import {
  COMPONENT_INDEX_KEY,
  COMPONENT_KEY_PREFIX,
  CONFIRMED_COMPONENT_KEY_PREFIX,
  CONFIRMED_DAILY_KEY_PREFIX,
  CONFIRMED_TOTAL_INSTALLS_KEY,
  DEDUPE_KEY_PREFIX,
  DAILY_KEY_PREFIX,
  DAILY_TTL_SECONDS,
  DEFAULT_DEDUPE_WINDOW_SECONDS,
  DEFAULT_SESSION_TTL_SECONDS,
  RAW_COMPONENT_KEY_PREFIX,
  RAW_DAILY_KEY_PREFIX,
  RAW_TIMELINE_KEY_PREFIX,
  RAW_TOTAL_INSTALLS_KEY,
  SESSION_CONFIRMED_PREFIX,
  SESSION_FILES_PREFIX,
  SESSION_REQUIRED_PREFIX,
  TIMELINE_KEY_PREFIX,
  TOTAL_INSTALLS_KEY,
  UNIQUE_DAILY_KEY_PREFIX,
  UNIQUE_COMPONENT_DAILY_KEY_PREFIX,
} from "@/lib/install-tracking/constants";
import { getInMemoryStore, getRedisClient } from "@/lib/install-tracking/storage";
import { key, toISODateUTC, toNumber } from "@/lib/install-tracking/utils";

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

export type RecordInstallOptions = {
  requiredFiles?: number;
  confirmOnIntent?: boolean;
};

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
