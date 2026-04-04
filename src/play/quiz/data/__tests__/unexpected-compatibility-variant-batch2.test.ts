/**
 * Tests for the second 5 unexpected-compatibility results converted to
 * UnexpectedCompatibilityDetailedContent variant format.
 * Covers: benchpark, windchime, rainyday, cloudspecific, 404page
 *
 * Each result must have:
 *   - variant: "unexpected-compatibility"
 *   - catchphrase: 15-30 chars
 *   - entityEssence: 80-150 chars
 *   - whyCompatible: 80-150 chars
 *   - behaviors: exactly 4 items, each non-empty
 *   - lifeAdvice: 30-80 chars
 *   - no old-format fields (traits / advice)
 */
import { describe, it, expect } from "vitest";
import type { UnexpectedCompatibilityDetailedContent } from "../../types";
import unexpectedCompatibilityQuiz from "../unexpected-compatibility";

const allResults = unexpectedCompatibilityQuiz.results;

const BATCH2_IDS = [
  "benchpark",
  "windchime",
  "rainyday",
  "cloudspecific",
  "404page",
] as const;

describe("unexpected-compatibility detailedContent — batch2 results (new variant format)", () => {
  for (const id of BATCH2_IDS) {
    describe(`${id}`, () => {
      const result = allResults.find((r) => r.id === id)!;

      it("result exists", () => {
        expect(result).toBeDefined();
      });

      it('variant is "unexpected-compatibility"', () => {
        expect(result.detailedContent?.variant).toBe(
          "unexpected-compatibility",
        );
      });

      it("catchphrase is a string (15-30 chars)", () => {
        const dc =
          result.detailedContent as UnexpectedCompatibilityDetailedContent;
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

      it("entityEssence is a string (80-150 chars)", () => {
        const dc =
          result.detailedContent as UnexpectedCompatibilityDetailedContent;
        expect(typeof dc.entityEssence).toBe("string");
        expect(
          dc.entityEssence.length,
          `${id}: entityEssence too short (min 80)`,
        ).toBeGreaterThanOrEqual(80);
        expect(
          dc.entityEssence.length,
          `${id}: entityEssence too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      });

      it("whyCompatible is a string (80-150 chars)", () => {
        const dc =
          result.detailedContent as UnexpectedCompatibilityDetailedContent;
        expect(typeof dc.whyCompatible).toBe("string");
        expect(
          dc.whyCompatible.length,
          `${id}: whyCompatible too short (min 80)`,
        ).toBeGreaterThanOrEqual(80);
        expect(
          dc.whyCompatible.length,
          `${id}: whyCompatible too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      });

      it("behaviors is an array of exactly 4 non-empty strings", () => {
        const dc =
          result.detailedContent as UnexpectedCompatibilityDetailedContent;
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

      it("lifeAdvice is a string (30-80 chars)", () => {
        const dc =
          result.detailedContent as UnexpectedCompatibilityDetailedContent;
        expect(typeof dc.lifeAdvice).toBe("string");
        expect(
          dc.lifeAdvice.length,
          `${id}: lifeAdvice too short (min 30)`,
        ).toBeGreaterThanOrEqual(30);
        expect(
          dc.lifeAdvice.length,
          `${id}: lifeAdvice too long (max 80)`,
        ).toBeLessThanOrEqual(80);
      });

      it("does not have old-format fields (traits / advice)", () => {
        const dc = result.detailedContent as unknown as Record<string, unknown>;
        expect(dc["traits"]).toBeUndefined();
        expect(dc["advice"]).toBeUndefined();
      });
    });
  }

  it("windchime icon is 🎐 (U+1F390)", () => {
    const windchime = allResults.find((r) => r.id === "windchime")!;
    expect(windchime.icon).toBe("\u{1F390}");
  });

  it("all 5 catchphrases are unique", () => {
    const catchphrases = BATCH2_IDS.map((id) => {
      const result = allResults.find((r) => r.id === id)!;
      return (result.detailedContent as UnexpectedCompatibilityDetailedContent)
        .catchphrase;
    });
    const unique = new Set(catchphrases);
    expect(unique.size).toBe(5);
  });

  it("all 5 lifeAdvice texts are unique", () => {
    const advices = BATCH2_IDS.map((id) => {
      const result = allResults.find((r) => r.id === id)!;
      return (result.detailedContent as UnexpectedCompatibilityDetailedContent)
        .lifeAdvice;
    });
    const unique = new Set(advices);
    expect(unique.size).toBe(5);
  });
});
