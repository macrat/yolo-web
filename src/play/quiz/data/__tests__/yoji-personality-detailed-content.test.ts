/**
 * Tests for detailedContent on all 8 yoji-personality results.
 *
 * After the redesign, all 8 results use the YojiPersonalityDetailedContent format:
 *   - variant: "yoji-personality"
 *   - catchphrase: 15-30 chars
 *   - kanjiBreakdown: 80-150 chars
 *   - origin: 80-150 chars
 *   - behaviors: exactly 4 items, each non-empty (10-150 chars)
 *   - motto: 20-80 chars
 *
 * Also verifies:
 *   - resultPageLabels is removed from meta
 *   - seoTitle is set on meta
 */
import { describe, it, expect } from "vitest";
import type { YojiPersonalityDetailedContent } from "../../types";
import yojiPersonalityQuiz from "../yoji-personality";

const allResults = yojiPersonalityQuiz.results;

const ALL_IDS = [
  "shoshikantetsu",
  "tenshinranman",
  "sessatakuma",
  "ichigoichie",
  "rinkiohen",
  "meikyoshisui",
  "ishindenshin",
  "yuoumaishin",
] as const;

describe("yoji-personality detailedContent — common", () => {
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
});

describe("yoji-personality detailedContent — new variant format", () => {
  for (const id of ALL_IDS) {
    describe(`${id}`, () => {
      const result = allResults.find((r) => r.id === id)!;

      it('variant is "yoji-personality"', () => {
        expect(result.detailedContent?.variant).toBe("yoji-personality");
      });

      it("catchphrase is a non-empty string (15-30 chars)", () => {
        const { catchphrase } =
          result.detailedContent as YojiPersonalityDetailedContent;
        expect(catchphrase.length).toBeGreaterThanOrEqual(15);
        expect(catchphrase.length).toBeLessThanOrEqual(30);
      });

      it("kanjiBreakdown is a non-empty string (80-150 chars)", () => {
        const { kanjiBreakdown } =
          result.detailedContent as YojiPersonalityDetailedContent;
        expect(kanjiBreakdown.length).toBeGreaterThanOrEqual(80);
        expect(kanjiBreakdown.length).toBeLessThanOrEqual(150);
      });

      it("origin is a non-empty string (80-150 chars)", () => {
        const { origin } =
          result.detailedContent as YojiPersonalityDetailedContent;
        expect(origin.length).toBeGreaterThanOrEqual(80);
        expect(origin.length).toBeLessThanOrEqual(150);
      });

      it("behaviors has exactly 4 items, each non-empty (10-150 chars)", () => {
        const { behaviors } =
          result.detailedContent as YojiPersonalityDetailedContent;
        expect(behaviors.length).toBe(4);
        for (const behavior of behaviors) {
          expect(behavior.length).toBeGreaterThanOrEqual(10);
          expect(behavior.length).toBeLessThanOrEqual(150);
        }
      });

      it("motto is a non-empty string (20-80 chars)", () => {
        const { motto } =
          result.detailedContent as YojiPersonalityDetailedContent;
        expect(motto.length).toBeGreaterThanOrEqual(20);
        expect(motto.length).toBeLessThanOrEqual(80);
      });
    });
  }
});

describe("yoji-personality meta — new variant requirements", () => {
  it("resultPageLabels is removed from meta", () => {
    expect(yojiPersonalityQuiz.meta.resultPageLabels).toBeUndefined();
  });

  it("meta has seoTitle set", () => {
    expect(yojiPersonalityQuiz.meta.seoTitle).toBeDefined();
    expect(yojiPersonalityQuiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains SEO keywords", () => {
    const seoTitle = yojiPersonalityQuiz.meta.seoTitle!;
    // Should contain at least one of these important keywords
    const hasKeyword = /無料|性格診断|四字熟語|四字熟語診断/.test(seoTitle);
    expect(hasKeyword).toBe(true);
  });

  it("seoTitle contains 心理テスト keyword for better SEO", () => {
    const seoTitle = yojiPersonalityQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("心理テスト");
  });
});
