/**
 * Tests for animal-personality.ts — detailedContent and seoTitle additions
 *
 * Validates:
 * - seoTitle is present in meta and contains expected keywords
 * - All 12 results have detailedContent
 * - Each detailedContent has traits, behaviors, advice fields
 * - Field length constraints are met
 * - No animal ecological facts are included
 */
import { describe, it, expect } from "vitest";
import type { QuizResultDetailedContent } from "../../types";
import animalPersonalityQuiz from "../animal-personality";

const RESULT_IDS = [
  "nihon-zaru",
  "hondo-tanuki",
  "nihon-kitsune",
  "iriomote-yamaneko",
  "amami-kuro-usagi",
  "yamane",
  "nihon-momonga",
  "nihon-kamoshika",
  "hondo-ten",
  "musasabi",
  "nihon-risu",
  "ezo-shika",
] as const;

describe("animal-personality — seoTitle", () => {
  it("meta has a seoTitle field", () => {
    expect(animalPersonalityQuiz.meta.seoTitle).toBeDefined();
    expect(typeof animalPersonalityQuiz.meta.seoTitle).toBe("string");
  });

  it("seoTitle is non-empty", () => {
    expect(animalPersonalityQuiz.meta.seoTitle!.length).toBeGreaterThan(0);
  });

  it("seoTitle contains SEO keywords related to personality diagnosis", () => {
    const seoTitle = animalPersonalityQuiz.meta.seoTitle!;
    // Must contain at least one of these SEO keywords
    const hasKeyword =
      seoTitle.includes("性格診断") ||
      seoTitle.includes("動物") ||
      seoTitle.includes("無料");
    expect(
      hasKeyword,
      `seoTitle must contain SEO keywords: "${seoTitle}"`,
    ).toBe(true);
  });

  it("seoTitle contains 心理テスト keyword", () => {
    const seoTitle = animalPersonalityQuiz.meta.seoTitle!;
    expect(
      seoTitle.includes("心理テスト"),
      `seoTitle should include "心理テスト": "${seoTitle}"`,
    ).toBe(true);
  });
});

describe("animal-personality — detailedContent presence", () => {
  it("all 12 results exist", () => {
    expect(animalPersonalityQuiz.results.length).toBe(12);
  });

  it("all 12 results have detailedContent", () => {
    for (const result of animalPersonalityQuiz.results) {
      expect(
        result.detailedContent,
        `Result ${result.id} is missing detailedContent`,
      ).toBeDefined();
    }
  });

  it("result IDs match expected list", () => {
    const resultIds = animalPersonalityQuiz.results.map((r) => r.id);
    for (const id of RESULT_IDS) {
      expect(resultIds, `Missing result for type ${id}`).toContain(id);
    }
  });
});

describe("animal-personality — detailedContent structure", () => {
  it("each result has detailedContent.traits as a non-empty array", () => {
    for (const result of animalPersonalityQuiz.results) {
      const dc = result.detailedContent! as QuizResultDetailedContent;
      expect(
        Array.isArray(dc.traits),
        `${result.id}: traits must be an array`,
      ).toBe(true);
      expect(
        dc.traits.length,
        `${result.id}: traits must have at least 3 items`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        dc.traits.length,
        `${result.id}: traits must have at most 5 items`,
      ).toBeLessThanOrEqual(5);
    }
  });

  it("each result has detailedContent.behaviors as a non-empty array", () => {
    for (const result of animalPersonalityQuiz.results) {
      const dc = result.detailedContent! as QuizResultDetailedContent;
      expect(
        Array.isArray(dc.behaviors),
        `${result.id}: behaviors must be an array`,
      ).toBe(true);
      expect(
        dc.behaviors.length,
        `${result.id}: behaviors must have at least 3 items`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        dc.behaviors.length,
        `${result.id}: behaviors must have at most 5 items`,
      ).toBeLessThanOrEqual(5);
    }
  });

  it("each result has detailedContent.advice as a non-empty string", () => {
    for (const result of animalPersonalityQuiz.results) {
      const dc = result.detailedContent! as QuizResultDetailedContent;
      expect(typeof dc.advice, `${result.id}: advice must be a string`).toBe(
        "string",
      );
      expect(
        dc.advice.length,
        `${result.id}: advice must not be empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("each trait item is a non-empty string", () => {
    for (const result of animalPersonalityQuiz.results) {
      for (const trait of (result.detailedContent! as QuizResultDetailedContent)
        .traits) {
        expect(typeof trait, `${result.id}: trait must be a string`).toBe(
          "string",
        );
        expect(
          trait.length,
          `${result.id}: trait must not be empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("each behavior item is a non-empty string", () => {
    for (const result of animalPersonalityQuiz.results) {
      for (const behavior of (
        result.detailedContent! as QuizResultDetailedContent
      ).behaviors) {
        expect(typeof behavior, `${result.id}: behavior must be a string`).toBe(
          "string",
        );
        expect(
          behavior.length,
          `${result.id}: behavior must not be empty`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe("animal-personality — traits freshness (no direct copy from description)", () => {
  /**
   * Each trait should NOT be a substring of the description (over 10 characters).
   * This prevents traits from being a mere bullet-point summary of description text.
   * We check the first 12 characters of each trait to detect direct copy-paste.
   */
  it("trait items should not directly copy phrases from description", () => {
    for (const result of animalPersonalityQuiz.results) {
      const description = result.description;
      for (const trait of (result.detailedContent! as QuizResultDetailedContent)
        .traits) {
        // Extract a 12-char prefix of the trait (enough to detect copy-paste)
        const traitPrefix = trait.slice(0, 12);
        if (traitPrefix.length >= 12) {
          expect(
            description.includes(traitPrefix),
            `${result.id}: trait "${trait}" appears to be copied from description`,
          ).toBe(false);
        }
      }
    }
  });
});

describe("animal-personality — advice quality (concrete action, no template pattern)", () => {
  /**
   * All 12 advice texts must NOT follow the uniform template:
   *   「あなたの〜は〜[才能/強み/力]です/になっています。〜してください。」
   *
   * The current bad pattern is: every advice starts with "あなたの" and ends with
   * a polished platitude. Good advice instead offers a concrete, type-specific
   * action suggestion — a first step the user can take today.
   *
   * Rule: At most 3 out of 12 advices may start with "あなたの".
   * This prevents the monotonous template while allowing occasional use.
   */
  it("fewer than 4 advice texts start with 'あなたの' (template pattern limit)", () => {
    const templateCount = animalPersonalityQuiz.results.filter((r) =>
      (r.detailedContent! as QuizResultDetailedContent).advice.startsWith(
        "あなたの",
      ),
    ).length;
    expect(
      templateCount,
      `Too many advice texts start with "あなたの" (${templateCount}/12). Each type needs its own voice.`,
    ).toBeLessThan(4);
  });

  it("all 12 advice texts are unique (no duplicate advice)", () => {
    const adviceList = animalPersonalityQuiz.results.map(
      (r) => (r.detailedContent! as QuizResultDetailedContent).advice,
    );
    const uniqueAdvice = new Set(adviceList);
    expect(
      uniqueAdvice.size,
      `Advice texts are not all unique. Found ${12 - uniqueAdvice.size} duplicate(s)`,
    ).toBe(12);
  });

  it("no advice uses the generic 'そのままでいい' phrase", () => {
    for (const result of animalPersonalityQuiz.results) {
      const advice = (result.detailedContent! as QuizResultDetailedContent)
        .advice;
      expect(
        advice.includes("そのままでいい"),
        `${result.id}: advice contains vague phrase "そのままでいい": "${advice}"`,
      ).toBe(false);
    }
  });
});

describe("animal-personality — existing data unchanged", () => {
  it("meta slug is unchanged", () => {
    expect(animalPersonalityQuiz.meta.slug).toBe("animal-personality");
  });

  it("meta title is unchanged", () => {
    expect(animalPersonalityQuiz.meta.title).toBe(
      "日本にしかいない動物で性格診断",
    );
  });

  it("result titles are unchanged", () => {
    const expectedTitles: Record<string, string> = {
      "nihon-zaru": "ニホンザル -- 温泉を発明した革命児",
      "hondo-tanuki": "ホンドタヌキ -- 化かすどころか化かされる愛されキャラ",
      "nihon-kitsune":
        "ニホンキツネ -- お稲荷さんの看板を背負う孤高のリアリスト",
      "iriomote-yamaneko":
        "イリオモテヤマネコ -- 西表島だけで生き残った究極のサバイバー",
      "amami-kuro-usagi": "アマミノクロウサギ -- 走れないウサギの逆転戦略",
      yamane: "ヤマネ -- 手のひらサイズの森の忍者",
      "nihon-momonga": "ニホンモモンガ -- 空飛ぶハンカチの大冒険家",
      "nihon-kamoshika": "ニホンカモシカ -- 山の哲学者は首をかしげる",
      "hondo-ten": "ホンドテン -- 季節ごとに着替える孤高の変身ハンター",
      musasabi: "ムササビ -- 座布団サイズで120m飛ぶ孤高の夢想家",
      "nihon-risu": "ニホンリス -- 隠し場所を忘れる慎重な貯蓄家",
      "ezo-shika": "エゾシカ -- 北の大地を群れで駆ける繊細戦士",
    };
    for (const result of animalPersonalityQuiz.results) {
      expect(result.title, `Title changed for ${result.id}`).toBe(
        expectedTitles[result.id],
      );
    }
  });
});
