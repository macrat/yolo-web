/**
 * Tests for detailedContent on all 6 character-fortune results.
 * Each result must have a valid detailedContent with:
 *   - traits: 3-5 items, each non-empty
 *   - behaviors: 3-5 items, each non-empty
 *   - advice: non-empty string
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import characterFortuneQuiz from "../character-fortune";

const allResults = characterFortuneQuiz.results;

describe("character-fortune detailedContent", () => {
  it("all 6 results exist", () => {
    expect(allResults.length).toBe(6);
  });

  it("every result has detailedContent", () => {
    for (const result of allResults) {
      expect(
        result.detailedContent,
        `${result.id} is missing detailedContent`,
      ).toBeDefined();
    }
  });

  it("traits has 3-5 items and each is non-empty", () => {
    for (const result of allResults) {
      const { traits } = result.detailedContent!;
      expect(
        traits.length,
        `${result.id}: traits count should be 3-5`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        traits.length,
        `${result.id}: traits count should be 3-5`,
      ).toBeLessThanOrEqual(5);
      for (const trait of traits) {
        expect(
          trait.length,
          `${result.id}: each trait must be non-empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("behaviors has 3-5 items and each is non-empty", () => {
    for (const result of allResults) {
      const { behaviors } = result.detailedContent!;
      expect(
        behaviors.length,
        `${result.id}: behaviors count should be 3-5`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        behaviors.length,
        `${result.id}: behaviors count should be 3-5`,
      ).toBeLessThanOrEqual(5);
      for (const behavior of behaviors) {
        expect(
          behavior.length,
          `${result.id}: each behavior must be non-empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("advice is a non-empty string", () => {
    for (const result of allResults) {
      const { advice } = result.detailedContent!;
      expect(
        advice.length,
        `${result.id}: advice must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("traits items are reasonably sized (5-150 chars each)", () => {
    for (const result of allResults) {
      for (const trait of result.detailedContent!.traits) {
        expect(
          trait.length,
          `${result.id}: trait too short or too long`,
        ).toBeGreaterThanOrEqual(5);
        expect(
          trait.length,
          `${result.id}: trait too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      }
    }
  });

  it("behaviors items are reasonably sized (10-150 chars each)", () => {
    for (const result of allResults) {
      for (const behavior of result.detailedContent!.behaviors) {
        expect(
          behavior.length,
          `${result.id}: behavior too short or too long`,
        ).toBeGreaterThanOrEqual(10);
        expect(
          behavior.length,
          `${result.id}: behavior too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      }
    }
  });

  it("advice is reasonably sized (10-200 chars)", () => {
    for (const result of allResults) {
      const { advice } = result.detailedContent!;
      expect(
        advice.length,
        `${result.id}: advice too short`,
      ).toBeGreaterThanOrEqual(10);
      expect(
        advice.length,
        `${result.id}: advice too long (max 200)`,
      ).toBeLessThanOrEqual(200);
    }
  });
});

describe("character-fortune seoTitle", () => {
  it("meta has seoTitle set", () => {
    expect(characterFortuneQuiz.meta.seoTitle).toBeDefined();
    expect(characterFortuneQuiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains SEO keywords", () => {
    const seoTitle = characterFortuneQuiz.meta.seoTitle!;
    // Should contain at least one of these important keywords
    const hasKeyword =
      /無料|性格診断|守護キャラ|キャラ診断|キャラクター診断/.test(seoTitle);
    expect(hasKeyword).toBe(true);
  });
});
