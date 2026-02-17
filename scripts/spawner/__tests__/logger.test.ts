import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import { createLogger, formatFileDatetime } from "../logger.js";

describe("formatFileDatetime", () => {
  it("formats a date as YYYYMMDD-HHmmss", () => {
    const date = new Date("2026-02-17T14:30:05+09:00");
    const result = formatFileDatetime(date);
    // The formatted string depends on the system timezone, but the format is fixed
    expect(result).toMatch(/^\d{8}-\d{6}$/);
  });
});

describe("createLogger", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync("/tmp/spawner-logger-test-");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writes log messages to console and file", () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockReturnValue(true as never);
    const startTime = new Date("2026-02-17T14:30:00+09:00");
    const logger = createLogger(tmpDir, startTime);

    logger.log("start");
    logger.close();

    expect(stdoutSpy).toHaveBeenCalled();
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toContain("start");
    expect(output).toMatch(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2} start\n$/,
    );

    // Check file was written
    const files = fs.readdirSync(tmpDir);
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/_spawner\.log$/);

    stdoutSpy.mockRestore();
  });

  it("formats agent messages with brackets", () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockReturnValue(true as never);
    const logger = createLogger(tmpDir, new Date());

    logger.agent("builder", "start");
    logger.close();

    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toContain("[builder] start");

    stdoutSpy.mockRestore();
  });

  it("formats memo messages with arrow notation", () => {
    const stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockReturnValue(true as never);
    const logger = createLogger(tmpDir, new Date());

    logger.memo("owner", "project-manager", "Request to create spawner");
    logger.close();

    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toContain(
      "[owner] -> [project-manager] Request to create spawner",
    );

    stdoutSpy.mockRestore();
  });

  it("falls back to stderr if log file cannot be opened", () => {
    const stderrSpy = vi
      .spyOn(process.stderr, "write")
      .mockReturnValue(true as never);
    // Use an invalid path to trigger file open failure
    const logger = createLogger("/nonexistent/path/logs", new Date());
    logger.close();

    expect(stderrSpy).toHaveBeenCalled();
    const output = stderrSpy.mock.calls[0][0] as string;
    expect(output).toContain("Failed to open log file");

    stderrSpy.mockRestore();
  });
});
