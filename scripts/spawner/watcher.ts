import fs from "node:fs";
import path from "node:path";
import { MONITORED_ROLES, DEBOUNCE_MS } from "./types.js";
import type { MonitoredRole, MemoInfo } from "./types.js";

/** Parse basic frontmatter fields from a memo file */
function parseMemoInfo(filePath: string): MemoInfo | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    const yaml = match[1];
    const from = extractValue(yaml, "from");
    const to = extractValue(yaml, "to");
    const subject = extractValue(yaml, "subject");
    if (!from || !to || !subject) return null;

    return { from, to, subject, filePath };
  } catch {
    return null;
  }
}

function extractValue(yaml: string, key: string): string | null {
  const regex = new RegExp(`^${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const m = yaml.match(regex);
  if (!m) return null;
  return m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

export interface WatcherEvent {
  role: MonitoredRole;
  filePath: string;
  memoInfo: MemoInfo | null;
}

export type WatcherCallback = (event: WatcherEvent) => void;

export interface Watcher {
  /** Start watching all inbox directories */
  start(): void;
  /** Stop all watchers */
  stop(): void;
}

/**
 * Scan a single inbox directory and return all .md files.
 */
export function scanInbox(role: MonitoredRole): string[] {
  const inboxPath = path.resolve(process.cwd(), "memo", role, "inbox");
  try {
    const files = fs.readdirSync(inboxPath);
    return files
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => path.join(inboxPath, f));
  } catch {
    return [];
  }
}

/**
 * Scan all monitored inbox directories and return memo files grouped by role.
 */
export function scanAllInboxes(): Map<MonitoredRole, string[]> {
  const result = new Map<MonitoredRole, string[]>();
  for (const role of MONITORED_ROLES) {
    const files = scanInbox(role);
    if (files.length > 0) {
      result.set(role, files);
    }
  }
  return result;
}

/**
 * Count memos in a role's active directory.
 */
export function countActiveMemos(role: MonitoredRole): number {
  const activePath = path.resolve(process.cwd(), "memo", role, "active");
  try {
    const files = fs.readdirSync(activePath);
    return files.filter((f) => f.endsWith(".md")).length;
  } catch {
    return 0;
  }
}

/**
 * Parse memo info from a file path.
 */
export function getMemoInfo(filePath: string): MemoInfo | null {
  return parseMemoInfo(filePath);
}

/**
 * Create a file watcher for all monitored role inbox directories.
 * Uses fs.watch with debouncing to avoid duplicate events.
 *
 * NOTE-2: The watcher should be started BEFORE the initial inbox scan
 * to avoid a race condition where memos arrive between scan and watch start.
 */
export function createWatcher(callback: WatcherCallback): Watcher {
  const watchers: fs.FSWatcher[] = [];
  // Debounce map: filePath -> timeout
  const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();

  function handleEvent(
    role: MonitoredRole,
    _eventType: string,
    filename: string | null,
  ): void {
    if (!filename || !filename.endsWith(".md")) return;

    const filePath = path.resolve(
      process.cwd(),
      "memo",
      role,
      "inbox",
      filename,
    );

    // Debounce: ignore duplicate events within DEBOUNCE_MS
    if (debounceMap.has(filePath)) {
      clearTimeout(debounceMap.get(filePath)!);
    }

    debounceMap.set(
      filePath,
      setTimeout(() => {
        debounceMap.delete(filePath);

        // Only fire if file actually exists (filter out delete events)
        if (!fs.existsSync(filePath)) return;

        const memoInfo = parseMemoInfo(filePath);
        callback({ role, filePath, memoInfo });
      }, DEBOUNCE_MS),
    );
  }

  return {
    start(): void {
      for (const role of MONITORED_ROLES) {
        const inboxPath = path.resolve(
          process.cwd(),
          "memo",
          role,
          "inbox",
        );
        try {
          const watcher = fs.watch(inboxPath, (eventType, filename) => {
            handleEvent(role, eventType, filename);
          });
          watcher.on("error", () => {
            // Watcher error - will be handled by the spawner
          });
          watchers.push(watcher);
        } catch {
          // Directory may not exist yet, skip
        }
      }
    },

    stop(): void {
      for (const watcher of watchers) {
        watcher.close();
      }
      watchers.length = 0;
      for (const timeout of debounceMap.values()) {
        clearTimeout(timeout);
      }
      debounceMap.clear();
    },
  };
}
