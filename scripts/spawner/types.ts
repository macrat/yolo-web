import type { ChildProcess } from "node:child_process";

/** Roles that the spawner monitors (excludes owner) */
export const MONITORED_ROLES = [
  "project-manager",
  "researcher",
  "planner",
  "builder",
  "reviewer",
  "process-engineer",
] as const;

export type MonitoredRole = (typeof MONITORED_ROLES)[number];

/** Spawner operational state */
export type SpawnerState = "RUNNING" | "ENDING";

/** A running agent process */
export interface AgentProcess {
  role: MonitoredRole;
  memoFile: string | null; // null for project-manager
  process: ChildProcess;
  startedAt: Date;
  retryCount: number;
}

/** Queued agent spawn request (for when concurrency limit is hit) */
export interface QueuedSpawn {
  role: MonitoredRole;
  memoFile: string | null;
}

/** Parsed memo info from frontmatter (lightweight, for watcher logging) */
export interface MemoInfo {
  from: string;
  to: string;
  subject: string;
  filePath: string;
}

/** Retry backoff intervals in milliseconds */
export const RETRY_INTERVALS_MS = [5000, 15000, 45000] as const;

/** Max retry count before entering ending mode */
export const MAX_RETRIES = 3;

/** PM crash detection threshold in milliseconds */
export const PM_CRASH_THRESHOLD_MS = 30000;

/** Default max concurrent processes */
export const DEFAULT_MAX_CONCURRENT = 10;

/** Debounce interval for file watcher in milliseconds */
export const DEBOUNCE_MS = 200;
