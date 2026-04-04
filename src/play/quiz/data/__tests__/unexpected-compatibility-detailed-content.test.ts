/**
 * Tests for detailedContent on all 8 unexpected-compatibility results.
 *
 * Migration status:
 *   - all 8 results: new "unexpected-compatibility" variant format
 *
 * This test covers:
 *   - every result has detailedContent
 *   - all results use the new variant format with lifeAdvice
 *   - behaviors: exactly 4 items in new variant format
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import type { UnexpectedCompatibilityDetailedContent } from "../../types";
import unexpectedCompatibilityQuiz from "../unexpected-compatibility";

const allResults = unexpectedCompatibilityQuiz.results;

describe("unexpected-compatibility detailedContent", () => {
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

  it("all results use the new variant format", () => {
    for (const result of allResults) {
      expect(
        result.detailedContent?.variant,
        `${result.id}: variant must be 'unexpected-compatibility'`,
      ).toBe("unexpected-compatibility");
    }
  });

  it("all results: behaviors has exactly 4 items and each is non-empty", () => {
    for (const result of allResults) {
      const behaviors = result.detailedContent!.behaviors;
      expect(
        behaviors.length,
        `${result.id}: behaviors must have exactly 4 items`,
      ).toBe(4);
      for (const behavior of behaviors) {
        expect(
          behavior.length,
          `${result.id}: each behavior must be non-empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("all results: behaviors items are reasonably sized (10-150 chars each)", () => {
    for (const result of allResults) {
      for (const behavior of result.detailedContent!.behaviors) {
        expect(
          behavior.length,
          `${result.id}: behavior too short`,
        ).toBeGreaterThanOrEqual(10);
        expect(
          behavior.length,
          `${result.id}: behavior too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      }
    }
  });

  it("all results: lifeAdvice is a non-empty string", () => {
    for (const result of allResults) {
      const dc =
        result.detailedContent as UnexpectedCompatibilityDetailedContent;
      expect(
        dc.lifeAdvice.length,
        `${result.id}: lifeAdvice must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("unexpected-compatibility meta — resultPageLabels removed", () => {
  it("resultPageLabels is not set on meta (uses dedicated UnexpectedCompatibilityContent component)", () => {
    expect(unexpectedCompatibilityQuiz.meta.resultPageLabels).toBeUndefined();
  });
});

describe("unexpected-compatibility seoTitle", () => {
  it("meta has seoTitle set", () => {
    expect(unexpectedCompatibilityQuiz.meta.seoTitle).toBeDefined();
    expect(unexpectedCompatibilityQuiz.meta.seoTitle!.length).toBeGreaterThan(
      0,
    );
  });

  it("seoTitle contains 心理テスト keyword", () => {
    const seoTitle = unexpectedCompatibilityQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("心理テスト");
  });

  it("seoTitle contains 無料 keyword", () => {
    const seoTitle = unexpectedCompatibilityQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("無料");
  });
});
