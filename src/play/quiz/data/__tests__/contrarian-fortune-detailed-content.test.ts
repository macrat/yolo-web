/**
 * Tests for detailedContent on all 8 contrarian-fortune results.
 *
 * Each result must have a valid ContrarianFortuneDetailedContent with:
 *   - variant: "contrarian-fortune"
 *   - catchphrase: 10-50 chars, non-empty
 *   - coreSentence: 20-100 chars, non-empty, contains reversal frame
 *   - behaviors: 3-5 items, each non-empty (10-150 chars)
 *   - persona: 150-250 chars
 *   - thirdPartyNote: non-empty string
 *   - humorMetrics (optional): each item has label and value
 *
 * Also verifies:
 *   - meta does NOT have resultPageLabels
 *   - seoTitle is set on meta
 */
import { describe, it, expect } from "vitest";
import type { ContrarianFortuneDetailedContent } from "../../types";
import contrarianFortuneQuiz from "../contrarian-fortune";

const allResults = contrarianFortuneQuiz.results;

describe("contrarian-fortune detailedContent", () => {
  it("all 8 results exist", () => {
    expect(allResults.length).toBe(8);
  });

  it("every result has detailedContent", () => {
    for (const result of allResults) {
      expect(
        result.detailedContent,
        `${result.id} is missing detailedContent`,
      ).toBeDefined();
    }
  });

  it("every result has variant = 'contrarian-fortune'", () => {
    for (const result of allResults) {
      expect(
        result.detailedContent?.variant,
        `${result.id}: variant must be 'contrarian-fortune'`,
      ).toBe("contrarian-fortune");
    }
  });

  it("catchphrase is 10-50 chars and non-empty", () => {
    for (const result of allResults) {
      const dc = result.detailedContent as ContrarianFortuneDetailedContent;
      expect(
        dc.catchphrase.length,
        `${result.id}: catchphrase must be at least 10 chars`,
      ).toBeGreaterThanOrEqual(10);
      expect(
        dc.catchphrase.length,
        `${result.id}: catchphrase must be at most 50 chars`,
      ).toBeLessThanOrEqual(50);
    }
  });

  it("coreSentence is 20-100 chars and non-empty", () => {
    for (const result of allResults) {
      const dc = result.detailedContent as ContrarianFortuneDetailedContent;
      expect(
        dc.coreSentence.length,
        `${result.id}: coreSentence must be at least 20 chars`,
      ).toBeGreaterThanOrEqual(20);
      expect(
        dc.coreSentence.length,
        `${result.id}: coreSentence must be at most 100 chars`,
      ).toBeLessThanOrEqual(100);
    }
  });

  it("behaviors has 3-5 items and each is non-empty (10-150 chars)", () => {
    for (const result of allResults) {
      const dc = result.detailedContent as ContrarianFortuneDetailedContent;
      expect(
        dc.behaviors.length,
        `${result.id}: behaviors count should be 3-5`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        dc.behaviors.length,
        `${result.id}: behaviors count should be 3-5`,
      ).toBeLessThanOrEqual(5);
      for (const behavior of dc.behaviors) {
        expect(
          behavior.length,
          `${result.id}: each behavior must be at least 10 chars`,
        ).toBeGreaterThanOrEqual(10);
        expect(
          behavior.length,
          `${result.id}: each behavior must be at most 150 chars`,
        ).toBeLessThanOrEqual(150);
      }
    }
  });

  it("persona is 150-250 chars", () => {
    for (const result of allResults) {
      const dc = result.detailedContent as ContrarianFortuneDetailedContent;
      expect(
        dc.persona.length,
        `${result.id}: persona must be at least 150 chars (was ${dc.persona.length})`,
      ).toBeGreaterThanOrEqual(150);
      expect(
        dc.persona.length,
        `${result.id}: persona must be at most 250 chars (was ${dc.persona.length})`,
      ).toBeLessThanOrEqual(250);
    }
  });

  it("thirdPartyNote is non-empty string (at least 50 chars)", () => {
    for (const result of allResults) {
      const dc = result.detailedContent as ContrarianFortuneDetailedContent;
      expect(
        dc.thirdPartyNote.length,
        `${result.id}: thirdPartyNote must be at least 50 chars`,
      ).toBeGreaterThanOrEqual(50);
    }
  });

  it("humorMetrics, when present, has valid label and value", () => {
    for (const result of allResults) {
      const dc = result.detailedContent as ContrarianFortuneDetailedContent;
      if (dc.humorMetrics) {
        expect(
          Array.isArray(dc.humorMetrics),
          `${result.id}: humorMetrics must be an array`,
        ).toBe(true);
        for (const metric of dc.humorMetrics) {
          expect(
            metric.label.length,
            `${result.id}: humorMetrics label must be non-empty`,
          ).toBeGreaterThan(0);
          expect(
            metric.value.length,
            `${result.id}: humorMetrics value must be non-empty`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("meta does NOT have resultPageLabels", () => {
    expect(
      contrarianFortuneQuiz.meta.resultPageLabels,
      "meta.resultPageLabels must be removed",
    ).toBeUndefined();
  });
});

describe("contrarian-fortune seoTitle", () => {
  it("meta has seoTitle set", () => {
    expect(contrarianFortuneQuiz.meta.seoTitle).toBeDefined();
    expect(contrarianFortuneQuiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains 心理テスト keyword", () => {
    const seoTitle = contrarianFortuneQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("心理テスト");
  });

  it("seoTitle contains 無料 keyword", () => {
    const seoTitle = contrarianFortuneQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("無料");
  });
});
