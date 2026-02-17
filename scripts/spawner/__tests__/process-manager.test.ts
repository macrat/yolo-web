import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createProcessManager } from "../process-manager.js";
import type { Logger } from "../logger.js";

function createMockLogger(): Logger & { lines: string[] } {
  const lines: string[] = [];
  return {
    lines,
    log(message: string): void {
      lines.push(message);
    },
    agent(agent: string, message: string): void {
      lines.push(`[${agent}] ${message}`);
    },
    memo(from: string, to: string, subject: string): void {
      lines.push(`[${from}] -> [${to}] ${subject}`);
    },
    close(): void {},
  };
}

describe("process-manager", () => {
  const originalCwd = process.cwd();
  let tmpDir: string;
  let logsDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync("/tmp/spawner-pm-test-");
    logsDir = path.join(tmpDir, "agents", "logs");
    const promptDir = path.join(tmpDir, "agents", "prompt");
    fs.mkdirSync(promptDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });

    // Create minimal prompt files
    for (const role of [
      "project-manager",
      "builder",
      "reviewer",
      "researcher",
      "planner",
      "process-engineer",
    ]) {
      fs.writeFileSync(
        path.join(promptDir, `${role}.md`),
        `# ${role}\n\nYou are ${role}.\n\nCheck: $INPUT_MEMO_FILES\n`,
      );
    }

    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("spawns a process with SPAWNER_SPAWN_CMD=echo", async () => {
    const logger = createMockLogger();
    const allStopped = vi.fn();

    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "echo",
      onAllStopped: allStopped,
    });

    const result = pm.spawnAgent("builder", "memo/builder/inbox/test.md");
    expect(result).toBe(true);
    expect(pm.runningCount()).toBe(1);

    // Wait for echo to finish
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(pm.runningCount()).toBe(0);
    expect(logger.lines.some((l) => l.includes("[builder] start"))).toBe(true);
    expect(logger.lines.some((l) => l.includes("[builder] end"))).toBe(true);
    expect(allStopped).toHaveBeenCalled();
  });

  it("prevents more than 1 concurrent project-manager", () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "node -e setTimeout(()=>{},60000)",
    });

    const result1 = pm.spawnAgent("project-manager", null);
    expect(result1).toBe(true);
    expect(pm.isPmRunning()).toBe(true);

    const result2 = pm.spawnAgent("project-manager", null);
    expect(result2).toBe(false);

    pm.killAll();
  });

  it("respects max concurrent limit and queues excess", async () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "node -e setTimeout(()=>{},60000)",
      maxConcurrent: 2,
    });

    // Spawn 2 (at limit)
    pm.spawnAgent("builder", "memo1.md");
    pm.spawnAgent("reviewer", "memo2.md");
    expect(pm.runningCount()).toBe(2);

    // Third should be queued
    pm.spawnAgent("researcher", "memo3.md");
    expect(pm.runningCount()).toBe(2);
    expect(pm.getQueue()).toHaveLength(1);
    expect(pm.getQueue()[0].role).toBe("researcher");

    pm.killAll();
  });

  it("dequeues and spawns when a process exits (NOTE-3)", async () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "echo",
      maxConcurrent: 1,
    });

    // First process - will finish quickly (echo)
    pm.spawnAgent("builder", "memo1.md");
    expect(pm.runningCount()).toBe(1);

    // Queue second
    pm.spawnAgent("reviewer", "memo2.md");
    expect(pm.getQueue()).toHaveLength(1);

    // Wait for first to finish, which should dequeue the second
    await new Promise((resolve) => setTimeout(resolve, 500));

    // The reviewer should have been dequeued and finished too (echo is fast)
    expect(pm.getQueue()).toHaveLength(0);
    expect(logger.lines.some((l) => l.includes("[reviewer] start"))).toBe(true);
  });

  it("maintains FIFO order in queue (NOTE-3)", async () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "echo",
      maxConcurrent: 1,
    });

    // Fill the slot
    pm.spawnAgent("builder", "memo1.md");

    // Queue in order: reviewer, planner, researcher
    pm.spawnAgent("reviewer", "memo2.md");
    pm.spawnAgent("planner", "memo3.md");
    pm.spawnAgent("researcher", "memo4.md");

    const q = pm.getQueue();
    expect(q).toHaveLength(3);
    expect(q[0].role).toBe("reviewer");
    expect(q[1].role).toBe("planner");
    expect(q[2].role).toBe("researcher");

    // Wait for all to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check start order in logs
    const startLines = logger.lines.filter((l) => l.includes("start"));
    const startOrder = startLines.map((l) => {
      const match = l.match(/\[(\S+)\] start/);
      return match ? match[1] : "";
    });
    expect(startOrder).toEqual([
      "builder",
      "reviewer",
      "planner",
      "researcher",
    ]);
  });

  it("logs exit code for abnormal exits", async () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "false", // exits with code 1
    });

    pm.spawnAgent("builder", "memo.md");

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(
      logger.lines.some(
        (l) => l.includes("[builder] end (exit=1)") && l.includes("WARNING"),
      ),
    ).toBe(true);
  });

  it("logs exit=0 without WARNING for normal exits", async () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "true", // exits with code 0
    });

    pm.spawnAgent("builder", "memo.md");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const endLine = logger.lines.find((l) =>
      l.includes("[builder] end (exit=0)"),
    );
    expect(endLine).toBeDefined();
    expect(endLine).not.toContain("WARNING");
  });

  it("killAll sends SIGKILL to all processes", async () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "node -e setTimeout(()=>{},60000)",
    });

    pm.spawnAgent("builder", "memo1.md");
    pm.spawnAgent("reviewer", "memo2.md");
    expect(pm.runningCount()).toBe(2);

    pm.killAll();

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(pm.runningCount()).toBe(0);
  });

  it("sets YOLO_AGENT env var for builder role", async () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "sh -c printenv",
      onAllStopped: vi.fn(),
    });

    pm.spawnAgent("builder", "memo/builder/inbox/test.md");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const logFile = fs.readdirSync(logsDir).find((f) => f.includes("builder"));
    expect(logFile).toBeDefined();
    const logContent = fs.readFileSync(path.join(logsDir, logFile!), "utf-8");
    expect(logContent).toContain("YOLO_AGENT=builder");
  });

  it("sets YOLO_AGENT env var for project-manager role", async () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "sh -c printenv",
      onAllStopped: vi.fn(),
    });

    pm.spawnAgent("project-manager", null);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const logFile = fs
      .readdirSync(logsDir)
      .find((f) => f.includes("project-manager"));
    expect(logFile).toBeDefined();
    const logContent = fs.readFileSync(path.join(logsDir, logFile!), "utf-8");
    expect(logContent).toContain("YOLO_AGENT=project-manager");
  });

  it("parses SPAWNER_SPAWN_CMD with multiple args", async () => {
    const logger = createMockLogger();
    // Use "echo -n" to verify args parsing
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "echo -n",
    });

    const result = pm.spawnAgent("builder", "memo.md");
    expect(result).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(logger.lines.some((l) => l.includes("[builder] start"))).toBe(true);
  });
});

describe("process-manager duplicate memo dedup", () => {
  const originalCwd = process.cwd();
  let tmpDir: string;
  let logsDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync("/tmp/spawner-pm-dedup-test-");
    logsDir = path.join(tmpDir, "agents", "logs");
    const promptDir = path.join(tmpDir, "agents", "prompt");
    fs.mkdirSync(promptDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });

    for (const role of [
      "project-manager",
      "builder",
      "reviewer",
      "researcher",
      "planner",
      "process-engineer",
    ]) {
      fs.writeFileSync(
        path.join(promptDir, `${role}.md`),
        `# ${role}\n\nYou are ${role}.\n\nCheck: $INPUT_MEMO_FILES\n`,
      );
    }

    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("rejects duplicate spawnAgent call for same memoFile", () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "node -e setTimeout(()=>{},60000)",
    });

    const result1 = pm.spawnAgent("builder", "memo/builder/inbox/test.md");
    expect(result1).toBe(true);

    const result2 = pm.spawnAgent("builder", "memo/builder/inbox/test.md");
    expect(result2).toBe(false);
    expect(logger.lines.some((l) => l.includes("skip duplicate"))).toBe(true);

    pm.killAll();
  });

  it("allows spawnAgent for different memoFiles", () => {
    const logger = createMockLogger();
    const pm = createProcessManager({
      logger,
      logsDir,
      spawnCmd: "node -e setTimeout(()=>{},60000)",
    });

    const result1 = pm.spawnAgent("builder", "memo/builder/inbox/a.md");
    expect(result1).toBe(true);

    const result2 = pm.spawnAgent("builder", "memo/builder/inbox/b.md");
    expect(result2).toBe(true);

    expect(pm.runningCount()).toBe(2);
    pm.killAll();
  });
});
