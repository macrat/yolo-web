import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createMemo } from "../commands/create.js";

let tmpDir: string;

// Mock getMemoRoot and memoFilePath to use temp directory
vi.mock("../core/paths.js", async () => {
  const actual = await vi.importActual<typeof import("../core/paths.js")>(
    "../core/paths.js",
  );
  return {
    ...actual,
    memoFilePath: (roleSlug: string, id: string, subject: string) => {
      const kebab = actual.toKebabCase(subject);
      return path.join(tmpDir, roleSlug, "inbox", `${id}-${kebab}.md`);
    },
  };
});

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-create-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("createMemo with body option", () => {
  test("uses body when provided instead of template", () => {
    const filePath = createMemo({
      subject: "Test with body",
      from: "planner",
      to: "builder",
      tags: [],
      replyTo: null,
      template: "task",
      body: "## Summary\nCustom body content here.",
    });

    const content = fs.readFileSync(filePath, "utf-8");

    // Should contain frontmatter
    expect(content).toContain('subject: "Test with body"');
    expect(content).toContain('from: "planner"');
    expect(content).toContain('to: "builder"');

    // Should contain the custom body, not the template
    expect(content).toContain("## Summary\nCustom body content here.");
    expect(content).not.toContain("## Context");
    expect(content).not.toContain("<why this exists");
  });

  test("uses template when body is undefined", () => {
    const filePath = createMemo({
      subject: "Test without body",
      from: "planner",
      to: "builder",
      tags: [],
      replyTo: null,
      template: "task",
    });

    const content = fs.readFileSync(filePath, "utf-8");

    // Should contain the task template content
    expect(content).toContain("## Context");
    expect(content).toContain("<why this exists");
  });

  test("body content has proper formatting with frontmatter", () => {
    const filePath = createMemo({
      subject: "Formatting test",
      from: "builder",
      to: "reviewer",
      tags: ["test"],
      replyTo: null,
      template: "reply",
      body: "## Results\nAll tests pass.",
    });

    const content = fs.readFileSync(filePath, "utf-8");

    // Should have frontmatter delimiters followed by blank line then body
    expect(content).toMatch(/---\n\n## Results\nAll tests pass.\n$/);
  });

  test("body works correctly with reply memos", () => {
    const filePath = createMemo({
      subject: "Task done",
      from: "builder",
      to: "planner",
      tags: [],
      replyTo: "abc123",
      template: "reply",
      body: "## Summary\nImplemented as requested.",
    });

    const content = fs.readFileSync(filePath, "utf-8");

    // Should auto-prefix "Re: " and auto-add "reply" tag
    expect(content).toContain('subject: "Re: Task done"');
    expect(content).toContain("reply");
    expect(content).toContain('reply_to: "abc123"');

    // Should use the provided body
    expect(content).toContain("## Summary\nImplemented as requested.");
  });
});
