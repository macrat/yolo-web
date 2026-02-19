import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { findMemoById, readMemo, readMemos } from "../commands/read.js";

let tmpDir: string;

// Mock getMemoRoot to point to our temp directory
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

const SAMPLE_MEMO_2 = `---
id: "def456"
subject: "Second memo"
from: "builder"
to: "planner"
created_at: "2026-02-14T19:33:00+09:00"
tags:
  - report
reply_to: "abc123"
---

## Second body

More text here.
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
    const result = findMemoById("abc123");
    expect(result).toBeNull();
  });
});

describe("readMemo", () => {
  test("reads a memo by ID and outputs raw content", () => {
    createMemoFile("builder", "inbox", "abc123", "test-memo", SAMPLE_MEMO);

    const writeSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    readMemo("abc123");

    const output = writeSpy.mock.calls.map((c) => String(c[0])).join("");
    // Should output raw file content
    expect(output).toContain('id: "abc123"');
    expect(output).toContain('subject: "Test memo"');
    expect(output).toContain("## Body content");
    expect(output).toContain("Some text here.");
    // Should NOT have formatted header
    expect(output).not.toContain("ID:       abc123");
  });

  test("throws error for non-existent ID", () => {
    expect(() => readMemo("nonexistent")).toThrow(
      "No memo found with ID: nonexistent",
    );
  });
});

describe("readMemos", () => {
  test("reads multiple memos separated by blank line", () => {
    createMemoFile("builder", "inbox", "abc123", "test-memo", SAMPLE_MEMO);
    createMemoFile("planner", "inbox", "def456", "second-memo", SAMPLE_MEMO_2);

    const writeSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    readMemos(["abc123", "def456"]);

    const output = writeSpy.mock.calls.map((c) => String(c[0])).join("");
    expect(output).toContain('id: "abc123"');
    expect(output).toContain('id: "def456"');
    expect(output).toContain("## Body content");
    expect(output).toContain("## Second body");
  });

  test("reads a single memo without extra blank line", () => {
    createMemoFile("builder", "inbox", "abc123", "test-memo", SAMPLE_MEMO);

    const writeSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);

    readMemos(["abc123"]);

    const output = writeSpy.mock.calls.map((c) => String(c[0])).join("");
    expect(output).toContain('id: "abc123"');
    // Should not start with a blank line
    expect(output.startsWith("\n")).toBe(false);
  });

  test("throws error if any ID is not found", () => {
    createMemoFile("builder", "inbox", "abc123", "test-memo", SAMPLE_MEMO);

    vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    expect(() => readMemos(["abc123", "nonexistent"])).toThrow(
      "No memo found with ID: nonexistent",
    );
  });
});
