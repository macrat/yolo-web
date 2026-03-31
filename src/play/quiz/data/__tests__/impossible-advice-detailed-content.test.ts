/**
 * Tests for detailedContent on all 7 impossible-advice results.
 * Each result must have a valid detailedContent with:
 *   - traits: 3-5 items, each non-empty
 *   - behaviors: 3-5 items, each non-empty
 *   - advice: non-empty string
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import type { QuizResultDetailedContent } from "../../types";
import impossibleAdviceQuiz from "../impossible-advice";

const allResults = impossibleAdviceQuiz.results;

describe("impossible-advice detailedContent", () => {
  it("all 7 results exist", () => {
    expect(allResults.length).toBe(7);
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
      const { traits } = result.detailedContent! as QuizResultDetailedContent;
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
      const { behaviors } =
        result.detailedContent! as QuizResultDetailedContent;
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
      const { advice } = result.detailedContent! as QuizResultDetailedContent;
      expect(
        advice.length,
        `${result.id}: advice must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("traits items are reasonably sized (5-150 chars each)", () => {
    for (const result of allResults) {
      for (const trait of (result.detailedContent! as QuizResultDetailedContent)
        .traits) {
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
      for (const behavior of (
        result.detailedContent! as QuizResultDetailedContent
      ).behaviors) {
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
      const { advice } = result.detailedContent! as QuizResultDetailedContent;
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

describe("impossible-advice seoTitle", () => {
  it("meta has seoTitle set", () => {
    expect(impossibleAdviceQuiz.meta.seoTitle).toBeDefined();
    expect(impossibleAdviceQuiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains 心理テスト keyword", () => {
    const seoTitle = impossibleAdviceQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("心理テスト");
  });

  it("seoTitle contains 無料 keyword", () => {
    const seoTitle = impossibleAdviceQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("無料");
  });
});
