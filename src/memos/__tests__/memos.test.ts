import { describe, test, expect } from "vitest";
import { normalizeRole } from "@/memos/_lib/memos";

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
