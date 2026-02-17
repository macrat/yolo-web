import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Logger } from "./logger.js";
import { formatFileDatetime } from "./logger.js";
import { loadPrompt } from "./prompt-loader.js";
import type { AgentProcess, MonitoredRole, QueuedSpawn } from "./types.js";
import {
  DEFAULT_MAX_CONCURRENT,
  MAX_RETRIES,
  PM_CRASH_THRESHOLD_MS,
  RETRY_INTERVALS_MS,
} from "./types.js";

export interface ProcessManagerOptions {
  logger: Logger;
  maxConcurrent?: number;
  spawnCmd?: string; // SPAWNER_SPAWN_CMD
  logsDir: string;
  onAllStopped?: () => void;
  onEnding?: () => void;
  onPmExit?: () => void;
}

export interface ProcessManager {
  /** Spawn an agent for the given role and memo file */
  spawnAgent(role: MonitoredRole, memoFile: string | null): boolean;

  /** Get all running processes */
  getRunning(): AgentProcess[];

  /** Get the spawn queue */
  getQueue(): QueuedSpawn[];

  /** Check if PM is currently running */
  isPmRunning(): boolean;

  /** Get total running process count */
  runningCount(): number;

  /** Kill all running processes with SIGKILL */
  killAll(): void;

  /** Check if any processes are running */
  hasRunning(): boolean;
}

/**
 * Parse SPAWNER_SPAWN_CMD into command and args.
 * NOTE-1: Split by space, first=command, rest=args.
 * Default: command='claude', args=['-p', promptString].
 * The prompt string is appended to args.
 */
function parseSpawnCmd(
  spawnCmd: string | undefined,
  promptString: string,
): { command: string; args: string[] } {
  if (spawnCmd) {
    const parts = spawnCmd.split(" ").filter((p) => p.length > 0);
    const command = parts[0];
    const args = [...parts.slice(1), promptString];
    return { command, args };
  }
  return { command: "claude", args: ["-p", promptString] };
}

export function createProcessManager(
  options: ProcessManagerOptions,
): ProcessManager {
  const { logger, logsDir, onAllStopped, onEnding, onPmExit } = options;
  const maxConcurrent = options.maxConcurrent ?? DEFAULT_MAX_CONCURRENT;
  const spawnCmd = options.spawnCmd;

  const running: AgentProcess[] = [];
  const queue: QueuedSpawn[] = [];
  const processedFiles = new Set<string>();
  let pmRetryCount = 0;

  function runningCount(): number {
    return running.length;
  }

  function isPmRunning(): boolean {
    return running.some((p) => p.role === "project-manager");
  }

  function processNext(): void {
    while (queue.length > 0 && runningCount() < maxConcurrent) {
      const next = queue.shift()!;
      doSpawn(next.role, next.memoFile);
    }
  }

  function doSpawn(role: MonitoredRole, memoFile: string | null): boolean {
    // Load prompt and build command
    let promptString: string;
    try {
      promptString = loadPrompt(role, memoFile);
    } catch (err) {
      logger.agent(
        role,
        `failed to load prompt: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }

    const { command, args } = parseSpawnCmd(spawnCmd, promptString);

    // Create log file for agent output
    const agentLogFile = path.join(
      logsDir,
      `${formatFileDatetime(new Date())}_${role}.log`,
    );
    let logFd: number;
    try {
      fs.mkdirSync(logsDir, { recursive: true });
      logFd = fs.openSync(agentLogFile, "a");
    } catch {
      logger.agent(role, `failed to open log file: ${agentLogFile}`);
      return false;
    }

    let childProcess;
    try {
      childProcess = spawn(command, args, {
        shell: false,
        stdio: ["ignore", logFd, logFd],
        cwd: process.cwd(),
        env: { ...process.env, YOLO_AGENT: role },
      });
    } catch (err) {
      logger.agent(
        role,
        `failed to spawn: ${err instanceof Error ? err.message : String(err)}`,
      );
      try {
        fs.closeSync(logFd);
      } catch {
        // ignore
      }
      return false;
    }

    const agentProcess: AgentProcess = {
      role,
      memoFile,
      process: childProcess,
      startedAt: new Date(),
      retryCount: 0,
    };

    running.push(agentProcess);
    logger.agent(role, "start");

    childProcess.on("error", (err) => {
      logger.agent(role, `spawn error: ${err.message}`);
      removeProcess(agentProcess);
      try {
        fs.closeSync(logFd);
      } catch {
        // ignore
      }
      handleRetry(role, memoFile, agentProcess.retryCount);
    });

    childProcess.on("exit", (code) => {
      try {
        fs.closeSync(logFd);
      } catch {
        // ignore
      }

      const exitCode = code ?? 1;
      if (exitCode !== 0) {
        logger.agent(
          role,
          `end (exit=${exitCode}) WARNING: agent exited abnormally`,
        );
      } else {
        logger.agent(role, `end (exit=${exitCode})`);
      }

      // PM crash detection (EDGE-5)
      if (role === "project-manager") {
        const elapsed = Date.now() - agentProcess.startedAt.getTime();
        if (elapsed < PM_CRASH_THRESHOLD_MS) {
          pmRetryCount++;
          if (pmRetryCount >= MAX_RETRIES) {
            logger.log(
              "project-manager crashed too many times, entering ending mode",
            );
            removeProcess(agentProcess);
            if (onEnding) onEnding();
            return;
          }
        } else {
          pmRetryCount = 0;
        }
      }

      removeProcess(agentProcess);

      // PM exited but other agents still running: notify for inbox check
      if (role === "project-manager" && running.length > 0 && onPmExit) {
        onPmExit();
      }

      // Process queue
      processNext();

      // Notify if all stopped
      if (running.length === 0 && onAllStopped) {
        onAllStopped();
      }
    });

    return true;
  }

  function removeProcess(agentProcess: AgentProcess): void {
    const idx = running.indexOf(agentProcess);
    if (idx !== -1) {
      running.splice(idx, 1);
    }
  }

  function handleRetry(
    role: MonitoredRole,
    memoFile: string | null,
    retryCount: number,
  ): void {
    if (retryCount >= MAX_RETRIES) {
      logger.agent(role, `max retries (${MAX_RETRIES}) reached`);
      if (onEnding) onEnding();
      return;
    }

    const delay = RETRY_INTERVALS_MS[retryCount];
    logger.agent(
      role,
      `retrying in ${delay / 1000}s (attempt ${retryCount + 1}/${MAX_RETRIES})`,
    );

    setTimeout(() => {
      const success = doSpawn(role, memoFile);
      if (success) {
        // Update retry count on the new process
        const newProc = running[running.length - 1];
        if (newProc && newProc.role === role) {
          newProc.retryCount = retryCount + 1;
        }
      } else {
        handleRetry(role, memoFile, retryCount + 1);
      }
    }, delay);
  }

  return {
    spawnAgent(role: MonitoredRole, memoFile: string | null): boolean {
      // PM can only have 1 concurrent process
      if (role === "project-manager" && isPmRunning()) {
        return false;
      }

      // Non-PM: skip duplicate memo file (same file triggered multiple times)
      if (role !== "project-manager" && memoFile) {
        if (processedFiles.has(memoFile)) {
          logger.agent(role, `skip duplicate: ${path.basename(memoFile)}`);
          return false;
        }
        processedFiles.add(memoFile);
      }
      // Check concurrency limit
      if (runningCount() >= maxConcurrent) {
        queue.push({ role, memoFile });
        return true; // Queued successfully
      }

      return doSpawn(role, memoFile);
    },

    getRunning(): AgentProcess[] {
      return [...running];
    },

    getQueue(): QueuedSpawn[] {
      return [...queue];
    },

    isPmRunning,
    runningCount,

    killAll(): void {
      for (const proc of [...running]) {
        try {
          proc.process.kill("SIGKILL");
        } catch {
          // Process may already be dead
        }
      }
    },

    hasRunning(): boolean {
      return running.length > 0;
    },
  };
}
