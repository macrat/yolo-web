/**
 * Tests for detailedContent on all 8 traditional-color results.
 *
 * After the redesign, all 8 results use the TraditionalColorDetailedContent format:
 *   - variant: "traditional-color"
 *   - catchphrase: 15-30 chars
 *   - colorMeaning: 80-150 chars
 *   - season: "春" | "夏" | "秋" | "冬"
 *   - scenery: 20-50 chars
 *   - behaviors: exactly 4 items, each non-empty
 *   - colorAdvice: 20-100 chars
 *
 * Also verifies:
 *   - resultPageLabels is removed from meta
 *   - seoTitle is set on meta
 */
import { describe, it, expect } from "vitest";
import type { TraditionalColorDetailedContent } from "../../types";
import traditionalColorQuiz from "../traditional-color";

const allResults = traditionalColorQuiz.results;

const ALL_IDS = [
  "ai",
  "shu",
  "wakakusa",
  "fuji",
  "yamabuki",
  "kon",
  "sakura",
  "hisui",
] as const;

const VALID_SEASONS = ["春", "夏", "秋", "冬"] as const;

describe("traditional-color detailedContent — common", () => {
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

describe("traditional-color detailedContent — new variant format", () => {
  for (const id of ALL_IDS) {
    describe(`${id}`, () => {
      const result = allResults.find((r) => r.id === id)!;

      it('variant is "traditional-color"', () => {
        expect(result.detailedContent?.variant).toBe("traditional-color");
      });

      it("catchphrase is a non-empty string (15-30 chars)", () => {
        const dc = result.detailedContent as TraditionalColorDetailedContent;
        expect(typeof dc.catchphrase).toBe("string");
        expect(
          dc.catchphrase.length,
          `${id}: catchphrase too short (min 15)`,
        ).toBeGreaterThanOrEqual(15);
        expect(
          dc.catchphrase.length,
          `${id}: catchphrase too long (max 30)`,
        ).toBeLessThanOrEqual(30);
      });

      it("colorMeaning is a non-empty string (80-150 chars)", () => {
        const dc = result.detailedContent as TraditionalColorDetailedContent;
        expect(typeof dc.colorMeaning).toBe("string");
        expect(
          dc.colorMeaning.length,
          `${id}: colorMeaning too short (min 80)`,
        ).toBeGreaterThanOrEqual(80);
        expect(
          dc.colorMeaning.length,
          `${id}: colorMeaning too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      });

      it("season is a valid season value", () => {
        const dc = result.detailedContent as TraditionalColorDetailedContent;
        expect(VALID_SEASONS).toContain(dc.season);
      });

      it("scenery is a non-empty string (20-50 chars)", () => {
        const dc = result.detailedContent as TraditionalColorDetailedContent;
        expect(typeof dc.scenery).toBe("string");
        expect(
          dc.scenery.length,
          `${id}: scenery too short (min 20)`,
        ).toBeGreaterThanOrEqual(20);
        expect(
          dc.scenery.length,
          `${id}: scenery too long (max 50)`,
        ).toBeLessThanOrEqual(50);
      });

      it("behaviors is an array of exactly 4 non-empty strings", () => {
        const dc = result.detailedContent as TraditionalColorDetailedContent;
        expect(Array.isArray(dc.behaviors)).toBe(true);
        expect(
          dc.behaviors.length,
          `${id}: behaviors must have exactly 4 items`,
        ).toBe(4);
        for (const b of dc.behaviors) {
          expect(typeof b).toBe("string");
          expect(
            b.length,
            `${id}: each behavior must be non-empty`,
          ).toBeGreaterThan(0);
        }
      });

      it("colorAdvice is a non-empty string (20-100 chars)", () => {
        const dc = result.detailedContent as TraditionalColorDetailedContent;
        expect(typeof dc.colorAdvice).toBe("string");
        expect(
          dc.colorAdvice.length,
          `${id}: colorAdvice too short (min 20)`,
        ).toBeGreaterThanOrEqual(20);
        expect(
          dc.colorAdvice.length,
          `${id}: colorAdvice too long (max 100)`,
        ).toBeLessThanOrEqual(100);
      });

      it("does not have old-format fields (traits/advice)", () => {
        const dc = result.detailedContent as unknown as Record<string, unknown>;
        expect(dc["traits"]).toBeUndefined();
        expect(dc["advice"]).toBeUndefined();
      });
    });
  }

  it("all 8 catchphrases are unique", () => {
    const catchphrases = ALL_IDS.map((id) => {
      const result = allResults.find((r) => r.id === id)!;
      return (result.detailedContent as TraditionalColorDetailedContent)
        .catchphrase;
    });
    const unique = new Set(catchphrases);
    expect(unique.size).toBe(8);
  });

  it("all 8 colorAdvice texts are unique", () => {
    const advices = ALL_IDS.map((id) => {
      const result = allResults.find((r) => r.id === id)!;
      return (result.detailedContent as TraditionalColorDetailedContent)
        .colorAdvice;
    });
    const unique = new Set(advices);
    expect(unique.size).toBe(8);
  });

  it("all 4 seasons are represented across 8 results", () => {
    const seasons = allResults.map(
      (r) => (r.detailedContent as TraditionalColorDetailedContent).season,
    );
    for (const season of VALID_SEASONS) {
      expect(seasons, `season "${season}" is not represented`).toContain(
        season,
      );
    }
  });
});

describe("traditional-color meta — resultPageLabels removed", () => {
  it("resultPageLabels is not set on meta", () => {
    expect(traditionalColorQuiz.meta.resultPageLabels).toBeUndefined();
  });
});

describe("traditional-color seoTitle", () => {
  it("meta has seoTitle set", () => {
    expect(traditionalColorQuiz.meta.seoTitle).toBeDefined();
    expect(traditionalColorQuiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains 心理テスト keyword", () => {
    const seoTitle = traditionalColorQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("心理テスト");
  });

  it("seoTitle contains 無料 keyword", () => {
    const seoTitle = traditionalColorQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("無料");
  });
});
