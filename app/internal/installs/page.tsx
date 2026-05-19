import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DEFAULT_SUMMARY_DAYS,
  getInstallDashboardKey,
  getInstallSummary,
  type InstallTimelineMetric,
  getInstallTimeline,
  toInstallSummaryDays,
} from "@/lib/install-tracking";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Install Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

const DASHBOARD_TIME_ZONE = "Africa/Lagos";
const DASHBOARD_TIME_ZONE_LABEL = "WAT";

type DashboardSearchParams = {
  days?: string;
  key?: string;
  date?: string;
  timeline?: string;
};

function toPercent(value: number, max: number): string {
  if (max <= 0) return "0%";
  return `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
}

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

function averagePerDay(total: number, days: number): number {
  if (days <= 0) return 0;
  return total / days;
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDateLabel(isoDate: string): string {
  if (!isoDate || isoDate === "n/a") return isoDate;
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: DASHBOARD_TIME_ZONE,
  }).format(parsed);
}

function formatTimeLabel(timestamp: number): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "Invalid time";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: DASHBOARD_TIME_ZONE,
  }).format(parsed);
}

function isIsoDate(value: string | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toTimelineMetric(raw: string | undefined): InstallTimelineMetric {
  return raw === "raw" ? "raw" : "confirmed";
}

export default async function InstallsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = await searchParams;
  const expectedKey = getInstallDashboardKey();
  if (expectedKey && params.key !== expectedKey) notFound();

  const days = toInstallSummaryDays(params.days);
  const timelineMetric = toTimelineMetric(params.timeline);
  const summary = await getInstallSummary(days);
  const components = [...summary.componentMetrics].sort(
    (a, b) => b.confirmedInstalls - a.confirmedInstalls,
  );
  const daily = [...summary.dailyMetrics];
  const recentWindow = daily.slice(-7);
  const previousWindow = daily.slice(-14, -7);
  const today = daily[daily.length - 1] ?? {
    date: "n/a",
    rawRequests: 0,
    dedupedIntents: 0,
    confirmedInstalls: 0,
    uniqueInstallers: 0,
  };
  const topComponent = components[0] ?? {
    name: "n/a",
    rawRequests: 0,
    dedupedIntents: 0,
    confirmedInstalls: 0,
  };
  const uniqueRate = percent(today.uniqueInstallers, today.confirmedInstalls);
  const installsLast7 = sum(recentWindow.map((item) => item.confirmedInstalls));
  const installsPrev7 = sum(previousWindow.map((item) => item.confirmedInstalls));
  const trendPercent =
    installsPrev7 <= 0
      ? installsLast7 > 0
        ? 100
        : 0
      : ((installsLast7 - installsPrev7) / installsPrev7) * 100;
  const avgInstallsPerDay = averagePerDay(summary.metrics.confirmedInstalls, daily.length);
  const top5Share = percent(
    sum(components.slice(0, 5).map((item) => item.confirmedInstalls)),
    Math.max(summary.metrics.confirmedInstalls, 1),
  );
  const peakDay = daily.reduce(
    (best, current) =>
      current.confirmedInstalls > best.confirmedInstalls ? current : best,
    today,
  );
  const maxComponentInstalls = Math.max(
    1,
    ...components.map((item) => item.confirmedInstalls),
  );
  const maxDailyInstalls = Math.max(
    1,
    ...daily.map((item) => item.confirmedInstalls),
  );
  const ranges = [7, 14, 30, 60, 90].filter((range) => range <= 90);
  const makeRangeHref = (range: number): string => {
    const search = new URLSearchParams();
    search.set("days", String(range));
    if (params.key) search.set("key", params.key);
    search.set("timeline", timelineMetric);
    return `/internal/installs?${search.toString()}`;
  };
  const refreshHref = makeRangeHref(days);
  const selectedDate = isIsoDate(params.date) ? params.date : null;
  const latestDayInWindow = daily[daily.length - 1]?.date ?? null;
  const selectedDayInWindow =
    selectedDate && daily.some((day) => day.date === selectedDate)
      ? selectedDate
      : latestDayInWindow;
  const hasExplicitDaySelection = Boolean(
    selectedDate && selectedDayInWindow === selectedDate,
  );
  const selectedTimeline = selectedDayInWindow
    ? await getInstallTimeline(selectedDayInWindow, timelineMetric, 300)
    : [];
  const makeDayHref = (day: string): string => {
    const search = new URLSearchParams();
    search.set("days", String(days));
    if (params.key) search.set("key", params.key);
    search.set("date", day);
    search.set("timeline", timelineMetric);
    return `/internal/installs?${search.toString()}`;
  };
  const makeTimelineHref = (metric: InstallTimelineMetric): string => {
    const search = new URLSearchParams();
    search.set("days", String(days));
    if (params.key) search.set("key", params.key);
    if (selectedDayInWindow) search.set("date", selectedDayInWindow);
    search.set("timeline", metric);
    return `/internal/installs?${search.toString()}`;
  };
  const clearDayHref = makeRangeHref(days);
  const selectedDayLabel = selectedDayInWindow
    ? formatDateLabel(selectedDayInWindow)
    : null;
  const timelineMetricLabel =
    timelineMetric === "raw" ? "Raw installs" : "Confirmed installs";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
      <header className="rounded-2xl border bg-card p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Nexus UI installs dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive telemetry for shadcn registry installs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ranges.map((range) => (
              <Button
                key={range}
                asChild
                size="sm"
                variant={days === range ? "default" : "outline"}
              >
                <Link href={makeRangeHref(range)}>{range}d</Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full border bg-muted px-2 py-1 shrink-0">
              Source: {summary.storage}
            </span>
            <span className="rounded-full border bg-muted px-2 py-1 shrink-0">
              Window: {days} days
              {days !== DEFAULT_SUMMARY_DAYS
                ? ` (default ${DEFAULT_SUMMARY_DAYS})`
                : ""}
            </span>
            <span className="rounded-full border bg-muted px-2 py-1 shrink-0">
              Timezone: {DASHBOARD_TIME_ZONE_LABEL}
            </span>
            <span className="rounded-full border bg-muted px-2 py-1 shrink-0">
              Primary metric: confirmed installs
            </span>
            <span className="rounded-full border bg-muted px-2 py-1 shrink-0">
              Day bucketing: UTC (displayed in WAT)
            </span>
          </div>

          <Button asChild size="sm" variant="outline">
            <Link href={refreshHref}>Refresh</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Confirmed installs
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {summary.metrics.confirmedInstalls.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Avg {avgInstallsPerDay.toFixed(1)} installs/day
          </p>
        </article>
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Installs today (UTC bucket, shown in WAT)
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {today.confirmedInstalls.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            7d momentum: {formatSignedPercent(trendPercent)}
          </p>
        </article>
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Unique today
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {today.uniqueInstallers.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Unique rate: {formatPercent(uniqueRate)}
          </p>
        </article>
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Top component
          </p>
          <p className="mt-2 text-base font-semibold">{topComponent.name}</p>
          <p className="text-sm text-muted-foreground">
            {topComponent.confirmedInstalls.toLocaleString()} installs
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Top 5 share: {formatPercent(top5Share)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border bg-card p-4 md:p-6 xl:col-span-2">
          <h2 className="text-base font-semibold">Component distribution</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by confirmed installs with share of total.
          </p>

          {components.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No component installs yet.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {components.map((item, index) => {
                const share = percent(
                  item.confirmedInstalls,
                  Math.max(summary.metrics.confirmedInstalls, 1),
                );
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-xs text-muted-foreground tabular-nums">
                          #{index + 1}
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground tabular-nums">
                        {item.confirmedInstalls.toLocaleString()} ({formatPercent(share)}
                        )
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: toPercent(item.confirmedInstalls, maxComponentInstalls),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-xl border bg-card p-4 md:p-6">
          <h2 className="text-base font-semibold">Window stats</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick diagnostics for the selected period.
          </p>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-xs text-muted-foreground uppercase">
                Peak day
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {formatDateLabel(peakDay.date)} (
                {peakDay.confirmedInstalls.toLocaleString()} installs)
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">
                Last 7 days
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {installsLast7.toLocaleString()} installs
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">
                Previous 7 days
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {installsPrev7.toLocaleString()} installs
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">
                7d change
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {formatSignedPercent(trendPercent)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">
                Components tracked
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {components.length.toLocaleString()}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border bg-card p-4 md:p-6 xl:col-span-2">
          <h2 className="text-base font-semibold">Daily trend</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Click a day to inspect a detailed install timeline.
          </p>

          {daily.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No daily data yet.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {daily.map((day) => {
                const dayUniqueRate = percent(
                  day.uniqueInstallers,
                  Math.max(day.confirmedInstalls, 1),
                );
                const isSelected = selectedDayInWindow === day.date;
                return (
                  <Link
                    key={day.date}
                    href={makeDayHref(day.date)}
                    aria-current={isSelected ? "date" : undefined}
                    className={`block rounded-xl border p-3 transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-transparent hover:border-border hover:bg-muted/40 active:bg-muted/60"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span
                        className={`font-medium ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {formatDateLabel(day.date)}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {day.confirmedInstalls.toLocaleString()} confirmed |{" "}
                        {day.dedupedIntents.toLocaleString()} intent |{" "}
                        {day.rawRequests.toLocaleString()} raw |{" "}
                        {day.uniqueInstallers.toLocaleString()} unique |{" "}
                        {formatPercent(dayUniqueRate)} unique rate
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground/80"
                          style={{
                            width: toPercent(day.confirmedInstalls, maxDailyInstalls),
                          }}
                        />
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{
                            width: toPercent(
                              day.uniqueInstallers,
                              maxDailyInstalls,
                            ),
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-xl border bg-card p-4 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Selected day timeline</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {timelineMetricLabel} by {DASHBOARD_TIME_ZONE_LABEL} timestamp.
              </p>
              {selectedDayLabel ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Active day:{" "}
                  <span className="font-medium text-foreground">{selectedDayLabel}</span>
                </p>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant={timelineMetric === "confirmed" ? "default" : "outline"}
                >
                  <Link href={makeTimelineHref("confirmed")}>Confirmed</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant={timelineMetric === "raw" ? "default" : "outline"}
                >
                  <Link href={makeTimelineHref("raw")}>Raw</Link>
                </Button>
              </div>
            </div>
            {hasExplicitDaySelection ? (
              <Button asChild size="sm" variant="outline">
                <Link href={clearDayHref}>Clear</Link>
              </Button>
            ) : null}
          </div>

          {!selectedDayInWindow ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Select a day from the trend list to reveal its timeline.
            </p>
          ) : selectedTimeline.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No {timelineMetric} install events stored for{" "}
              {formatDateLabel(selectedDayInWindow)}.
            </p>
          ) : (
            <div className="mt-6 space-y-2">
              {selectedTimeline.map((event, index) => (
                <div
                  key={`${event.timestamp}-${event.component}-${index}`}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{event.component}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatTimeLabel(event.timestamp)} {DASHBOARD_TIME_ZONE_LABEL}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
