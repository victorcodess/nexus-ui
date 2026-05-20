import { Redis } from "@upstash/redis";
import type { InMemoryInstallStore } from "@/lib/install-tracking/types";

declare global {
  var __nexusInMemoryInstallStore: InMemoryInstallStore | undefined;
}

let redisClient: Redis | null = null;

function isTrackingEnabled(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function getRedisClient(): Redis | null {
  if (!isTrackingEnabled()) return null;
  if (redisClient) return redisClient;

  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return redisClient;
}

export function getInMemoryStore(): InMemoryInstallStore | null {
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

export function getInstallDashboardKey(): string | null {
  return process.env.INSTALL_ANALYTICS_DASHBOARD_KEY ?? null;
}
