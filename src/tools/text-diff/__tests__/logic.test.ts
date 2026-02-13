import { describe, test, expect } from "vitest";
import { computeDiff, hasDifferences } from "../logic";

describe("computeDiff", () => {
  test("returns no diff for identical texts", () => {
    const parts = computeDiff("hello", "hello", "char");
    expect(hasDifferences(parts)).toBe(false);
  });

  test("detects added text (char mode)", () => {
    const parts = computeDiff("hello", "hello world", "char");
    expect(hasDifferences(parts)).toBe(true);
    const addedParts = parts.filter((p) => p.added);
    expect(addedParts.length).toBeGreaterThan(0);
  });

  test("detects removed text (char mode)", () => {
    const parts = computeDiff("hello world", "hello", "char");
    expect(hasDifferences(parts)).toBe(true);
    const removedParts = parts.filter((p) => p.removed);
    expect(removedParts.length).toBeGreaterThan(0);
  });

  test("line mode diff", () => {
    const parts = computeDiff("line1\nline2", "line1\nline3", "line");
    expect(hasDifferences(parts)).toBe(true);
  });

  test("word mode diff", () => {
    const parts = computeDiff("hello world", "hello earth", "word");
    expect(hasDifferences(parts)).toBe(true);
    const removed = parts.filter((p) => p.removed);
    const added = parts.filter((p) => p.added);
    expect(removed.length).toBeGreaterThan(0);
    expect(added.length).toBeGreaterThan(0);
  });

  test("empty strings produce no diff", () => {
    const parts = computeDiff("", "", "line");
    expect(hasDifferences(parts)).toBe(false);
  });
});

describe("hasDifferences", () => {
  test("returns false for parts with no additions or removals", () => {
    expect(
      hasDifferences([{ value: "hello", added: false, removed: false }]),
    ).toBe(false);
  });

  test("returns true if any part is added", () => {
    expect(
      hasDifferences([{ value: "new", added: true, removed: false }]),
    ).toBe(true);
  });

  test("returns true if any part is removed", () => {
    expect(
      hasDifferences([{ value: "old", added: false, removed: true }]),
    ).toBe(true);
  });
});
