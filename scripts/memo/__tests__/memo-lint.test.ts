import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { LintError } from "../../memo-lint.js";

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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-lint-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

/** Helper: create a valid memo file with consistent ID and created_at */
function createMemo(
  roleSlug: string,
  state: string,
  options: {
    id?: string;
    subject?: string;
    from?: string;
    to?: string;
    created_at?: string;
    tags?: string;
    reply_to?: string;
    body?: string;
    filename?: string;
  } = {},
): void {
  // Default: use a consistent id/created_at pair
  // 0x19c65dfd696 = 1776193034902 -> 2026-02-12T...
  // 0x19c65dfd696 = 1771235694230 -> 2026-02-16T18:54:54.230+09:00
  const id = options.id ?? "19c65dfd696";
  const created_at = options.created_at ?? "2026-02-16T18:54:54.230+09:00";
  const subject = options.subject ?? "Test memo";
  const from = options.from ?? "planner";
  const to = options.to ?? roleSlug;
  const tags = options.tags ?? "[]";
  const reply_to = options.reply_to ?? "null";
  const body = options.body ?? "\n## Body\n";
  const filename = options.filename ?? `${id}-test.md`;

  const dir = path.join(tmpDir, roleSlug, state);
  fs.mkdirSync(dir, { recursive: true });

  const content = `---
id: "${id}"
subject: "${subject}"
from: "${from}"
to: "${to}"
created_at: "${created_at}"
tags: ${tags}
reply_to: ${reply_to}
---
${body}`;

  fs.writeFileSync(path.join(dir, filename), content, "utf-8");
}

describe("lintAllMemos", () => {
  test("passes for valid memos", async () => {
    createMemo("builder", "inbox");
    const { lintAllMemos } = await import("../../memo-lint.js");
    const errors = lintAllMemos();
    expect(errors).toEqual([]);
  });

  test("detects missing required field (empty id)", async () => {
    createMemo("builder", "inbox", { id: "" });
    const { lintAllMemos } = await import("../../memo-lint.js");
    const errors = lintAllMemos();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e: LintError) => e.message.includes("id"))).toBe(true);
  });

  test("detects ID/created_at mismatch", async () => {
    // Use an ID that does not match created_at
    createMemo("builder", "inbox", {
      id: "19c65dfd696",
      created_at: "2026-01-01T00:00:00.000+09:00",
    });
    const { lintAllMemos } = await import("../../memo-lint.js");
    const errors = lintAllMemos();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e: LintError) => e.message.includes("mismatch"))).toBe(
      true,
    );
  });

  test("detects duplicate IDs", async () => {
    createMemo("builder", "inbox", {
      id: "19c65dfd696",
      created_at: "2026-02-16T18:54:54.230+09:00",
      filename: "19c65dfd696-memo-a.md",
    });
    createMemo("planner", "active", {
      id: "19c65dfd696",
      created_at: "2026-02-16T18:54:54.230+09:00",
      filename: "19c65dfd696-memo-b.md",
    });
    const { lintAllMemos } = await import("../../memo-lint.js");
    const errors = lintAllMemos();
    expect(errors.length).toBeGreaterThan(0);
    expect(
      errors.some((e: LintError) => e.message.includes("Duplicate ID")),
    ).toBe(true);
  });

  test("detects credentials in body", async () => {
    createMemo("builder", "inbox", {
      body: "\napi_key = sk_live_abc123\n",
    });
    const { lintAllMemos } = await import("../../memo-lint.js");
    const errors = lintAllMemos();
    expect(errors.length).toBeGreaterThan(0);
    expect(
      errors.some((e: LintError) => e.message.includes("credential")),
    ).toBe(true);
  });

  test("returns empty array for no memos", async () => {
    // tmpDir exists but has no memo files
    const { lintAllMemos } = await import("../../memo-lint.js");
    const errors = lintAllMemos();
    expect(errors).toEqual([]);
  });

  test("multiple errors are reported together", async () => {
    // Mismatched ID + credential in body
    createMemo("builder", "inbox", {
      id: "19c65dfd696",
      created_at: "2026-01-01T00:00:00.000+09:00",
      body: "\npassword: secret123\n",
    });
    const { lintAllMemos } = await import("../../memo-lint.js");
    const errors = lintAllMemos();
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
