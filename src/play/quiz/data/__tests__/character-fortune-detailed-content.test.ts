/**
 * Tests for detailedContent on all 6 character-fortune results.
 *
 * commander, professor, dreamer, trickster, artist use CharacterFortuneDetailedContent
 * (variant: "character-fortune").
 * All 6 results now use CharacterFortuneDetailedContent (guardian migrated).
 *
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import type {
  QuizResultDetailedContent,
  CharacterFortuneDetailedContent,
} from "../../types";
import characterFortuneQuiz from "../character-fortune";

const allResults = characterFortuneQuiz.results;

/** IDs that use CharacterFortuneDetailedContent */
const characterFortuneIds = new Set([
  "commander",
  "professor",
  "dreamer",
  "trickster",
  "artist",
  "guardian",
]);

/** Results using the standard QuizResultDetailedContent format */
const standardResults = allResults.filter(
  (r) => !characterFortuneIds.has(r.id),
);

/** Results using CharacterFortuneDetailedContent */
const characterFortuneResults = allResults.filter((r) =>
  characterFortuneIds.has(r.id),
);

/** The commander result using CharacterFortuneDetailedContent */
const commanderResult = allResults.find((r) => r.id === "commander")!;

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

  // --- CharacterFortuneDetailedContent results: variant check ---

  it("commander/professor/dreamer/trickster/artist have variant = 'character-fortune'", () => {
    for (const result of characterFortuneResults) {
      expect(
        result.detailedContent?.variant,
        `${result.id}: variant must be 'character-fortune'`,
      ).toBe("character-fortune");
    }
  });

  it("CharacterFortune results: behaviors has 3-5 items, each 10-150 chars", () => {
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

  // --- commander: CharacterFortuneDetailedContent (detailed) ---

  describe("commander (CharacterFortuneDetailedContent)", () => {
    it("has variant = 'character-fortune'", () => {
      expect(commanderResult.detailedContent?.variant).toBe(
        "character-fortune",
      );
    });

    it("characterIntro is 20-80 chars", () => {
      const dc =
        commanderResult.detailedContent as CharacterFortuneDetailedContent;
      expect(dc.characterIntro.length).toBeGreaterThanOrEqual(20);
      expect(dc.characterIntro.length).toBeLessThanOrEqual(80);
    });

    it("behaviorsHeading is 5-30 chars", () => {
      const dc =
        commanderResult.detailedContent as CharacterFortuneDetailedContent;
      expect(dc.behaviorsHeading.length).toBeGreaterThanOrEqual(5);
      expect(dc.behaviorsHeading.length).toBeLessThanOrEqual(30);
    });

    it("behaviors has 3-5 items, each 10-150 chars", () => {
      const dc =
        commanderResult.detailedContent as CharacterFortuneDetailedContent;
      expect(dc.behaviors.length).toBeGreaterThanOrEqual(3);
      expect(dc.behaviors.length).toBeLessThanOrEqual(5);
      for (const behavior of dc.behaviors) {
        expect(behavior.length).toBeGreaterThanOrEqual(10);
        expect(behavior.length).toBeLessThanOrEqual(150);
      }
    });

    it("characterMessageHeading is 5-30 chars", () => {
      const dc =
        commanderResult.detailedContent as CharacterFortuneDetailedContent;
      expect(dc.characterMessageHeading.length).toBeGreaterThanOrEqual(5);
      expect(dc.characterMessageHeading.length).toBeLessThanOrEqual(30);
    });

    it("characterMessage is 150-400 chars", () => {
      const dc =
        commanderResult.detailedContent as CharacterFortuneDetailedContent;
      expect(dc.characterMessage.length).toBeGreaterThanOrEqual(150);
      expect(dc.characterMessage.length).toBeLessThanOrEqual(400);
    });

    it("thirdPartyNote is 80-200 chars", () => {
      const dc =
        commanderResult.detailedContent as CharacterFortuneDetailedContent;
      expect(dc.thirdPartyNote.length).toBeGreaterThanOrEqual(80);
      expect(dc.thirdPartyNote.length).toBeLessThanOrEqual(200);
    });

    it("compatibilityPrompt is 20-80 chars", () => {
      const dc =
        commanderResult.detailedContent as CharacterFortuneDetailedContent;
      expect(dc.compatibilityPrompt.length).toBeGreaterThanOrEqual(20);
      expect(dc.compatibilityPrompt.length).toBeLessThanOrEqual(80);
    });
  });

  // --- standard results (guardian): QuizResultDetailedContent ---

  it("standard results: traits has 3-5 items and each is non-empty", () => {
    for (const result of standardResults) {
      const { traits } = result.detailedContent! as QuizResultDetailedContent;
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

  it("standard results: behaviors has 3-5 items and each is non-empty", () => {
    for (const result of standardResults) {
      const { behaviors } =
        result.detailedContent! as QuizResultDetailedContent;
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

  it("standard results: advice is a non-empty string", () => {
    for (const result of standardResults) {
      const { advice } = result.detailedContent! as QuizResultDetailedContent;
      expect(
        advice.length,
        `${result.id}: advice must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("standard results: traits items are reasonably sized (5-150 chars each)", () => {
    for (const result of standardResults) {
      for (const trait of (result.detailedContent! as QuizResultDetailedContent)
        .traits) {
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

  it("standard results: behaviors items are reasonably sized (10-150 chars each)", () => {
    for (const result of standardResults) {
      for (const behavior of (
        result.detailedContent! as QuizResultDetailedContent
      ).behaviors) {
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

  it("standard results: advice is reasonably sized (10-200 chars)", () => {
    for (const result of standardResults) {
      const { advice } = result.detailedContent! as QuizResultDetailedContent;
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
