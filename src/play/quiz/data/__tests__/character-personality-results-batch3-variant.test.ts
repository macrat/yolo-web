/**
 * Tests for character-personality-results-batch3 (4 types: #21–#24)
 * converted to CharacterPersonalityDetailedContent variant format.
 *
 * Each result must have:
 *   - variant: "character-personality"
 *   - catchphrase: 15-30 chars
 *   - archetypeBreakdown: 80-150 chars
 *   - behaviors: exactly 4 items, each non-empty
 *   - characterMessage: 50-200 chars
 *   - no old-format fields (traits / advice)
 */
import { describe, it, expect } from "vitest";
import type { CharacterPersonalityDetailedContent } from "../../types";
import { resultsBatch3 } from "../character-personality-results-batch3";

const BATCH3_IDS = [
  "ultimate-artist",
  "data-fortress",
  "vibe-rebel",
  "guardian-charger",
] as const;

describe("character-personality-results-batch3 (new variant format)", () => {
  it("contains exactly 4 characters", () => {
    expect(resultsBatch3.length).toBe(4);
  });

  it("has the correct IDs in order", () => {
    const ids = resultsBatch3.map((r) => r.id);
    expect(ids).toEqual([...BATCH3_IDS]);
  });

  for (const id of BATCH3_IDS) {
    describe(id, () => {
      const result = resultsBatch3.find((r) => r.id === id)!;

      it("result exists", () => {
        expect(result).toBeDefined();
      });

      it('variant is "character-personality"', () => {
        expect(result.detailedContent?.variant).toBe("character-personality");
      });

      it("catchphrase is a string (15-30 chars)", () => {
        const dc =
          result.detailedContent as CharacterPersonalityDetailedContent;
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

      it("archetypeBreakdown is a string (80-150 chars)", () => {
        const dc =
          result.detailedContent as CharacterPersonalityDetailedContent;
        expect(typeof dc.archetypeBreakdown).toBe("string");
        expect(
          dc.archetypeBreakdown.length,
          `${id}: archetypeBreakdown too short (min 80)`,
        ).toBeGreaterThanOrEqual(80);
        expect(
          dc.archetypeBreakdown.length,
          `${id}: archetypeBreakdown too long (max 150)`,
        ).toBeLessThanOrEqual(150);
      });

      it("behaviors is an array of exactly 4 non-empty strings", () => {
        const dc =
          result.detailedContent as CharacterPersonalityDetailedContent;
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

      it("characterMessage is a string (50-200 chars)", () => {
        const dc =
          result.detailedContent as CharacterPersonalityDetailedContent;
        expect(typeof dc.characterMessage).toBe("string");
        expect(
          dc.characterMessage.length,
          `${id}: characterMessage too short (min 50)`,
        ).toBeGreaterThanOrEqual(50);
        expect(
          dc.characterMessage.length,
          `${id}: characterMessage too long (max 200)`,
        ).toBeLessThanOrEqual(200);
      });

      it("does not have old-format fields (traits / advice)", () => {
        const dc = result.detailedContent as unknown as Record<string, unknown>;
        expect(dc["traits"]).toBeUndefined();
        expect(dc["advice"]).toBeUndefined();
      });
    });
  }

  it("all catchphrases are unique", () => {
    const catchphrases = resultsBatch3.map((r) => {
      return (r.detailedContent as CharacterPersonalityDetailedContent)
        .catchphrase;
    });
    const unique = new Set(catchphrases);
    expect(unique.size).toBe(4);
  });

  it("all characterMessages are unique", () => {
    const messages = resultsBatch3.map((r) => {
      return (r.detailedContent as CharacterPersonalityDetailedContent)
        .characterMessage;
    });
    const unique = new Set(messages);
    expect(unique.size).toBe(4);
  });
});
