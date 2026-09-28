import { describe, it, expect } from "vitest";
import { resultsBatch1 } from "../data/character-personality-results-batch1";

const EXPECTED_IDS = [
  "blazing-strategist",
  "blazing-poet",
  "blazing-schemer",
  "blazing-warden",
  "blazing-canvas",
  "dreaming-scholar",
  "contrarian-professor",
  "careful-scholar",
  "academic-artist",
  "star-chaser",
] as const;

describe("character-personality-results-batch1", () => {
  it("has exactly 10 entries", () => {
    expect(resultsBatch1.length).toBe(10);
  });

  it("has all expected IDs in order", () => {
    const ids = resultsBatch1.map((r) => r.id);
    expect(ids).toEqual([...EXPECTED_IDS]);
  });

  it("each entry has a non-empty title", () => {
    for (const entry of resultsBatch1) {
      expect(entry.title.length).toBeGreaterThan(0);
    }
  });

  it("each description is 200-300 characters", () => {
    for (const entry of resultsBatch1) {
      expect(entry.description.length).toBeGreaterThanOrEqual(200);
      expect(entry.description.length).toBeLessThanOrEqual(300);
    }
  });

  it("all IDs are unique", () => {
    const ids = resultsBatch1.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all required fields are present on each entry", () => {
    for (const entry of resultsBatch1) {
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("title");
      expect(entry).toHaveProperty("description");
    }
  });
});
