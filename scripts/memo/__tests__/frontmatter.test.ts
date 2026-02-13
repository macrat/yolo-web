import { expect, test } from "vitest";
import { formatTimestamp, serializeFrontmatter } from "../core/frontmatter.js";
import type { MemoFrontmatter } from "../types.js";

test("formatTimestamp returns ISO-8601 with timezone", () => {
  const ts = formatTimestamp(new Date("2026-02-13T19:33:00+09:00"));
  expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
});

test("serializeFrontmatter produces valid YAML frontmatter", () => {
  const fm: MemoFrontmatter = {
    id: "abc123",
    subject: "Test memo",
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00+09:00",
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
});

test("serializeFrontmatter handles reply_to with value", () => {
  const fm: MemoFrontmatter = {
    id: "abc123",
    subject: "Re: Test memo",
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00+09:00",
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
    created_at: "2026-02-13T19:33:00+09:00",
    tags: [],
    reply_to: null,
  };

  const result = serializeFrontmatter(fm);
  expect(result).toContain("tags: []");
});
