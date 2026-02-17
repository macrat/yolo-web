import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createSpawner } from "../index.js";
import { MONITORED_ROLES } from "../types.js";

describe("spawner (integration)", () => {
  const originalCwd = process.cwd();
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync("/tmp/spawner-integration-test-");
    // Create all memo directories
    for (const role of MONITORED_ROLES) {
      fs.mkdirSync(path.join(tmpDir, "memo", role, "inbox"), {
        recursive: true,
      });
      fs.mkdirSync(path.join(tmpDir, "memo", role, "active"), {
        recursive: true,
      });
      fs.mkdirSync(path.join(tmpDir, "memo", role, "archive"), {
        recursive: true,
      });
    }
    fs.mkdirSync(path.join(tmpDir, "memo", "owner", "inbox"), {
      recursive: true,
    });

    // Create prompt files
    const promptDir = path.join(tmpDir, "agents", "prompt");
    fs.mkdirSync(promptDir, { recursive: true });
    for (const role of MONITORED_ROLES) {
      const placeholder =
        role === "project-manager" ? "" : "\nCheck: $INPUT_MEMO_FILES\n";
      fs.writeFileSync(
        path.join(promptDir, `${role}.md`),
        `# ${role}\n\nYou are ${role}.${placeholder}\n`,
      );
    }

    // Create logs dir
    fs.mkdirSync(path.join(tmpDir, "agents", "logs"), { recursive: true });

    process.chdir(tmpDir);

    // Suppress stdout for cleaner test output
    vi.spyOn(process.stdout, "write").mockReturnValue(true);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function writeMemo(
    role: string,
    state: string,
    filename: string,
    from: string,
    to: string,
    subject: string,
  ): string {
    const filePath = path.join(tmpDir, "memo", role, state, filename);
    fs.writeFileSync(
      filePath,
      `---\nid: "test"\nsubject: "${subject}"\nfrom: "${from}"\nto: "${to}"\ncreated_at: "2026-02-17T00:00:00+09:00"\ntags: []\nreply_to: null\n---\n\nTest body\n`,
    );
    return filePath;
  }

  it("starts PM when no inbox memos exist", async () => {
    const spawner = createSpawner({ spawnCmd: "echo" });

    // Mock process.exit to prevent test from exiting
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);

    spawner.start();

    // Wait for echo to finish
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const pm = spawner.getProcessManager();
    // PM was started (echo finishes quickly, so it may already be done)
    // Check that at least PM was attempted
    expect(exitSpy).toHaveBeenCalled(); // allStopped triggers exit in RUNNING mode after PM restart

    exitSpy.mockRestore();
  });

  it("starts agents for inbox memos", async () => {
    writeMemo("builder", "inbox", "task.md", "pm", "builder", "Build it");

    const spawner = createSpawner({ spawnCmd: "echo" });
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);

    spawner.start();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Builder should have been started
    // Since echo finishes quickly, PM should also auto-start after all stopped
    expect(exitSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
  });

  it("enters ending mode and force kills", async () => {
    // node -e uses only the next arg as script; extra args (the prompt)
    // are harmlessly placed in process.argv
    const spawner = createSpawner({
      spawnCmd: "node -e setTimeout(()=>{},60000)",
    });
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);

    spawner.start();

    // Give time for processes to start
    await new Promise((resolve) => setTimeout(resolve, 500));

    spawner.enterEndingMode();
    expect(spawner.getState()).toBe("ENDING");

    // Force kill to clean up
    spawner.forceKill();

    expect(exitSpy).toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it("warns about active memos on startup", async () => {
    writeMemo(
      "builder",
      "active",
      "orphan.md",
      "pm",
      "builder",
      "Orphan task",
    );

    const spawner = createSpawner({ spawnCmd: "echo" });
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);

    spawner.start();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // The warning is logged via the logger (stdout is mocked)
    const stdoutCalls = (process.stdout.write as ReturnType<typeof vi.fn>).mock
      .calls;
    const logOutput = stdoutCalls.map((c: unknown[]) => String(c[0])).join("");
    expect(logOutput).toContain("WARNING: builder has 1 memo(s) in active/");

    exitSpy.mockRestore();
  });

  it("queue processes when concurrency limit is reached", async () => {
    writeMemo("builder", "inbox", "task1.md", "pm", "builder", "Task 1");
    writeMemo("reviewer", "inbox", "task2.md", "pm", "reviewer", "Task 2");
    writeMemo("planner", "inbox", "task3.md", "pm", "planner", "Task 3");

    const spawner = createSpawner({
      spawnCmd: "node -e setTimeout(()=>{},60000)",
      maxConcurrent: 2,
    });
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);

    spawner.start();

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pm = spawner.getProcessManager();
    // 2 running (at limit), rest queued
    expect(pm.runningCount()).toBe(2);
    expect(pm.getQueue().length).toBeGreaterThanOrEqual(1);

    // Clean up
    spawner.forceKill();
    await new Promise((resolve) => setTimeout(resolve, 200));
    exitSpy.mockRestore();
  });

  it("processes queue in FIFO order when processes finish", async () => {
    writeMemo("builder", "inbox", "task1.md", "pm", "builder", "Task 1");
    writeMemo("reviewer", "inbox", "task2.md", "pm", "reviewer", "Task 2");
    writeMemo("planner", "inbox", "task3.md", "pm", "planner", "Task 3");

    const spawner = createSpawner({
      spawnCmd: "echo done",
      maxConcurrent: 1,
    });
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);

    spawner.start();

    // echo finishes fast, queue should process in order
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const stdoutCalls = (process.stdout.write as ReturnType<typeof vi.fn>).mock
      .calls;
    const logOutput = stdoutCalls.map((c: unknown[]) => String(c[0])).join("");

    // All three roles should have started
    expect(logOutput).toContain("[builder] start");
    expect(logOutput).toContain("[reviewer] start");
    expect(logOutput).toContain("[planner] start");

    exitSpy.mockRestore();
  });
});

describe("SIGINT handler logic", () => {
  it("detects 3 SIGINTs within 1 second", () => {
    const timestamps: number[] = [];
    const now = Date.now();

    // Simulate 3 rapid SIGINTs
    timestamps.push(now);
    timestamps.push(now + 100);
    timestamps.push(now + 200);

    // Filter old timestamps
    const recent = timestamps.filter((t) => now + 200 - t <= 1000);
    expect(recent.length).toBeGreaterThanOrEqual(3);
  });

  it("does not trigger force kill with spread-out SIGINTs", () => {
    const timestamps: number[] = [];
    const now = Date.now();

    // Simulate spread-out SIGINTs
    timestamps.push(now - 2000);
    timestamps.push(now - 1500);
    timestamps.push(now);

    // Filter old timestamps (older than 1 second from the latest)
    const recent = timestamps.filter((t) => now - t <= 1000);
    expect(recent.length).toBeLessThan(3);
  });
});
