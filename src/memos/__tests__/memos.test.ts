import { describe, test, expect } from "vitest";
import { normalizeRole, getAllPublicMemoSummaries } from "@/memos/_lib/memos";

describe("normalizeRole", () => {
  test("returns known role slugs as-is", () => {
    expect(normalizeRole("builder")).toBe("builder");
    expect(normalizeRole("researcher")).toBe("researcher");
    expect(normalizeRole("planner")).toBe("planner");
    expect(normalizeRole("reviewer")).toBe("reviewer");
    expect(normalizeRole("owner")).toBe("owner");
    expect(normalizeRole("agent")).toBe("agent");
  });

  test("maps 'pm' to 'project-manager'", () => {
    expect(normalizeRole("pm")).toBe("project-manager");
  });

  test("maps 'PM' (uppercase) to 'project-manager'", () => {
    expect(normalizeRole("PM")).toBe("project-manager");
  });

  test("maps 'agent-lead' to 'agent'", () => {
    expect(normalizeRole("agent-lead")).toBe("agent");
  });

  test("maps 'project manager' (with space) to 'project-manager'", () => {
    expect(normalizeRole("project manager")).toBe("project-manager");
  });

  test("maps 'Project Manager' (capitalized) to 'project-manager'", () => {
    expect(normalizeRole("Project Manager")).toBe("project-manager");
  });

  test("maps 'chatgpt' to 'owner'", () => {
    expect(normalizeRole("chatgpt")).toBe("owner");
  });

  test("maps 'ChatGPT' (mixed case) to 'owner'", () => {
    expect(normalizeRole("ChatGPT")).toBe("owner");
  });

  test("maps 'process engineer' to 'process-engineer'", () => {
    expect(normalizeRole("process engineer")).toBe("process-engineer");
  });

  test("returns unknown roles as-is", () => {
    expect(normalizeRole("unknown-role")).toBe("unknown-role");
  });

  test("handles case-insensitive known role slugs", () => {
    expect(normalizeRole("Builder")).toBe("builder");
    expect(normalizeRole("RESEARCHER")).toBe("researcher");
  });
});

describe("getAllPublicMemoSummaries", () => {
  test("returns memos without contentHtml property", () => {
    const summaries = getAllPublicMemoSummaries();

    // Should return an array
    expect(Array.isArray(summaries)).toBe(true);

    // Every summary should NOT have contentHtml
    for (const summary of summaries) {
      expect(summary).not.toHaveProperty("contentHtml");
    }
  });

  test("each summary contains required fields", () => {
    const summaries = getAllPublicMemoSummaries();

    if (summaries.length === 0) return; // Skip if no memos in test index

    const first = summaries[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("subject");
    expect(first).toHaveProperty("from");
    expect(first).toHaveProperty("to");
    expect(first).toHaveProperty("created_at");
    expect(first).toHaveProperty("tags");
    expect(first).toHaveProperty("reply_to");
    expect(first).toHaveProperty("threadRootId");
    expect(first).toHaveProperty("replyCount");
  });
});
