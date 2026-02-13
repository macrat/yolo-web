import { expect, test, describe, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { parseMemoFile } from "../core/parser.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-parser-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeTmpMemo(filename: string, content: string): string {
  const filePath = path.join(tmpDir, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("parseMemoFile", () => {
  test("parses a valid memo with block-style tags", () => {
    const content = `---
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
    const filePath = writeTmpMemo("test.md", content);
    const memo = parseMemoFile(filePath);

    expect(memo.frontmatter.id).toBe("abc123");
    expect(memo.frontmatter.subject).toBe("Test memo");
    expect(memo.frontmatter.from).toBe("planner");
    expect(memo.frontmatter.to).toBe("builder");
    expect(memo.frontmatter.created_at).toBe("2026-02-13T19:33:00+09:00");
    expect(memo.frontmatter.tags).toEqual(["planning", "test"]);
    expect(memo.frontmatter.reply_to).toBeNull();
    expect(memo.body).toContain("## Body content");
  });

  test("parses a valid memo with inline empty tags", () => {
    const content = `---
id: "def456"
subject: "No tags memo"
from: "reviewer"
to: "planner"
created_at: "2026-02-13T20:00:00+09:00"
tags: []
reply_to: "abc123"
---

## Summary
Done.
`;
    const filePath = writeTmpMemo("test2.md", content);
    const memo = parseMemoFile(filePath);

    expect(memo.frontmatter.tags).toEqual([]);
    expect(memo.frontmatter.reply_to).toBe("abc123");
  });

  test("parses memo with CRLF line endings", () => {
    const content =
      "---\r\n" +
      'id: "crlf1"\r\n' +
      'subject: "CRLF test"\r\n' +
      'from: "owner"\r\n' +
      'to: "planner"\r\n' +
      'created_at: "2026-02-13T20:00:00+09:00"\r\n' +
      "tags: []\r\n" +
      "reply_to: null\r\n" +
      "---\r\n" +
      "\r\n" +
      "## Body\r\n";
    const filePath = writeTmpMemo("crlf.md", content);
    const memo = parseMemoFile(filePath);

    expect(memo.frontmatter.id).toBe("crlf1");
    expect(memo.frontmatter.subject).toBe("CRLF test");
    expect(memo.frontmatter.reply_to).toBeNull();
  });

  test("throws on file without frontmatter", () => {
    const content = "# Just a markdown file\n\nNo frontmatter here.\n";
    const filePath = writeTmpMemo("bad.md", content);

    expect(() => parseMemoFile(filePath)).toThrow("missing frontmatter");
  });

  test("throws on missing required field", () => {
    const content = `---
id: "missing1"
subject: "Missing from"
created_at: "2026-02-13T20:00:00+09:00"
tags: []
reply_to: null
---

## Body
`;
    const filePath = writeTmpMemo("missing.md", content);

    expect(() => parseMemoFile(filePath)).toThrow(
      "Missing required field: from",
    );
  });

  test("parses inline tags with values", () => {
    const content = `---
id: "inline1"
subject: "Inline tags"
from: "planner"
to: "builder"
created_at: "2026-02-13T20:00:00+09:00"
tags: ["tag1", "tag2", "tag3"]
reply_to: null
---

## Body
`;
    const filePath = writeTmpMemo("inline-tags.md", content);
    const memo = parseMemoFile(filePath);

    expect(memo.frontmatter.tags).toEqual(["tag1", "tag2", "tag3"]);
  });
});
