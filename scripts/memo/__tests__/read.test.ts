import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { findMemoById, readMemo } from "../commands/read.js";

let tmpDir: string;

// Mock getMemoRoot to point to our temp directory
vi.mock("../core/paths.js", async () => {
  const actual = await vi.importActual<typeof import("../core/paths.js")>(
    "../core/paths.js",
  );
  return {
    ...actual,
    getMemoRoot: () => tmpDir,
  };
});

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-read-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

const SAMPLE_MEMO = `---
id: "abc123"
subject: "Test memo"
from: "planner"
to: "builder"
created_at: "2026-02-13T19:33:00+09:00"
tags:
  - planning
  - test
reply_to: null
---

## Body content

Some text here.
`;

function createMemoFile(
  roleSlug: string,
  lifecycle: string,
  id: string,
  subject: string,
  content: string,
): string {
  const dir = path.join(tmpDir, roleSlug, lifecycle);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${id}-${subject}.md`);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("findMemoById", () => {
  test("finds a memo in inbox", () => {
    createMemoFile("builder", "inbox", "abc123", "test-memo", SAMPLE_MEMO);

    const result = findMemoById("abc123");
    expect(result).not.toBeNull();
    expect(result!).toContain("abc123-test-memo.md");
    expect(result!).toContain(path.join("builder", "inbox"));
  });

  test("finds a memo in active", () => {
    createMemoFile("planner", "active", "def456", "active-memo", SAMPLE_MEMO);

    const result = findMemoById("def456");
    expect(result).not.toBeNull();
    expect(result!).toContain("def456-active-memo.md");
    expect(result!).toContain(path.join("planner", "active"));
  });

  test("finds a memo in archive", () => {
    createMemoFile(
      "reviewer",
      "archive",
      "ghi789",
      "archived-memo",
      SAMPLE_MEMO,
    );

    const result = findMemoById("ghi789");
    expect(result).not.toBeNull();
    expect(result!).toContain("ghi789-archived-memo.md");
    expect(result!).toContain(path.join("reviewer", "archive"));
  });

  test("returns null for non-existent ID", () => {
    createMemoFile("builder", "inbox", "abc123", "test-memo", SAMPLE_MEMO);

    const result = findMemoById("nonexistent");
    expect(result).toBeNull();
  });

  test("returns null when memo root does not exist", () => {
    // tmpDir exists but has no role directories
    const result = findMemoById("abc123");
    expect(result).toBeNull();
  });
});

describe("readMemo", () => {
  test("reads a memo by ID and prints to stdout", () => {
    createMemoFile("builder", "inbox", "abc123", "test-memo", SAMPLE_MEMO);

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    readMemo("abc123");

    const output = logSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("ID:       abc123");
    expect(output).toContain("Subject:  Test memo");
    expect(output).toContain("From:     planner");
    expect(output).toContain("To:       builder");
    expect(output).toContain("Tags:     planning, test");
    expect(output).toContain("Reply-To: (none)");
    expect(output).toContain("## Body content");
  });

  test("reads a memo by file path", () => {
    const filePath = createMemoFile(
      "builder",
      "inbox",
      "abc123",
      "test-memo",
      SAMPLE_MEMO,
    );

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    readMemo(filePath);

    const output = logSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("ID:       abc123");
    expect(output).toContain("Subject:  Test memo");
    expect(output).toContain(`File:     ${filePath}`);
  });

  test("throws error for non-existent ID", () => {
    expect(() => readMemo("nonexistent")).toThrow(
      "No memo found with ID: nonexistent",
    );
  });

  test("shows (none) for empty tags", () => {
    const memoContent = `---
id: "notags1"
subject: "No tags"
from: "reviewer"
to: "planner"
created_at: "2026-02-13T20:00:00+09:00"
tags: []
reply_to: "abc123"
---

## Summary
Done.
`;
    createMemoFile("planner", "inbox", "notags1", "no-tags", memoContent);

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    readMemo("notags1");

    const output = logSpy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toContain("Tags:     (none)");
    expect(output).toContain("Reply-To: abc123");
  });
});
