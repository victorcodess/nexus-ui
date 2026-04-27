import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getInstallDashboardKey,
  getInstallSummary,
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

type DashboardSearchParams = {
  days?: string;
  key?: string;
};

function toDays(raw: string | undefined): number {
  const parsed = Number(raw ?? "30");
  if (!Number.isFinite(parsed)) return 30;
  const rounded = Math.round(parsed);
  return Math.max(1, Math.min(90, rounded));
}

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
    timeZone: "UTC",
  }).format(parsed);
}

export default async function InstallsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = await searchParams;
  const expectedKey = getInstallDashboardKey();
  if (expectedKey && params.key !== expectedKey) notFound();

  const days = toDays(params.days);
  const summary = await getInstallSummary(days);
  const components = [...summary.components].sort(
    (a, b) => b.installs - a.installs,
  );
  const daily = [...summary.daily];
  const recentWindow = daily.slice(-7);
  const previousWindow = daily.slice(-14, -7);
  const today = daily[daily.length - 1] ?? {
    date: "n/a",
    installs: 0,
    uniqueInstallers: 0,
  };
  const topComponent = components[0] ?? { name: "n/a", installs: 0 };
  const uniqueRate = percent(today.uniqueInstallers, today.installs);
  const installsLast7 = sum(recentWindow.map((item) => item.installs));
  const installsPrev7 = sum(previousWindow.map((item) => item.installs));
  const trendPercent =
    installsPrev7 <= 0
      ? installsLast7 > 0
        ? 100
        : 0
      : ((installsLast7 - installsPrev7) / installsPrev7) * 100;
  const avgInstallsPerDay = averagePerDay(summary.totalInstalls, daily.length);
  const top5Share = percent(
    sum(components.slice(0, 5).map((item) => item.installs)),
    Math.max(summary.totalInstalls, 1),
  );
  const peakDay = daily.reduce(
    (best, current) => (current.installs > best.installs ? current : best),
    today,
  );
  const maxComponentInstalls = Math.max(
    1,
    ...components.map((item) => item.installs),
  );
  const maxDailyInstalls = Math.max(1, ...daily.map((item) => item.installs));
  const ranges = [7, 14, 30, 60, 90].filter((range) => range <= 90);
  const makeRangeHref = (range: number): string => {
    const search = new URLSearchParams();
    search.set("days", String(range));
    if (params.key) search.set("key", params.key);
    return `/internal/installs?${search.toString()}`;
  };
  const refreshHref = makeRangeHref(days);

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
          <div className="flex items-center gap-2">
            <span className="rounded-full border bg-muted px-2 py-1">
              Source: {summary.storage}
            </span>
            <span className="rounded-full border bg-muted px-2 py-1">
              Window: {days} days
            </span>
            <span className="rounded-full border bg-muted px-2 py-1">
              Dedupe-aware installs
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
            Total installs
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {summary.totalInstalls.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Avg {avgInstallsPerDay.toFixed(1)} installs/day
          </p>
        </article>
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Installs today
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {today.installs.toLocaleString()}
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
            {topComponent.installs.toLocaleString()} installs
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
            Ranked by total deduped installs with share of total.
          </p>

          {components.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No component installs yet.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {components.map((item, index) => {
                const share = percent(
                  item.installs,
                  Math.max(summary.totalInstalls, 1),
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
                        {item.installs.toLocaleString()} ({formatPercent(share)}
                        )
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: toPercent(item.installs, maxComponentInstalls),
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
                {peakDay.installs.toLocaleString()} installs)
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

      <section className="rounded-xl border bg-card p-4 md:p-6">
        <h2 className="text-base font-semibold">Daily trend</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each row shows installs, uniques, and daily unique rate.
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
                Math.max(day.installs, 1),
              );
              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">
                      {formatDateLabel(day.date)}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {day.installs.toLocaleString()} installs |{" "}
                      {day.uniqueInstallers.toLocaleString()} unique |{" "}
                      {formatPercent(dayUniqueRate)} unique rate
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/80"
                        style={{
                          width: toPercent(day.installs, maxDailyInstalls),
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
