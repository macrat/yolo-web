import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { listMemos } from "../commands/list.js";

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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-list-test-"));
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function createMemoFile(
  roleSlug: string,
  state: string,
  id: string,
  opts: {
    subject?: string;
    from?: string;
    tags?: string[];
    createdAt?: string;
    replyTo?: string | null;
  } = {},
): void {
  const {
    subject = "Test memo",
    from = "planner",
    tags = [],
    createdAt = "2026-02-13T19:33:00.000+09:00",
    replyTo = null,
  } = opts;
  const dir = path.join(tmpDir, roleSlug, state);
  fs.mkdirSync(dir, { recursive: true });

  const tagLines =
    tags.length === 0
      ? "tags: []"
      : "tags:\n" + tags.map((t) => `  - ${t}`).join("\n");
  const replyLine =
    replyTo === null ? "reply_to: null" : `reply_to: "${replyTo}"`;

  const content = `---
id: "${id}"
subject: "${subject}"
from: "${from}"
to: "${roleSlug}"
created_at: "${createdAt}"
${tagLines}
${replyLine}
---

## Body
`;
  fs.writeFileSync(path.join(dir, `${id}-test.md`), content, "utf-8");
}

describe("listMemos", () => {
  test("outputs header row", () => {
    listMemos();
    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe(
      "id\treply_to\tcreated_at\tfrom\tto\tstate\tsubject",
    );
  });

  test("lists memos with tab-separated output", () => {
    createMemoFile("builder", "inbox", "id1", {
      subject: "Hello",
      from: "planner",
    });

    listMemos();
    const logSpy = vi.mocked(console.log);
    // Header + 1 data row
    expect(logSpy.mock.calls.length).toBe(2);
    const row = logSpy.mock.calls[1][0] as string;
    const parts = row.split("\t");
    expect(parts[0]).toBe("id1"); // id
    expect(parts[1]).toBe("-----------"); // null reply_to
    expect(parts[5]).toBe("inbox"); // state
    expect(parts[6]).toBe("Hello"); // subject
  });

  test("filters by state", () => {
    createMemoFile("builder", "inbox", "id1");
    createMemoFile("builder", "active", "id2");
    createMemoFile("builder", "archive", "id3");

    listMemos({ state: "inbox" });
    const logSpy = vi.mocked(console.log);
    // Header + 1 inbox memo
    expect(logSpy.mock.calls.length).toBe(2);
    expect((logSpy.mock.calls[1][0] as string).split("\t")[0]).toBe("id1");
  });

  test("filters by from", () => {
    createMemoFile("builder", "inbox", "id1", { from: "planner" });
    createMemoFile("builder", "inbox", "id2", { from: "reviewer" });

    listMemos({ from: "planner" });
    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls.length).toBe(2); // header + 1 row
    expect((logSpy.mock.calls[1][0] as string).split("\t")[0]).toBe("id1");
  });

  test("filters by to", () => {
    createMemoFile("builder", "inbox", "id1");
    createMemoFile("planner", "inbox", "id2");

    listMemos({ to: "builder" });
    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls.length).toBe(2);
    expect((logSpy.mock.calls[1][0] as string).split("\t")[0]).toBe("id1");
  });

  test("filters by tags (AND logic)", () => {
    createMemoFile("builder", "inbox", "id1", {
      tags: ["request", "implementation"],
    });
    createMemoFile("builder", "inbox", "id2", { tags: ["request"] });
    createMemoFile("builder", "inbox", "id3", { tags: ["other"] });

    listMemos({ tags: ["request", "implementation"] });
    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls.length).toBe(2); // header + 1 match
    expect((logSpy.mock.calls[1][0] as string).split("\t")[0]).toBe("id1");
  });

  test("respects limit", () => {
    createMemoFile("builder", "inbox", "id1", {
      createdAt: "2026-02-13T19:33:00.000+09:00",
    });
    createMemoFile("builder", "inbox", "id2", {
      createdAt: "2026-02-13T19:34:00.000+09:00",
    });
    createMemoFile("builder", "inbox", "id3", {
      createdAt: "2026-02-13T19:35:00.000+09:00",
    });

    listMemos({ limit: 2 });
    const logSpy = vi.mocked(console.log);
    // Header + 2 rows (most recent first)
    expect(logSpy.mock.calls.length).toBe(3);
  });

  test("shows reply_to value when present", () => {
    createMemoFile("builder", "inbox", "id1", { replyTo: "parent123" });

    listMemos();
    const logSpy = vi.mocked(console.log);
    const row = logSpy.mock.calls[1][0] as string;
    expect(row.split("\t")[1]).toBe("parent123");
  });

  test("custom fields selection", () => {
    createMemoFile("builder", "inbox", "id1", { subject: "Custom" });

    listMemos({ fields: ["id", "subject"] });
    const logSpy = vi.mocked(console.log);
    expect(logSpy.mock.calls[0][0]).toBe("id\tsubject");
    const row = logSpy.mock.calls[1][0] as string;
    const parts = row.split("\t");
    expect(parts.length).toBe(2);
    expect(parts[0]).toBe("id1");
    expect(parts[1]).toBe("Custom");
  });

  test("sorts by created_at descending", () => {
    createMemoFile("builder", "inbox", "id1", {
      createdAt: "2026-02-13T19:33:00.000+09:00",
    });
    createMemoFile("builder", "inbox", "id2", {
      createdAt: "2026-02-14T19:33:00.000+09:00",
    });

    listMemos();
    const logSpy = vi.mocked(console.log);
    // id2 should come first (more recent)
    expect((logSpy.mock.calls[1][0] as string).split("\t")[0]).toBe("id2");
    expect((logSpy.mock.calls[2][0] as string).split("\t")[0]).toBe("id1");
  });
});
