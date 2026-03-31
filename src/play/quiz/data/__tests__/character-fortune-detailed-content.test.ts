/**
 * Tests for detailedContent on all 6 character-fortune results.
 *
 * All 6 results use CharacterFortuneDetailedContent (variant: "character-fortune").
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import type { CharacterFortuneDetailedContent } from "../../types";
import characterFortuneQuiz from "../character-fortune";

const allResults = characterFortuneQuiz.results;

/** All 6 IDs use CharacterFortuneDetailedContent */
const characterFortuneIds = new Set([
  "commander",
  "professor",
  "dreamer",
  "trickster",
  "artist",
  "guardian",
]);

/** Results using CharacterFortuneDetailedContent */
const characterFortuneResults = allResults.filter((r) =>
  characterFortuneIds.has(r.id),
);

describe("character-fortune detailedContent", () => {
  it("all 6 results exist", () => {
    expect(allResults.length).toBe(6);
  });

  it("every result has detailedContent", () => {
    for (const result of allResults) {
      expect(
        result.detailedContent,
        `${result.id} is missing detailedContent`,
      ).toBeDefined();
    }
  });

  // --- CharacterFortuneDetailedContent: variant check ---

  it("all 6 results have variant = 'character-fortune'", () => {
    for (const result of characterFortuneResults) {
      expect(
        result.detailedContent?.variant,
        `${result.id}: variant must be 'character-fortune'`,
      ).toBe("character-fortune");
    }
  });

  // --- All 6 characters: full field validation ---

  it("all 6 characters: characterIntro is non-empty and 20-80 chars", () => {
    for (const result of characterFortuneResults) {
      const dc = result.detailedContent as CharacterFortuneDetailedContent;
      expect(
        dc.characterIntro.length,
        `${result.id}: characterIntro must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        dc.characterIntro.length,
        `${result.id}: characterIntro must be 20-80 chars`,
      ).toBeGreaterThanOrEqual(20);
      expect(
        dc.characterIntro.length,
        `${result.id}: characterIntro must be 20-80 chars`,
      ).toBeLessThanOrEqual(80);
    }
  });

  it("all 6 characters: behaviorsHeading is non-empty and 5-30 chars", () => {
    for (const result of characterFortuneResults) {
      const dc = result.detailedContent as CharacterFortuneDetailedContent;
      expect(
        dc.behaviorsHeading.length,
        `${result.id}: behaviorsHeading must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        dc.behaviorsHeading.length,
        `${result.id}: behaviorsHeading must be 5-30 chars`,
      ).toBeGreaterThanOrEqual(5);
      expect(
        dc.behaviorsHeading.length,
        `${result.id}: behaviorsHeading must be 5-30 chars`,
      ).toBeLessThanOrEqual(30);
    }
  });

  it("all 6 characters: behaviors has 3-5 items, each 10-150 chars", () => {
    for (const result of characterFortuneResults) {
      const dc = result.detailedContent as CharacterFortuneDetailedContent;
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
          `${result.id}: each behavior must be 10-150 chars`,
        ).toBeGreaterThanOrEqual(10);
        expect(
          behavior.length,
          `${result.id}: each behavior must be 10-150 chars`,
        ).toBeLessThanOrEqual(150);
      }
    }
  });

  it("all 6 characters: characterMessageHeading is non-empty and 5-30 chars", () => {
    for (const result of characterFortuneResults) {
      const dc = result.detailedContent as CharacterFortuneDetailedContent;
      expect(
        dc.characterMessageHeading.length,
        `${result.id}: characterMessageHeading must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        dc.characterMessageHeading.length,
        `${result.id}: characterMessageHeading must be 5-30 chars`,
      ).toBeGreaterThanOrEqual(5);
      expect(
        dc.characterMessageHeading.length,
        `${result.id}: characterMessageHeading must be 5-30 chars`,
      ).toBeLessThanOrEqual(30);
    }
  });

  it("all 6 characters: characterMessage is non-empty and 150-400 chars", () => {
    for (const result of characterFortuneResults) {
      const dc = result.detailedContent as CharacterFortuneDetailedContent;
      expect(
        dc.characterMessage.length,
        `${result.id}: characterMessage must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        dc.characterMessage.length,
        `${result.id}: characterMessage must be 150-400 chars`,
      ).toBeGreaterThanOrEqual(150);
      expect(
        dc.characterMessage.length,
        `${result.id}: characterMessage must be 150-400 chars`,
      ).toBeLessThanOrEqual(400);
    }
  });

  it("all 6 characters: thirdPartyNote is non-empty and 80-200 chars", () => {
    for (const result of characterFortuneResults) {
      const dc = result.detailedContent as CharacterFortuneDetailedContent;
      expect(
        dc.thirdPartyNote.length,
        `${result.id}: thirdPartyNote must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        dc.thirdPartyNote.length,
        `${result.id}: thirdPartyNote must be 80-200 chars`,
      ).toBeGreaterThanOrEqual(80);
      expect(
        dc.thirdPartyNote.length,
        `${result.id}: thirdPartyNote must be 80-200 chars`,
      ).toBeLessThanOrEqual(200);
    }
  });

  it("all 6 characters: compatibilityPrompt is non-empty and 20-80 chars", () => {
    for (const result of characterFortuneResults) {
      const dc = result.detailedContent as CharacterFortuneDetailedContent;
      expect(
        dc.compatibilityPrompt.length,
        `${result.id}: compatibilityPrompt must be non-empty`,
      ).toBeGreaterThan(0);
      expect(
        dc.compatibilityPrompt.length,
        `${result.id}: compatibilityPrompt must be 20-80 chars`,
      ).toBeGreaterThanOrEqual(20);
      expect(
        dc.compatibilityPrompt.length,
        `${result.id}: compatibilityPrompt must be 20-80 chars`,
      ).toBeLessThanOrEqual(80);
    }
  });
});

describe("character-fortune seoTitle", () => {
  it("meta has seoTitle set", () => {
    expect(characterFortuneQuiz.meta.seoTitle).toBeDefined();
    expect(characterFortuneQuiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains SEO keywords", () => {
    const seoTitle = characterFortuneQuiz.meta.seoTitle!;
    // Should contain at least one of these important keywords
    const hasKeyword =
      /無料|性格診断|守護キャラ|キャラ診断|キャラクター診断/.test(seoTitle);
    expect(hasKeyword).toBe(true);
  });
});
