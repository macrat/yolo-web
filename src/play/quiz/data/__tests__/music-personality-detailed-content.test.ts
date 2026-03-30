/**
 * Tests for detailedContent on all 8 music-personality results.
 * Each result must have a valid detailedContent with:
 *   - traits: 3-5 items, each non-empty
 *   - behaviors: 3-5 items, each non-empty
 *   - advice: non-empty string
 * Also verifies seoTitle is set on meta.
 */
import { describe, it, expect } from "vitest";
import musicPersonalityQuiz from "../music-personality";

const allResults = musicPersonalityQuiz.results;

describe("music-personality detailedContent", () => {
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

  it("traits has 3-5 items and each is non-empty", () => {
    for (const result of allResults) {
      const { traits } = result.detailedContent!;
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

  it("advice is a non-empty string", () => {
    for (const result of allResults) {
      const { advice } = result.detailedContent!;
      expect(
        advice.length,
        `${result.id}: advice must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("traits items are reasonably sized (5-150 chars each)", () => {
    for (const result of allResults) {
      for (const trait of result.detailedContent!.traits) {
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

  it("advice is reasonably sized (10-200 chars)", () => {
    for (const result of allResults) {
      const { advice } = result.detailedContent!;
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

  it("behaviors do not use purely explanatory phrasing (should use scene descriptions)", () => {
    // Check that the specifically-flagged behaviors have been updated to scene descriptions.
    // These were identified as overly explanatory in the review.
    const flaggedPhrases = [
      // playlist-evangelist: old explanatory phrase
      "自分の布教プレイリストが友達のヘビロテになった日の達成感が、ちょっとした生きがいになっている",
      // repeat-warrior: old explanatory phrase
      "好きなアーティストのライブに何度も通って、セットリストの変化を記録している",
      // karaoke-healer: old explanatory phrases
      "初めて会う人のカラオケの選曲を見て、「この人はこういう感じか」と人となりを把握する",
      "好きな曲より「この場で盛り上がる曲」を優先して入力してしまう自分に気づくことがある",
      // lyrics-dweller: old explanatory phrases
      "歌詞カードを見ながら聴くのが正しいリスニングスタイルだと信じている",
      "SNSの投稿で「最近刺さった歌詞」を共有したくなる衝動を、週に3回は感じる",
    ];

    for (const result of allResults) {
      for (const behavior of result.detailedContent!.behaviors) {
        for (const phrase of flaggedPhrases) {
          expect(
            behavior,
            `${result.id}: behavior should not contain old explanatory phrase: "${phrase}"`,
          ).not.toContain(phrase);
        }
      }
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
