import { expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { formatTimestamp, serializeFrontmatter } from "../core/frontmatter.js";
import { parseMemoFile } from "../core/parser.js";
import type { MemoFrontmatter } from "../types.js";

test("formatTimestamp returns ISO-8601 with milliseconds and timezone", () => {
  const ts = formatTimestamp(
    new Date("2026-02-13T19:33:00.456+09:00").getTime(),
  );
  expect(ts).toMatch(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/,
  );
});

test("formatTimestamp preserves milliseconds", () => {
  const date = new Date("2026-02-13T19:33:00.123+09:00");
  const ts = formatTimestamp(date.getTime());
  expect(ts).toContain(".123");
});

test("formatTimestamp uses provided timestamp", () => {
  const ms = 1739780040123; // known timestamp
  const ts = formatTimestamp(ms);
  // The timestamp should produce a valid ISO string that parses back to the same ms
  const parsed = new Date(ts).getTime();
  expect(parsed).toBe(ms);
});

test("serializeFrontmatter produces valid YAML frontmatter", () => {
  const fm: MemoFrontmatter = {
    id: "abc123",
    subject: "Test memo",
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00.000+09:00",
    tags: ["planning", "test"],
    reply_to: null,
  };

  const result = serializeFrontmatter(fm);
  expect(result).toContain("---");
  expect(result).toContain('id: "abc123"');
  expect(result).toContain('subject: "Test memo"');
  expect(result).toContain("reply_to: null");
  expect(result).toContain("  - planning");
  expect(result).toContain("  - test");
  // Should not contain public field
  expect(result).not.toContain("public:");
});

test("serializeFrontmatter handles reply_to with value", () => {
  const fm: MemoFrontmatter = {
    id: "abc123",
    subject: "Re: Test memo",
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00.000+09:00",
    tags: ["reply"],
    reply_to: "original123",
  };

  const result = serializeFrontmatter(fm);
  expect(result).toContain('reply_to: "original123"');
});

test("serializeFrontmatter handles empty tags", () => {
  const fm: MemoFrontmatter = {
    id: "abc123",
    subject: "Test",
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00.000+09:00",
    tags: [],
    reply_to: null,
  };

  const result = serializeFrontmatter(fm);
  expect(result).toContain("tags: []");
});

test("escapeYamlString correctly escapes double quotes and backslashes", () => {
  const fm: MemoFrontmatter = {
    id: "esc1",
    subject: 'A memo with "quotes" and \\ backslash',
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00.000+09:00",
    tags: [],
    reply_to: null,
  };

  const result = serializeFrontmatter(fm);
  expect(result).toContain(
    'subject: "A memo with \\"quotes\\" and \\\\ backslash"',
  );
});

test("roundtrip: serialize then parse preserves subject with quotes and backslashes", () => {
  const fm: MemoFrontmatter = {
    id: "rt1",
    subject: 'A memo with "quotes" inside',
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00.000+09:00",
    tags: ["test"],
    reply_to: null,
  };

  const serialized = serializeFrontmatter(fm);
  const body = "\n## Body\n\nSome content.\n";
  const fullContent = serialized + "\n" + body;

  // Write to temp file and parse back
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-rt-test-"));
  const filePath = path.join(tmpDir, "roundtrip.md");
  fs.writeFileSync(filePath, fullContent, "utf-8");

  try {
    const parsed = parseMemoFile(filePath);
    expect(parsed.frontmatter.subject).toBe('A memo with "quotes" inside');
    expect(parsed.frontmatter.id).toBe("rt1");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
