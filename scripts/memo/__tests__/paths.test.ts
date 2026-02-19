import { expect, test } from "vitest";
import { toKebabCase, inboxDir, memoFilePath } from "../core/paths.js";
import { normalizeRole, toPartition, isAgentMode } from "../types.js";

// normalizeRole tests
test("normalizeRole lowercases and replaces spaces with hyphens", () => {
  expect(normalizeRole("Project Manager")).toBe("project-manager");
  expect(normalizeRole("Process Engineer")).toBe("process-engineer");
  expect(normalizeRole("planner")).toBe("planner");
});

test("normalizeRole accepts single character", () => {
  expect(normalizeRole("a")).toBe("a");
});

test("normalizeRole throws for invalid input", () => {
  expect(() => normalizeRole("")).toThrow("Invalid role");
  expect(() => normalizeRole("-foo")).toThrow("Invalid role");
  expect(() => normalizeRole("foo-")).toThrow("Invalid role");
  expect(() => normalizeRole("foo bar!")).toThrow("Invalid role");
  expect(() => normalizeRole("123")).toThrow("Invalid role");
});

// toPartition tests
test("toPartition returns owner for owner", () => {
  expect(toPartition("owner")).toBe("owner");
});

test("toPartition returns agent for anything else", () => {
  expect(toPartition("builder")).toBe("agent");
  expect(toPartition("planner")).toBe("agent");
  expect(toPartition("researcher")).toBe("agent");
});

// isAgentMode tests
test("isAgentMode reflects CLAUDECODE env var", () => {
  const original = process.env.CLAUDECODE;
  delete process.env.CLAUDECODE;
  expect(isAgentMode()).toBe(false);
  process.env.CLAUDECODE = "1";
  expect(isAgentMode()).toBe(true);
  // restore
  if (original === undefined) {
    delete process.env.CLAUDECODE;
  } else {
    process.env.CLAUDECODE = original;
  }
});

// toKebabCase tests
test("toKebabCase converts subjects to kebab-case", () => {
  expect(toKebabCase("Plan memo management tool")).toBe(
    "plan-memo-management-tool",
  );
  expect(toKebabCase("Re: Original Subject")).toBe("re-original-subject");
});

test("toKebabCase truncates to 60 characters", () => {
  const long = "a".repeat(100);
  expect(toKebabCase(long).length).toBeLessThanOrEqual(60);
});

// path function tests
test("inboxDir uses partition string", () => {
  expect(inboxDir("agent")).toContain("memo/agent/inbox");
  expect(inboxDir("owner")).toContain("memo/owner/inbox");
});

test("memoFilePath builds correct path", () => {
  const result = memoFilePath("agent", "abc123", "Test Subject");
  expect(result).toContain("memo/agent/inbox/abc123-test-subject.md");
});
