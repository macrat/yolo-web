import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { markMemo } from "../commands/mark.js";

let tmpDir: string;

vi.mock("../core/paths.js", async () => {
  const actual =
    await vi.importActual<typeof import("../core/paths.js")>(
      "../core/paths.js",
    );
  return {
    ...actual,
    getMemoRoot: () => tmpDir,
  };
});

let savedClaudeCode: string | undefined;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-mark-test-"));
  savedClaudeCode = process.env.CLAUDECODE;
  delete process.env.CLAUDECODE;
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});

afterEach(() => {
  if (savedClaudeCode !== undefined) {
    process.env.CLAUDECODE = savedClaudeCode;
  } else {
    delete process.env.CLAUDECODE;
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function createMemoFile(
  partition: string,
  state: string,
  id: string,
  opts: { to?: string } = {},
): string {
  const { to = partition === "owner" ? "owner" : "agent" } = opts;
  const dir = path.join(tmpDir, partition, state);
  fs.mkdirSync(dir, { recursive: true });
  const content = `---
id: "${id}"
subject: "Test memo"
from: "planner"
to: "${to}"
created_at: "2026-02-13T19:33:00.000+09:00"
tags: []
reply_to: null
---

## Body
`;
  const filePath = path.join(dir, `${id}-test-memo.md`);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("markMemo", () => {
  test("moves memo from inbox to active", () => {
    const oldPath = createMemoFile("agent", "inbox", "id1");

    markMemo("id1", "active");

    expect(fs.existsSync(oldPath)).toBe(false);
    const newPath = path.join(tmpDir, "agent", "active", "id1-test-memo.md");
    expect(fs.existsSync(newPath)).toBe(true);

    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id1: inbox -> active");

    const writeSpy = vi.mocked(process.stdout.write);
    const output = writeSpy.mock.calls.map((c) => c[0]).join("");
    expect(output).toContain('id: "id1"');
    expect(output).toContain("## Body");
  });

  test("moves memo from inbox to archive", () => {
    createMemoFile("agent", "inbox", "id2");

    markMemo("id2", "archive");

    const newPath = path.join(tmpDir, "agent", "archive", "id2-test-memo.md");
    expect(fs.existsSync(newPath)).toBe(true);

    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id2: inbox -> archive");

    const writeSpy = vi.mocked(process.stdout.write);
    const output = writeSpy.mock.calls.map((c) => c[0]).join("");
    expect(output).toContain('id: "id2"');
    expect(output).toContain("## Body");
  });

  test("moves memo from active to inbox", () => {
    createMemoFile("agent", "active", "id3");

    markMemo("id3", "inbox");

    const newPath = path.join(tmpDir, "agent", "inbox", "id3-test-memo.md");
    expect(fs.existsSync(newPath)).toBe(true);

    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id3: active -> inbox");

    const writeSpy = vi.mocked(process.stdout.write);
    const output = writeSpy.mock.calls.map((c) => c[0]).join("");
    expect(output).toContain('id: "id3"');
    expect(output).toContain("## Body");
  });

  test("same state does nothing and prints status", () => {
    const filePath = createMemoFile("agent", "inbox", "id4");

    markMemo("id4", "inbox");

    // File should still be in same place
    expect(fs.existsSync(filePath)).toBe(true);

    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id4: inbox -> inbox");

    const writeSpy = vi.mocked(process.stdout.write);
    const output = writeSpy.mock.calls.map((c) => c[0]).join("");
    expect(output).toContain('id: "id4"');
    expect(output).toContain("## Body");
  });

  test("throws error for non-existent ID", () => {
    expect(() => markMemo("nonexistent", "active")).toThrow(
      "No memo found with ID: nonexistent",
    );
  });

  test("throws error for invalid state", () => {
    createMemoFile("agent", "inbox", "id5");

    expect(() => markMemo("id5", "invalid" as never)).toThrow(
      'Invalid state: "invalid"',
    );
  });

  test("creates destination directory if it does not exist", () => {
    // Create memo in inbox, but archive dir doesn't exist
    createMemoFile("agent", "inbox", "id6");

    // Ensure archive dir doesn't exist
    const archiveDir = path.join(tmpDir, "agent", "archive");
    expect(fs.existsSync(archiveDir)).toBe(false);

    markMemo("id6", "archive");

    // Should have created the directory and moved the file
    const newPath = path.join(archiveDir, "id6-test-memo.md");
    expect(fs.existsSync(newPath)).toBe(true);

    const writeSpy = vi.mocked(process.stdout.write);
    const output = writeSpy.mock.calls.map((c) => c[0]).join("");
    expect(output).toContain('id: "id6"');
    expect(output).toContain("## Body");
  });

  describe("agent mode (CLAUDECODE set)", () => {
    beforeEach(() => {
      process.env.CLAUDECODE = "1";
    });

    test("allows marking memos in agent directory", () => {
      createMemoFile("agent", "inbox", "id-agent1");

      markMemo("id-agent1", "active");

      const newPath = path.join(
        tmpDir,
        "agent",
        "active",
        "id-agent1-test-memo.md",
      );
      expect(fs.existsSync(newPath)).toBe(true);

      const writeSpy = vi.mocked(process.stdout.write);
      const output = writeSpy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain('id: "id-agent1"');
      expect(output).toContain("## Body");
    });

    test("prohibits marking memos in owner directory", () => {
      createMemoFile("owner", "inbox", "id-owner1");

      expect(() => markMemo("id-owner1", "active")).toThrow(
        "It is prohibited to operate memos in owner's directory.",
      );
    });

    test("prohibition applies even for same-state mark", () => {
      createMemoFile("owner", "inbox", "id-owner2");

      expect(() => markMemo("id-owner2", "inbox")).toThrow(
        "It is prohibited to operate memos in owner's directory.",
      );
    });
  });

  describe("owner mode (CLAUDECODE not set)", () => {
    test("allows marking memos in agent directory", () => {
      createMemoFile("agent", "inbox", "id-own1");

      markMemo("id-own1", "active");

      const newPath = path.join(
        tmpDir,
        "agent",
        "active",
        "id-own1-test-memo.md",
      );
      expect(fs.existsSync(newPath)).toBe(true);

      const writeSpy = vi.mocked(process.stdout.write);
      const output = writeSpy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain('id: "id-own1"');
      expect(output).toContain("## Body");
    });

    test("allows marking memos in owner directory", () => {
      createMemoFile("owner", "inbox", "id-own2");

      markMemo("id-own2", "active");

      const newPath = path.join(
        tmpDir,
        "owner",
        "active",
        "id-own2-test-memo.md",
      );
      expect(fs.existsSync(newPath)).toBe(true);

      const writeSpy = vi.mocked(process.stdout.write);
      const output = writeSpy.mock.calls.map((c) => c[0]).join("");
      expect(output).toContain('id: "id-own2"');
      expect(output).toContain("## Body");
    });
  });
});
