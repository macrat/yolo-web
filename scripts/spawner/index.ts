import path from "node:path";
import { createLogger } from "./logger.js";
import type { Logger } from "./logger.js";
import { createProcessManager } from "./process-manager.js";
import type { ProcessManager } from "./process-manager.js";
import {
  createWatcher,
  scanAllInboxes,
  scanInbox,
  countActiveMemos,
  getMemoInfo,
} from "./watcher.js";
import type { Watcher, WatcherEvent } from "./watcher.js";
import { MONITORED_ROLES } from "./types.js";
import type { MonitoredRole, SpawnerState } from "./types.js";

export interface SpawnerOptions {
  /** Override SPAWNER_SPAWN_CMD */
  spawnCmd?: string;
  /** Override SPAWNER_MAX_CONCURRENT */
  maxConcurrent?: number;
}

export interface Spawner {
  /** Start the spawner (initial scan + watch loop) */
  start(): void;
  /** Enter ending mode: stop spawning, wait for running to finish */
  enterEndingMode(): void;
  /** Force kill all processes and exit immediately */
  forceKill(): void;
  /** Get the current state */
  getState(): SpawnerState;
  /** Get the process manager (for testing) */
  getProcessManager(): ProcessManager;
  /** Get the logger */
  getLogger(): Logger;
}

export function createSpawner(options: SpawnerOptions = {}): Spawner {
  const logsDir = path.resolve(process.cwd(), "agents", "logs");
  const startTime = new Date();
  const logger = createLogger(logsDir, startTime);

  let state: SpawnerState = "RUNNING";
  let watcher: Watcher | null = null;

  const processManager: ProcessManager = createProcessManager({
    logger,
    logsDir,
    spawnCmd: options.spawnCmd,
    maxConcurrent: options.maxConcurrent,
    onAllStopped: handleAllStopped,
    onEnding: () => {
      enterEndingMode();
    },
    onPmExit: handlePmExit,
  });

  function handleWatcherEvent(event: WatcherEvent): void {
    if (state !== "RUNNING") return;

    // Log memo detection
    if (event.memoInfo) {
      logger.memo(
        event.memoInfo.from,
        event.memoInfo.to,
        event.memoInfo.subject,
      );
    }

    // Spawn the appropriate agent (NOTE-2: PM gets null, not filePath)
    processManager.spawnAgent(
      event.role,
      event.role === "project-manager" ? null : event.filePath,
    );
  }

  function handleAllStopped(): void {
    if (state === "ENDING") {
      logger.log("end");
      logger.close();
      process.exit(0);
      return;
    }

    // All agents stopped while RUNNING: start PM
    if (state === "RUNNING") {
      // Check if PM inbox has memos first (NOTE-3: cache getMemoInfo)
      const pmMemos = scanInbox("project-manager");
      if (pmMemos.length > 0) {
        const info = getMemoInfo(pmMemos[0]);
        logger.memo(
          info?.from ?? "unknown",
          "project-manager",
          info?.subject ?? "(memo detected)",
        );
      }
      processManager.spawnAgent("project-manager", null);
    }
  }

  // NOTE-1: PM exited while other agents still running — check inbox and restart
  function handlePmExit(): void {
    if (state !== "RUNNING") return;
    const pmMemos = scanInbox("project-manager");
    if (pmMemos.length > 0) {
      const info = getMemoInfo(pmMemos[0]);
      logger.memo(
        info?.from ?? "unknown",
        "project-manager",
        info?.subject ?? "(pm restart: inbox memo detected)",
      );
      processManager.spawnAgent("project-manager", null);
    }
  }

  function enterEndingMode(): void {
    if (state === "ENDING") return;
    state = "ENDING";
    logger.log("ending...");

    // Stop watching for new memos
    if (watcher) {
      watcher.stop();
      watcher = null;
    }

    // If nothing is running, exit immediately
    if (!processManager.hasRunning()) {
      logger.log("end");
      logger.close();
      process.exit(0);
    }
  }

  function forceKill(): void {
    logger.log("force kill");
    processManager.killAll();
    logger.log("end");
    logger.close();
    process.exit(1);
  }

  function start(): void {
    logger.log("start");

    // EDGE-4: Check for active memos and warn
    for (const role of MONITORED_ROLES) {
      const activeCount = countActiveMemos(role);
      if (activeCount > 0) {
        logger.log(`WARNING: ${role} has ${activeCount} memo(s) in active/`);
      }
    }

    // NOTE-2: Start watcher BEFORE initial inbox scan
    watcher = createWatcher(handleWatcherEvent);
    watcher.start();

    // Initial inbox scan
    const inboxes = scanAllInboxes();
    let anyAgentStarted = false;

    for (const [role, files] of inboxes) {
      if (role === "project-manager") {
        // PM gets started once regardless of memo count
        const firstMemo = files[0];
        const info = getMemoInfo(firstMemo);
        if (info) {
          logger.memo(info.from, info.to, info.subject);
        }
        processManager.spawnAgent("project-manager", null);
        anyAgentStarted = true;
      } else {
        // Other roles: one agent per memo (FIFO by filename)
        for (const file of files) {
          const info = getMemoInfo(file);
          if (info) {
            logger.memo(info.from, info.to, info.subject);
          }
          processManager.spawnAgent(role as MonitoredRole, file);
          anyAgentStarted = true;
        }
      }
    }

    // If no memos found, start PM
    if (!anyAgentStarted) {
      processManager.spawnAgent("project-manager", null);
    }
  }

  return {
    start,
    enterEndingMode,
    forceKill,
    getState: () => state,
    getProcessManager: () => processManager,
    getLogger: () => logger,
  };
}
