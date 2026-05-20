import { Redis } from "@upstash/redis";
import type { InstallSummary, InstallTimelineEvent, InstallTimelineMetric } from "@/lib/install-tracking/types";
import {
  COMPONENT_INDEX_KEY,
  COMPONENT_KEY_PREFIX,
  CONFIRMED_COMPONENT_KEY_PREFIX,
  CONFIRMED_DAILY_KEY_PREFIX,
  CONFIRMED_TOTAL_INSTALLS_KEY,
  DAILY_KEY_PREFIX,
  RAW_COMPONENT_KEY_PREFIX,
  RAW_DAILY_KEY_PREFIX,
  RAW_TIMELINE_KEY_PREFIX,
  RAW_TOTAL_INSTALLS_KEY,
  TIMELINE_KEY_PREFIX,
  TOTAL_INSTALLS_KEY,
  UNIQUE_DAILY_KEY_PREFIX,
} from "@/lib/install-tracking/constants";
import { getInMemoryStore, getRedisClient } from "@/lib/install-tracking/storage";
import { DEFAULT_SUMMARY_DAYS, getRecentDates, key, toInstallSummaryDays, toNumber } from "@/lib/install-tracking/utils";

async function getManyValues(
  redis: Redis,
  keys: string[],
): Promise<Array<number | string | null>> {
  if (keys.length === 0) return [];
  const pipeline = redis.multi();
  for (const keyName of keys) {
    pipeline.get(keyName);
  }
  const values = await pipeline.exec();
  return (values ?? []).map(
    (value: unknown) => value as number | string | null,
  );
}

async function getManySetSizes(
  redis: Redis,
  keys: string[],
): Promise<Array<number | string | null>> {
  if (keys.length === 0) return [];
  const pipeline = redis.multi();
  for (const keyName of keys) {
    pipeline.scard(keyName);
  }
  const values = await pipeline.exec();
  return (values ?? []).map(
    (value: unknown) => value as number | string | null,
  );
}

export async function getInstallSummary(
  days = DEFAULT_SUMMARY_DAYS,
): Promise<InstallSummary> {
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

  const componentTotalKeys = componentNames.map((name) =>
    key(COMPONENT_KEY_PREFIX, name),
  );
  const componentRawKeys = componentNames.map((name) =>
    key(RAW_COMPONENT_KEY_PREFIX, name),
  );
  const componentConfirmedKeys = componentNames.map((name) =>
    key(CONFIRMED_COMPONENT_KEY_PREFIX, name),
  );
  const dailyInstallKeys = dates.map((date) => key(DAILY_KEY_PREFIX, date));
  const dailyRawKeys = dates.map((date) => key(RAW_DAILY_KEY_PREFIX, date));
  const dailyConfirmedKeys = dates.map((date) =>
    key(CONFIRMED_DAILY_KEY_PREFIX, date),
  );
  const dailyUniqueKeys = dates.map((date) => key(UNIQUE_DAILY_KEY_PREFIX, date));

  const [
    componentTotalsRaw,
    componentRawTotalsRaw,
    componentConfirmedTotalsRaw,
    dailyInstallsRaw,
    dailyRawInstallsRaw,
    dailyConfirmedRaw,
    dailyUniqueRaw,
  ] = await Promise.all([
    getManyValues(redis, componentTotalKeys),
    getManyValues(redis, componentRawKeys),
    getManyValues(redis, componentConfirmedKeys),
    getManyValues(redis, dailyInstallKeys),
    getManyValues(redis, dailyRawKeys),
    getManyValues(redis, dailyConfirmedKeys),
    getManySetSizes(redis, dailyUniqueKeys),
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
    .map((item: unknown) => {
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
    .filter(
      (item: InstallTimelineEvent | null): item is InstallTimelineEvent =>
        item !== null,
    )
    .reverse();
}
