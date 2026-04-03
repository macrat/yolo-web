/**
 * Tests for detailedContent on all 24 character-personality results.
 *
 * Batch1 (#1-#10) and Batch3 (#21-#24) use the CharacterPersonalityDetailedContent variant format.
 * Batch2 (#11-#20) is partially migrated; the remaining standard-format items are tested here.
 *
 * Common tests (all 24): every result must have detailedContent with behaviors.
 * Standard-format tests (batch2 remaining only): traits and advice must be present and valid.
 * Variant-format tests (batch1 + batch3): variant, catchphrase, archetypeBreakdown, characterMessage must be present.
 */
import { describe, it, expect } from "vitest";
import { resultsBatch1 } from "../character-personality-results-batch1";
import { resultsBatch2 } from "../character-personality-results-batch2";
import { resultsBatch3 } from "../character-personality-results-batch3";

const allResults = [...resultsBatch1, ...resultsBatch2, ...resultsBatch3];
// Batch2 items that still use the standard format (traits + advice).
const standardFormatResults = resultsBatch2.filter((r) => {
  const dc = r.detailedContent as { variant?: string };
  return !dc.variant;
});
// Batch1 and batch3 have fully migrated to the CharacterPersonalityDetailedContent variant format.
const variantFormatResults = [...resultsBatch1, ...resultsBatch3];

describe("character-personality detailedContent", () => {
  it("all 24 results exist", () => {
    expect(allResults.length).toBe(24);
  });

  it("every result has detailedContent", () => {
    for (const result of allResults) {
      expect(
        result.detailedContent,
        `${result.id} is missing detailedContent`,
      ).toBeDefined();
    }
  });

  it("traits has 3-5 items and each is non-empty (standard format only — none currently)", () => {
    for (const result of standardFormatResults) {
      const dc = result.detailedContent as unknown as { traits: string[] };
      const { traits } = dc;
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
      const { behaviors } = result.detailedContent!;
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

  it("advice is a non-empty string (standard format only — none currently)", () => {
    for (const result of standardFormatResults) {
      const dc = result.detailedContent as unknown as { advice: string };
      const { advice } = dc;
      expect(
        advice.length,
        `${result.id}: advice must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("traits items are reasonably sized (5-150 chars each, standard format only — none currently)", () => {
    for (const result of standardFormatResults) {
      const dc = result.detailedContent as unknown as { traits: string[] };
      for (const trait of dc.traits) {
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
      for (const behavior of result.detailedContent!.behaviors) {
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

  it("advice is reasonably sized (10-200 chars, standard format only — none currently)", () => {
    for (const result of standardFormatResults) {
      const dc = result.detailedContent as unknown as { advice: string };
      const { advice } = dc;
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

  it("variant-format results (all batches) have variant='character-personality'", () => {
    for (const result of variantFormatResults) {
      const dc = result.detailedContent as { variant?: string };
      expect(
        dc.variant,
        `${result.id}: variant must be 'character-personality'`,
      ).toBe("character-personality");
    }
  });

  it("variant-format results (all batches) have catchphrase of 15-30 chars", () => {
    for (const result of variantFormatResults) {
      const dc = result.detailedContent as { catchphrase?: string };
      expect(
        dc.catchphrase,
        `${result.id}: catchphrase must be defined`,
      ).toBeDefined();
      expect(
        dc.catchphrase!.length,
        `${result.id}: catchphrase must be 15-30 chars`,
      ).toBeGreaterThanOrEqual(15);
      expect(
        dc.catchphrase!.length,
        `${result.id}: catchphrase must be 15-30 chars`,
      ).toBeLessThanOrEqual(30);
    }
  });

  it("variant-format results (all batches) have archetypeBreakdown of 80-150 chars", () => {
    for (const result of variantFormatResults) {
      const dc = result.detailedContent as { archetypeBreakdown?: string };
      expect(
        dc.archetypeBreakdown,
        `${result.id}: archetypeBreakdown must be defined`,
      ).toBeDefined();
      expect(
        dc.archetypeBreakdown!.length,
        `${result.id}: archetypeBreakdown must be 80-150 chars`,
      ).toBeGreaterThanOrEqual(80);
      expect(
        dc.archetypeBreakdown!.length,
        `${result.id}: archetypeBreakdown must be 150 chars or fewer`,
      ).toBeLessThanOrEqual(150);
    }
  });

  it("variant-format results (all batches) have characterMessage of 50-200 chars", () => {
    for (const result of variantFormatResults) {
      const dc = result.detailedContent as { characterMessage?: string };
      expect(
        dc.characterMessage,
        `${result.id}: characterMessage must be defined`,
      ).toBeDefined();
      expect(
        dc.characterMessage!.length,
        `${result.id}: characterMessage must be 50-200 chars`,
      ).toBeGreaterThanOrEqual(50);
      expect(
        dc.characterMessage!.length,
        `${result.id}: characterMessage must be 200 chars or fewer`,
      ).toBeLessThanOrEqual(200);
    }
  });
});

describe("character-personality seoTitle", () => {
  it("meta has seoTitle set", async () => {
    const mod = await import("../character-personality");
    const quiz = mod.default;
    expect(quiz.meta.seoTitle).toBeDefined();
    expect(quiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains SEO keywords", async () => {
    const mod = await import("../character-personality");
    const quiz = mod.default;
    const seoTitle = quiz.meta.seoTitle!;
    // Should contain at least one of these important keywords
    const hasKeyword = /無料|性格診断|キャラクター|キャラ診断|心理テスト/.test(
      seoTitle,
    );
    expect(hasKeyword).toBe(true);
  });
});
