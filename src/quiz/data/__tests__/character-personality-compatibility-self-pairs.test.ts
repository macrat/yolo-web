/**
 * Tests for character-personality-compatibility.ts — Self-Pairs (Batch 1: 24 entries)
 *
 * Self-pairs: same character paired with itself (e.g. "blazing-strategist--blazing-strategist")
 */
import { describe, it, expect } from "vitest";
import { compatibilityMatrix } from "../character-personality-compatibility";

const SELF_PAIR_IDS = [
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
  "ultimate-artist",
  "data-fortress",
  "vibe-rebel",
  "guardian-charger",
] as const;

describe("character-personality-compatibility — self pairs", () => {
  it("contains all 24 self-pair entries", () => {
    for (const id of SELF_PAIR_IDS) {
      const key = `${id}--${id}`;
      expect(
        compatibilityMatrix[key],
        `Missing self-pair key: ${key}`,
      ).toBeDefined();
    }
  });

  it("each self-pair has a non-empty label", () => {
    for (const id of SELF_PAIR_IDS) {
      const key = `${id}--${id}`;
      const entry = compatibilityMatrix[key];
      if (!entry) continue;
      expect(entry.label.length, `Empty label for ${key}`).toBeGreaterThan(0);
    }
  });

  it("each self-pair label is between 5 and 20 characters", () => {
    for (const id of SELF_PAIR_IDS) {
      const key = `${id}--${id}`;
      const entry = compatibilityMatrix[key];
      if (!entry) continue;
      expect(
        entry.label.length,
        `Label too short for ${key}: "${entry.label}"`,
      ).toBeGreaterThanOrEqual(5);
      expect(
        entry.label.length,
        `Label too long for ${key}: "${entry.label}"`,
      ).toBeLessThanOrEqual(20);
    }
  });

  it("each self-pair has a non-empty description", () => {
    for (const id of SELF_PAIR_IDS) {
      const key = `${id}--${id}`;
      const entry = compatibilityMatrix[key];
      if (!entry) continue;
      expect(
        entry.description.length,
        `Empty description for ${key}`,
      ).toBeGreaterThan(0);
    }
  });

  it("each self-pair description is between 50 and 120 characters", () => {
    for (const id of SELF_PAIR_IDS) {
      const key = `${id}--${id}`;
      const entry = compatibilityMatrix[key];
      if (!entry) continue;
      expect(
        entry.description.length,
        `Description too short for ${key}: "${entry.description}"`,
      ).toBeGreaterThanOrEqual(50);
      expect(
        entry.description.length,
        `Description too long for ${key}: "${entry.description}"`,
      ).toBeLessThanOrEqual(120);
    }
  });

  it("labels are not generic — must not contain '相性抜群' or '最高の相性'", () => {
    for (const id of SELF_PAIR_IDS) {
      const key = `${id}--${id}`;
      const entry = compatibilityMatrix[key];
      if (!entry) continue;
      expect(entry.label, `Generic label detected for ${key}`).not.toMatch(
        /相性抜群|最高の相性|相性ゼロ|最悪の相性/,
      );
    }
  });

  it("all 24 self-pair labels are unique", () => {
    const labels = SELF_PAIR_IDS.map((id) => {
      const key = `${id}--${id}`;
      return compatibilityMatrix[key]?.label ?? "";
    }).filter(Boolean);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });
});
