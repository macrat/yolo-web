/**
 * Tests for detailedContent on all 8 music-personality results.
 *
 * Types 1-4 (festival-pioneer, playlist-evangelist, solo-explorer, repeat-warrior)
 * use the new MusicPersonalityDetailedContent format:
 *   - variant: "music-personality"
 *   - catchphrase: 15-30 chars
 *   - strengths: 2 items, each non-empty
 *   - weaknesses: 2 items, each non-empty
 *   - behaviors: 4 items, each non-empty
 *   - todayAction: non-empty string
 *
 * Types 5-8 (bgm-craftsman, karaoke-healer, midnight-shuffle, lyrics-dweller)
 * still use the standard QuizResultDetailedContent format:
 *   - traits: 3-5 items, each non-empty
 *   - behaviors: 3-5 items, each non-empty
 *   - advice: non-empty string
 *
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import type { MusicPersonalityDetailedContent } from "../../types";
import musicPersonalityQuiz from "../music-personality";

const allResults = musicPersonalityQuiz.results;

/** IDs that have been converted to MusicPersonalityDetailedContent format */
const NEW_VARIANT_IDS = [
  "festival-pioneer",
  "playlist-evangelist",
  "solo-explorer",
  "repeat-warrior",
] as const;

/** IDs that use MusicPersonalityDetailedContent format (types 5-8 converted earlier) */
const LATER_VARIANT_IDS = [
  "bgm-craftsman",
  "karaoke-healer",
  "midnight-shuffle",
  "lyrics-dweller",
] as const;

describe("music-personality detailedContent — common", () => {
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

describe("music-personality detailedContent — new variant format (types 1-4)", () => {
  for (const id of NEW_VARIANT_IDS) {
    describe(`${id}`, () => {
      const result = allResults.find((r) => r.id === id)!;

      it('variant is "music-personality"', () => {
        expect(result.detailedContent?.variant).toBe("music-personality");
      });

      it("catchphrase is a non-empty string (15-30 chars)", () => {
        const dc = result.detailedContent as MusicPersonalityDetailedContent;
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

      it("strengths is an array of 2 non-empty strings", () => {
        const dc = result.detailedContent as MusicPersonalityDetailedContent;
        expect(Array.isArray(dc.strengths)).toBe(true);
        expect(dc.strengths.length).toBe(2);
        for (const s of dc.strengths) {
          expect(typeof s).toBe("string");
          expect(
            s.length,
            `${id}: each strength must be non-empty`,
          ).toBeGreaterThan(0);
        }
      });

      it("weaknesses is an array of 2 non-empty strings", () => {
        const dc = result.detailedContent as MusicPersonalityDetailedContent;
        expect(Array.isArray(dc.weaknesses)).toBe(true);
        expect(dc.weaknesses.length).toBe(2);
        for (const w of dc.weaknesses) {
          expect(typeof w).toBe("string");
          expect(
            w.length,
            `${id}: each weakness must be non-empty`,
          ).toBeGreaterThan(0);
        }
      });

      it("behaviors is an array of 4 non-empty strings", () => {
        const dc = result.detailedContent as MusicPersonalityDetailedContent;
        expect(Array.isArray(dc.behaviors)).toBe(true);
        expect(dc.behaviors.length).toBe(4);
        for (const b of dc.behaviors) {
          expect(typeof b).toBe("string");
          expect(
            b.length,
            `${id}: each behavior must be non-empty`,
          ).toBeGreaterThan(0);
        }
      });

      it("todayAction is a non-empty string", () => {
        const dc = result.detailedContent as MusicPersonalityDetailedContent;
        expect(typeof dc.todayAction).toBe("string");
        expect(
          dc.todayAction.length,
          `${id}: todayAction must be non-empty`,
        ).toBeGreaterThan(0);
      });

      it("does not have old-format fields (traits/advice)", () => {
        const dc = result.detailedContent as unknown as Record<string, unknown>;
        expect(dc["traits"]).toBeUndefined();
        expect(dc["advice"]).toBeUndefined();
      });
    });
  }

  it("all 4 catchphrases are unique", () => {
    const catchphrases = NEW_VARIANT_IDS.map((id) => {
      const result = allResults.find((r) => r.id === id)!;
      return (result.detailedContent as MusicPersonalityDetailedContent)
        .catchphrase;
    });
    const unique = new Set(catchphrases);
    expect(unique.size).toBe(4);
  });

  it("all 4 todayAction texts are unique", () => {
    const actions = NEW_VARIANT_IDS.map((id) => {
      const result = allResults.find((r) => r.id === id)!;
      return (result.detailedContent as MusicPersonalityDetailedContent)
        .todayAction;
    });
    const unique = new Set(actions);
    expect(unique.size).toBe(4);
  });
});

describe("music-personality detailedContent — new variant format (types 5-8)", () => {
  it("types 5-8 also use music-personality variant", () => {
    for (const id of LATER_VARIANT_IDS) {
      const result = allResults.find((r) => r.id === id)!;
      expect(result.detailedContent?.variant).toBe("music-personality");
    }
  });

  it("types 5-8 have catchphrase, strengths, weaknesses, behaviors, todayAction", () => {
    for (const id of LATER_VARIANT_IDS) {
      const result = allResults.find((r) => r.id === id)!;
      const dc = result.detailedContent as MusicPersonalityDetailedContent;
      expect(typeof dc.catchphrase).toBe("string");
      expect(dc.catchphrase.length).toBeGreaterThan(0);
      expect(Array.isArray(dc.strengths)).toBe(true);
      expect(dc.strengths.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(dc.weaknesses)).toBe(true);
      expect(dc.weaknesses.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(dc.behaviors)).toBe(true);
      expect(dc.behaviors.length).toBeGreaterThanOrEqual(3);
      expect(typeof dc.todayAction).toBe("string");
      expect(dc.todayAction.length).toBeGreaterThan(0);
    }
  });
});

describe("music-personality seoTitle", () => {
  it("meta has seoTitle set", () => {
    expect(musicPersonalityQuiz.meta.seoTitle).toBeDefined();
    expect(musicPersonalityQuiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains SEO keywords", () => {
    const seoTitle = musicPersonalityQuiz.meta.seoTitle!;
    // Should contain at least one of these important keywords
    const hasKeyword = /無料|性格診断|音楽|音楽診断|音楽性格/.test(seoTitle);
    expect(hasKeyword).toBe(true);
  });

  it("seoTitle contains 心理テスト keyword for better SEO", () => {
    const seoTitle = musicPersonalityQuiz.meta.seoTitle!;
    expect(seoTitle).toContain("心理テスト");
  });
});
