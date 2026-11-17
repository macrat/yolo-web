import { describe, it, expect } from "vitest";
import { resultsBatch2 } from "../data/character-personality-results-batch2";

const EXPECTED_IDS = [
  "tender-dreamer",
  "dreaming-canvas",
  "clever-guardian",
  "creative-disruptor",
  "gentle-fortress",
  "ultimate-commander",
  "endless-researcher",
  "eternal-dreamer",
  "ultimate-trickster",
  "ultimate-guardian",
] as const;

describe("character-personality-results-batch2", () => {
  it("has exactly 10 entries", () => {
    expect(resultsBatch2.length).toBe(10);
  });

  it("has all expected IDs in order", () => {
    const ids = resultsBatch2.map((r) => r.id);
    expect(ids).toEqual([...EXPECTED_IDS]);
  });

  it("each entry has a non-empty title", () => {
    for (const entry of resultsBatch2) {
      expect(entry.title.length).toBeGreaterThan(0);
    }
  });

  it("each description is 200-300 characters", () => {
    for (const entry of resultsBatch2) {
      expect(entry.description.length).toBeGreaterThanOrEqual(200);
      expect(entry.description.length).toBeLessThanOrEqual(300);
    }
  });

  it("all IDs are unique", () => {
    const ids = resultsBatch2.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all required fields are present on each entry", () => {
    for (const entry of resultsBatch2) {
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("title");
      expect(entry).toHaveProperty("description");
    }
  });
});
