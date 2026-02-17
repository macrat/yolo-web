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

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-mark-test-"));
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function createMemoFile(roleSlug: string, state: string, id: string): string {
  const dir = path.join(tmpDir, roleSlug, state);
  fs.mkdirSync(dir, { recursive: true });
  const content = `---
id: "${id}"
subject: "Test memo"
from: "planner"
to: "${roleSlug}"
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
    const oldPath = createMemoFile("builder", "inbox", "id1");

    markMemo("id1", "active");

    expect(fs.existsSync(oldPath)).toBe(false);
    const newPath = path.join(tmpDir, "builder", "active", "id1-test-memo.md");
    expect(fs.existsSync(newPath)).toBe(true);

    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id1: inbox -> active");
  });

  test("moves memo from inbox to archive", () => {
    createMemoFile("planner", "inbox", "id2");

    markMemo("id2", "archive");

    const newPath = path.join(tmpDir, "planner", "archive", "id2-test-memo.md");
    expect(fs.existsSync(newPath)).toBe(true);

    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id2: inbox -> archive");
  });

  test("moves memo from active to inbox", () => {
    createMemoFile("builder", "active", "id3");

    markMemo("id3", "inbox");

    const newPath = path.join(tmpDir, "builder", "inbox", "id3-test-memo.md");
    expect(fs.existsSync(newPath)).toBe(true);

    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id3: active -> inbox");
  });

  test("same state does nothing and prints status", () => {
    const filePath = createMemoFile("builder", "inbox", "id4");

    markMemo("id4", "inbox");

    // File should still be in same place
    expect(fs.existsSync(filePath)).toBe(true);

    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id4: inbox -> inbox");
  });

  test("throws error for non-existent ID", () => {
    expect(() => markMemo("nonexistent", "active")).toThrow(
      "No memo found with ID: nonexistent",
    );
  });

  test("throws error for invalid state", () => {
    createMemoFile("builder", "inbox", "id5");

    expect(() => markMemo("id5", "invalid" as never)).toThrow(
      'Invalid state: "invalid"',
    );
  });

  test("creates destination directory if it does not exist", () => {
    // Create memo in inbox, but archive dir doesn't exist
    createMemoFile("builder", "inbox", "id6");

    // Ensure archive dir doesn't exist
    const archiveDir = path.join(tmpDir, "builder", "archive");
    expect(fs.existsSync(archiveDir)).toBe(false);

    markMemo("id6", "archive");

    // Should have created the directory and moved the file
    const newPath = path.join(archiveDir, "id6-test-memo.md");
    expect(fs.existsSync(newPath)).toBe(true);
  });
});
