export const DEFAULT_SUMMARY_DAYS = 30;

export function toISODateUTC(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function key(prefix: string, suffix: string): string {
  return `${prefix}:${suffix}`;
}

export function toNumber(value: unknown): number {
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

export function getRecentDates(days: number): string[] {
  const safeDays = Math.max(1, Math.min(90, days));
  const dates: string[] = [];

  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - offset);
    dates.push(toISODateUTC(date));
  }

  return dates;
}
