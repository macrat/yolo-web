import { expect, test } from "vitest";
import { getTemplate } from "../core/templates.js";

test("getTemplate returns content for all template types", () => {
  const types = [
    "task",
    "reply",
    "research",
    "planning",
    "implementation",
    "review",
    "process",
  ] as const;

  for (const type of types) {
    const template = getTemplate(type);
    expect(template.length).toBeGreaterThan(0);
    expect(template).toContain("##");
  }
});

test("task template includes required sections", () => {
  const t = getTemplate("task");
  expect(t).toContain("## Context");
  expect(t).toContain("## Request");
  expect(t).toContain("## Acceptance criteria");
  expect(t).toContain("## Constraints");
  expect(t).toContain("constitution.md");
});

test("reply template includes required sections", () => {
  const t = getTemplate("reply");
  expect(t).toContain("## Summary");
  expect(t).toContain("## Results");
  expect(t).toContain("## Next actions");
});
