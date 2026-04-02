/**
 * Tests for animal-personality.ts — new variant format for the first 4 types.
 *
 * Validates that nihon-zaru, hondo-tanuki, nihon-kitsune, iriomote-yamaneko
 * have been converted to AnimalPersonalityDetailedContent format:
 *   - variant: "animal-personality"
 *   - catchphrase: 20-40 chars, non-empty
 *   - strengths: 2-3 items, each non-empty
 *   - weaknesses: 2-3 items, each non-empty
 *   - behaviors: 3-5 items, each non-empty
 *   - todayAction: non-empty string (concrete and actionable)
 *
 * Note: Types 5-8 (amami-kuro-usagi, yamane, nihon-momonga, nihon-kamoshika)
 * have been converted to new format in batch 2 (types 5-8).
 * Types 9-12 were converted in batch 3.
 * All 12 types now use the new animal-personality variant format.
 */
import { describe, it, expect } from "vitest";
import type { AnimalPersonalityDetailedContent } from "../../types";
import animalPersonalityQuiz from "../animal-personality";

const NEW_VARIANT_IDS = [
  "nihon-zaru",
  "hondo-tanuki",
  "nihon-kitsune",
  "iriomote-yamaneko",
] as const;

describe("animal-personality — new variant format (first 4 types)", () => {
  for (const id of NEW_VARIANT_IDS) {
    describe(`${id}`, () => {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id)!;

      it("detailedContent is defined", () => {
        expect(result.detailedContent).toBeDefined();
      });

      it('variant is "animal-personality"', () => {
        expect(result.detailedContent?.variant).toBe("animal-personality");
      });

      it("catchphrase is a non-empty string (20-40 chars)", () => {
        const dc = result.detailedContent as AnimalPersonalityDetailedContent;
        expect(typeof dc.catchphrase).toBe("string");
        expect(dc.catchphrase.length).toBeGreaterThanOrEqual(20);
        expect(dc.catchphrase.length).toBeLessThanOrEqual(40);
      });

      it("strengths is an array of 2-3 non-empty strings", () => {
        const dc = result.detailedContent as AnimalPersonalityDetailedContent;
        expect(Array.isArray(dc.strengths)).toBe(true);
        expect(dc.strengths.length).toBeGreaterThanOrEqual(2);
        expect(dc.strengths.length).toBeLessThanOrEqual(3);
        for (const s of dc.strengths) {
          expect(typeof s).toBe("string");
          expect(s.length).toBeGreaterThan(0);
        }
      });

      it("weaknesses is an array of 2-3 non-empty strings", () => {
        const dc = result.detailedContent as AnimalPersonalityDetailedContent;
        expect(Array.isArray(dc.weaknesses)).toBe(true);
        expect(dc.weaknesses.length).toBeGreaterThanOrEqual(2);
        expect(dc.weaknesses.length).toBeLessThanOrEqual(3);
        for (const w of dc.weaknesses) {
          expect(typeof w).toBe("string");
          expect(w.length).toBeGreaterThan(0);
        }
      });

      it("behaviors is an array of 3-5 non-empty strings", () => {
        const dc = result.detailedContent as AnimalPersonalityDetailedContent;
        expect(Array.isArray(dc.behaviors)).toBe(true);
        expect(dc.behaviors.length).toBeGreaterThanOrEqual(3);
        expect(dc.behaviors.length).toBeLessThanOrEqual(5);
        for (const b of dc.behaviors) {
          expect(typeof b).toBe("string");
          expect(b.length).toBeGreaterThan(0);
        }
      });

      it("todayAction is a non-empty string", () => {
        const dc = result.detailedContent as AnimalPersonalityDetailedContent;
        expect(typeof dc.todayAction).toBe("string");
        expect(dc.todayAction.length).toBeGreaterThan(0);
      });

      it("does not have old-format fields (traits/advice)", () => {
        const dc = result.detailedContent as unknown as Record<string, unknown>;
        expect(dc["traits"]).toBeUndefined();
        expect(dc["advice"]).toBeUndefined();
      });
    });
  }
});

describe("animal-personality — catchphrase uniqueness across new variants", () => {
  it("all 4 catchphrases are unique", () => {
    const catchphrases = NEW_VARIANT_IDS.map((id) => {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id)!;
      return (result.detailedContent as AnimalPersonalityDetailedContent)
        .catchphrase;
    });
    const unique = new Set(catchphrases);
    expect(unique.size).toBe(4);
  });
});

describe("animal-personality — todayAction quality (concrete, not template)", () => {
  it("todayAction texts are unique across the 4 new variants", () => {
    const actions = NEW_VARIANT_IDS.map((id) => {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id)!;
      return (result.detailedContent as AnimalPersonalityDetailedContent)
        .todayAction;
    });
    const unique = new Set(actions);
    expect(unique.size).toBe(4);
  });

  it("no todayAction is generic ('そのままでいい' pattern)", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id)!;
      const dc = result.detailedContent as AnimalPersonalityDetailedContent;
      expect(dc.todayAction.includes("そのままでいい")).toBe(false);
    }
  });
});
