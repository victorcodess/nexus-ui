export type SummaryDay = {
  date: string;
  installs: number;
  uniqueInstallers: number;
};

export type SummaryComponent = {
  name: string;
  installs: number;
};

export type SummaryMetrics = {
  rawRequests: number;
  dedupedIntents: number;
  confirmedInstalls: number;
};

export type SummaryComponentMetrics = {
  name: string;
  rawRequests: number;
  dedupedIntents: number;
  confirmedInstalls: number;
};

export type SummaryDailyMetrics = {
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

export type InMemoryInstallSession = {
  requiredFiles: number;
  fetchedFiles: Set<string>;
  confirmed: boolean;
  expiresAt: number;
};

export type InMemoryInstallStore = {
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
