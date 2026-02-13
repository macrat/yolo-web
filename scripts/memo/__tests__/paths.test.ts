import { expect, test } from "vitest";
import { resolveRoleSlug, toKebabCase } from "../core/paths.js";

test("resolveRoleSlug maps display names to slugs", () => {
  expect(resolveRoleSlug("project manager")).toBe("project-manager");
  expect(resolveRoleSlug("process engineer")).toBe("process-engineer");
  expect(resolveRoleSlug("planner")).toBe("planner");
});

test("resolveRoleSlug throws for unknown role", () => {
  expect(() => resolveRoleSlug("unknown")).toThrow('Unknown role: "unknown"');
});

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
