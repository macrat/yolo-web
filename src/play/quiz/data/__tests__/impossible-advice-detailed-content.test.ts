/**
 * Tests for detailedContent on all 7 impossible-advice results.
 *
 * All 7 results have been converted to ImpossibleAdviceDetailedContent variant:
 *   - timemagician, gravityfighter, digitalmonk, sleeparchitect,
 *     conversationsamurai, weathercontroller, snackphilosopher
 *
 * New variant format requirements:
 *   - variant: "impossible-advice"
 *   - catchphrase: 15-30 chars
 *   - diagnosisCore: 80-150 chars (prose, not bullet points)
 *   - behaviors: exactly 4 items, each non-empty
 *   - practicalTip: 30-80 chars
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import type { ImpossibleAdviceDetailedContent } from "../../types";
import impossibleAdviceQuiz from "../impossible-advice";

const allResults = impossibleAdviceQuiz.results;

/** All 7 IDs have been converted to the new ImpossibleAdviceDetailedContent variant */
const ALL_IDS = [
  "timemagician",
  "gravityfighter",
  "digitalmonk",
  "sleeparchitect",
  "conversationsamurai",
  "weathercontroller",
  "snackphilosopher",
];

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

  describe("all results (ImpossibleAdviceDetailedContent)", () => {
    const convertedResults = allResults.filter((r) => ALL_IDS.includes(r.id));

    it("all results have variant === 'impossible-advice'", () => {
      for (const result of convertedResults) {
        const content =
          result.detailedContent as ImpossibleAdviceDetailedContent;
        expect(
          content.variant,
          `${result.id}: variant must be 'impossible-advice'`,
        ).toBe("impossible-advice");
      }
    });

    it("catchphrase is 15-30 chars", () => {
      for (const result of convertedResults) {
        const { catchphrase } =
          result.detailedContent as ImpossibleAdviceDetailedContent;
        expect(
          catchphrase.length,
          `${result.id}: catchphrase must be 15-30 chars (got ${catchphrase.length}: "${catchphrase}")`,
        ).toBeGreaterThanOrEqual(15);
        expect(
          catchphrase.length,
          `${result.id}: catchphrase must be 15-30 chars (got ${catchphrase.length}: "${catchphrase}")`,
        ).toBeLessThanOrEqual(30);
      }
    });

    it("diagnosisCore is 80-150 chars", () => {
      for (const result of convertedResults) {
        const { diagnosisCore } =
          result.detailedContent as ImpossibleAdviceDetailedContent;
        expect(
          diagnosisCore.length,
          `${result.id}: diagnosisCore must be 80-150 chars (got ${diagnosisCore.length})`,
        ).toBeGreaterThanOrEqual(80);
        expect(
          diagnosisCore.length,
          `${result.id}: diagnosisCore must be 150 chars or less (got ${diagnosisCore.length})`,
        ).toBeLessThanOrEqual(150);
      }
    });

    it("behaviors has exactly 4 items and each is non-empty", () => {
      for (const result of convertedResults) {
        const { behaviors } =
          result.detailedContent as ImpossibleAdviceDetailedContent;
        expect(
          behaviors.length,
          `${result.id}: behaviors count must be exactly 4`,
        ).toBe(4);
        for (const behavior of behaviors) {
          expect(
            behavior.length,
            `${result.id}: each behavior must be non-empty`,
          ).toBeGreaterThan(0);
        }
      }
    });

    it("practicalTip is 30-80 chars", () => {
      for (const result of convertedResults) {
        const { practicalTip } =
          result.detailedContent as ImpossibleAdviceDetailedContent;
        expect(
          practicalTip.length,
          `${result.id}: practicalTip must be 30-80 chars (got ${practicalTip.length}: "${practicalTip}")`,
        ).toBeGreaterThanOrEqual(30);
        expect(
          practicalTip.length,
          `${result.id}: practicalTip must be 80 chars or less (got ${practicalTip.length}: "${practicalTip}")`,
        ).toBeLessThanOrEqual(80);
      }
    });
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
