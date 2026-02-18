import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createMemo } from "../commands/create.js";

let tmpDir: string;

// Mock getMemoRoot, memoFilePath, and scanAllMemos to use temp directory
vi.mock("../core/paths.js", async () => {
  const actual =
    await vi.importActual<typeof import("../core/paths.js")>(
      "../core/paths.js",
    );
  return {
    ...actual,
    getMemoRoot: () => tmpDir,
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

describe("createMemo", () => {
  test("creates a memo and returns the ID", () => {
    const id = createMemo({
      subject: "Test with body",
      from: "planner",
      to: "builder",
      tags: [],
      replyTo: null,
      body: "## Summary\nCustom body content here.",
      skipCredentialCheck: true,
    });

    expect(id).toMatch(/^[0-9a-f]+$/);

    // Find the created file
    const inboxDir = path.join(tmpDir, "builder", "inbox");
    const files = fs.readdirSync(inboxDir);
    expect(files.length).toBe(1);

    const content = fs.readFileSync(path.join(inboxDir, files[0]), "utf-8");
    expect(content).toContain('subject: "Test with body"');
    expect(content).toContain('from: "planner"');
    expect(content).toContain('to: "builder"');
    expect(content).toContain("## Summary\nCustom body content here.");
    // Should NOT contain public field
    expect(content).not.toContain("public:");
  });

  test("created_at has millisecond precision", () => {
    const id = createMemo({
      subject: "Timestamp test",
      from: "planner",
      to: "builder",
      tags: [],
      replyTo: null,
      body: "Body content.",
      skipCredentialCheck: true,
    });

    const inboxDir = path.join(tmpDir, "builder", "inbox");
    const files = fs.readdirSync(inboxDir);
    const content = fs.readFileSync(path.join(inboxDir, files[0]), "utf-8");

    // Match millisecond precision timestamp
    const match = content.match(
      /created_at:\s*"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2})"/,
    );
    expect(match).not.toBeNull();

    // Verify ID and created_at are from same timestamp
    const createdAt = match![1];
    const ms = new Date(createdAt).getTime();
    expect(ms.toString(16)).toBe(id);
  });

  test("adds reply tag for replies without Re: prefix", () => {
    const id = createMemo({
      subject: "Task done",
      from: "builder",
      to: "planner",
      tags: [],
      replyTo: "abc123",
      body: "## Summary\nImplemented as requested.",
      skipCredentialCheck: true,
    });

    const inboxDir = path.join(tmpDir, "planner", "inbox");
    const files = fs.readdirSync(inboxDir);
    const content = fs.readFileSync(path.join(inboxDir, files[0]), "utf-8");

    expect(content).toContain('subject: "Task done"');
    expect(content).not.toContain("Re:");
    expect(content).toContain("  - reply");
    expect(content).toContain('reply_to: "abc123"');
    expect(id).toMatch(/^[0-9a-f]+$/);
  });

  test("throws error when body is empty", () => {
    expect(() =>
      createMemo({
        subject: "Empty body",
        from: "planner",
        to: "builder",
        tags: [],
        replyTo: null,
        body: "",
        skipCredentialCheck: true,
      }),
    ).toThrow("Body is required and cannot be empty");
  });

  test("throws error when body is only whitespace", () => {
    expect(() =>
      createMemo({
        subject: "Whitespace body",
        from: "planner",
        to: "builder",
        tags: [],
        replyTo: null,
        body: "   \n  \n  ",
        skipCredentialCheck: true,
      }),
    ).toThrow("Body is required and cannot be empty");
  });

  test("credential check detects suspicious content", () => {
    expect(() =>
      createMemo({
        subject: "Config update",
        from: "builder",
        to: "reviewer",
        tags: [],
        replyTo: null,
        body: "Set api_key = sk_live_abc123xyz",
      }),
    ).toThrow("Potential credential detected");
  });

  test("credential check can be skipped", () => {
    const id = createMemo({
      subject: "Config update",
      from: "builder",
      to: "reviewer",
      tags: [],
      replyTo: null,
      body: "Set api_key = sk_live_abc123xyz",
      skipCredentialCheck: true,
    });

    expect(id).toMatch(/^[0-9a-f]+$/);
  });
});
