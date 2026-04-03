/**
 * Tests for the first 4 yoji-personality results converted to YojiPersonalityDetailedContent variant format.
 * Covers: shoshikantetsu, tenshinranman, sessatakuma, ichigoichie
 *
 * Each result must have:
 *   - variant: "yoji-personality"
 *   - catchphrase: 15-30 chars
 *   - kanjiBreakdown: 80-150 chars
 *   - origin: 80-150 chars
 *   - behaviors: exactly 4 items, each non-empty
 *   - motto: 20-80 chars
 *   - no old-format fields (traits / advice)
 */
import { describe, it, expect } from "vitest";
import type { YojiPersonalityDetailedContent } from "../../types";
import yojiPersonalityQuiz from "../yoji-personality";

const allResults = yojiPersonalityQuiz.results;

const FIRST4_IDS = [
  "shoshikantetsu",
  "tenshinranman",
  "sessatakuma",
  "ichigoichie",
] as const;

describe("yoji-personality detailedContent — first 4 results (new variant format)", () => {
  for (const id of FIRST4_IDS) {
    describe(`${id}`, () => {
      const result = allResults.find((r) => r.id === id)!;

      it("result exists", () => {
        expect(result).toBeDefined();
      });

      it('variant is "yoji-personality"', () => {
        expect(result.detailedContent?.variant).toBe("yoji-personality");
      });

      it("catchphrase is a string (15-30 chars)", () => {
        const dc = result.detailedContent as YojiPersonalityDetailedContent;
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

      it("kanjiBreakdown is a string (80-150 chars)", () => {
        const dc = result.detailedContent as YojiPersonalityDetailedContent;
        expect(typeof dc.kanjiBreakdown).toBe("string");
        expect(
          dc.kanjiBreakdown.length,
          `${id}: kanjiBreakdown too short (min 80)`,
        ).toBeGreaterThanOrEqual(80);
        expect(
          dc.kanjiBreakdown.length,
          `${id}: kanjiBreakdown too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      });

      it("origin is a string (80-150 chars)", () => {
        const dc = result.detailedContent as YojiPersonalityDetailedContent;
        expect(typeof dc.origin).toBe("string");
        expect(
          dc.origin.length,
          `${id}: origin too short (min 80)`,
        ).toBeGreaterThanOrEqual(80);
        expect(
          dc.origin.length,
          `${id}: origin too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      });

      it("behaviors is an array of exactly 4 non-empty strings", () => {
        const dc = result.detailedContent as YojiPersonalityDetailedContent;
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

      it("motto is a string (20-80 chars)", () => {
        const dc = result.detailedContent as YojiPersonalityDetailedContent;
        expect(typeof dc.motto).toBe("string");
        expect(
          dc.motto.length,
          `${id}: motto too short (min 20)`,
        ).toBeGreaterThanOrEqual(20);
        expect(
          dc.motto.length,
          `${id}: motto too long (max 80)`,
        ).toBeLessThanOrEqual(80);
      });

      it("does not have old-format fields (traits / advice)", () => {
        const dc = result.detailedContent as unknown as Record<string, unknown>;
        expect(dc["traits"]).toBeUndefined();
        expect(dc["advice"]).toBeUndefined();
      });
    });
  }

  it("all 4 catchphrases are unique", () => {
    const catchphrases = FIRST4_IDS.map((id) => {
      const result = allResults.find((r) => r.id === id)!;
      return (result.detailedContent as YojiPersonalityDetailedContent)
        .catchphrase;
    });
    const unique = new Set(catchphrases);
    expect(unique.size).toBe(4);
  });

  it("all 4 mottos are unique", () => {
    const mottos = FIRST4_IDS.map((id) => {
      const result = allResults.find((r) => r.id === id)!;
      return (result.detailedContent as YojiPersonalityDetailedContent).motto;
    });
    const unique = new Set(mottos);
    expect(unique.size).toBe(4);
  });
});
