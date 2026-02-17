import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { scanAllMemos } from "../core/scanner.js";

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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-scanner-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function createMemoFile(
  roleSlug: string,
  state: string,
  id: string,
  subject: string,
): void {
  const dir = path.join(tmpDir, roleSlug, state);
  fs.mkdirSync(dir, { recursive: true });
  const content = `---
id: "${id}"
subject: "${subject}"
from: "planner"
to: "${roleSlug}"
created_at: "2026-02-13T19:33:00.000+09:00"
tags: []
reply_to: null
---

## Body
`;
  fs.writeFileSync(path.join(dir, `${id}-test.md`), content, "utf-8");
}

describe("scanAllMemos", () => {
  test("returns empty array when memo root does not exist", () => {
    // tmpDir exists but remove it to simulate non-existent root
    fs.rmSync(tmpDir, { recursive: true, force: true });
    const memos = scanAllMemos();
    expect(memos).toEqual([]);
  });

  test("scans memos from inbox, active, and archive", () => {
    createMemoFile("builder", "inbox", "id1", "Inbox memo");
    createMemoFile("builder", "active", "id2", "Active memo");
    createMemoFile("builder", "archive", "id3", "Archive memo");

    const memos = scanAllMemos();
    expect(memos.length).toBe(3);

    const states = memos.map((m) => m.state).sort();
    expect(states).toEqual(["active", "archive", "inbox"]);
  });

  test("correctly sets state based on directory", () => {
    createMemoFile("planner", "active", "id4", "Active task");

    const memos = scanAllMemos();
    expect(memos.length).toBe(1);
    expect(memos[0].state).toBe("active");
    expect(memos[0].frontmatter.id).toBe("id4");
  });

  test("scans across multiple roles", () => {
    createMemoFile("builder", "inbox", "id5", "Builder memo");
    createMemoFile("planner", "inbox", "id6", "Planner memo");
    createMemoFile("reviewer", "archive", "id7", "Reviewer memo");

    const memos = scanAllMemos();
    expect(memos.length).toBe(3);

    const ids = memos.map((m) => m.frontmatter.id).sort();
    expect(ids).toEqual(["id5", "id6", "id7"]);
  });

  test("skips non-md files", () => {
    createMemoFile("builder", "inbox", "id8", "Real memo");
    // Create a non-md file
    const dir = path.join(tmpDir, "builder", "inbox");
    fs.writeFileSync(path.join(dir, "notes.txt"), "not a memo", "utf-8");

    const memos = scanAllMemos();
    expect(memos.length).toBe(1);
    expect(memos[0].frontmatter.id).toBe("id8");
  });

  test("skips files that fail to parse", () => {
    createMemoFile("builder", "inbox", "id9", "Good memo");
    // Create a bad memo file
    const dir = path.join(tmpDir, "builder", "inbox");
    fs.writeFileSync(path.join(dir, "bad-memo.md"), "no frontmatter", "utf-8");

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const memos = scanAllMemos();
    expect(memos.length).toBe(1);
    expect(memos[0].frontmatter.id).toBe("id9");
    expect(warnSpy).toHaveBeenCalled();
  });
});
