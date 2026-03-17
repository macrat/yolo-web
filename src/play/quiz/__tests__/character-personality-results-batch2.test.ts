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

  it("each color is a valid hex color string", () => {
    for (const entry of resultsBatch2) {
      expect(entry.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("each icon is exactly one emoji (non-empty string)", () => {
    for (const entry of resultsBatch2) {
      expect(entry.icon.length).toBeGreaterThan(0);
      // Icon should be a single grapheme cluster (emoji)
      const graphemes = [...new Intl.Segmenter().segment(entry.icon)];
      expect(graphemes.length).toBe(1);
    }
  });

  it("all IDs are unique", () => {
    const ids = resultsBatch2.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all colors are unique (each character has a distinct color)", () => {
    const colors = resultsBatch2.map((r) => r.color.toLowerCase());
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });

  it("all required fields are present on each entry", () => {
    for (const entry of resultsBatch2) {
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("title");
      expect(entry).toHaveProperty("description");
      expect(entry).toHaveProperty("color");
      expect(entry).toHaveProperty("icon");
    }
  });
});
