/**
 * Tests for animal-personality.ts — detailedContent and seoTitle additions
 *
 * Validates:
 * - seoTitle is present in meta and contains expected keywords
 * - All 12 results have detailedContent
 * - All 12 types use the new animal-personality variant format:
 *   nihon-zaru, hondo-tanuki, nihon-kitsune, iriomote-yamaneko (batch: types 1-4)
 *   amami-kuro-usagi, yamane, nihon-momonga, nihon-kamoshika (batch: types 5-8)
 *   hondo-ten, musasabi, nihon-risu, ezo-shika (batch: types 9-12)
 * - Field length constraints are met
 */
import { describe, it, expect } from "vitest";
import type { AnimalPersonalityDetailedContent } from "../../types";
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

/**
 * All 12 types use the new animal-personality variant format.
 * Conversions completed in batches 1-3.
 */
const NEW_VARIANT_IDS = [
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

describe("animal-personality — new variant format (8 types)", () => {
  it("new variant types have variant: 'animal-personality'", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      expect(result, `Result ${id} not found`).toBeDefined();
      expect(
        result!.detailedContent?.variant,
        `${id}: variant must be 'animal-personality'`,
      ).toBe("animal-personality");
    }
  });

  it("new variant types have catchphrase (20-40 chars)", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      const dc = result!.detailedContent as AnimalPersonalityDetailedContent;
      expect(typeof dc.catchphrase, `${id}: catchphrase must be a string`).toBe(
        "string",
      );
      expect(
        dc.catchphrase.length,
        `${id}: catchphrase must be at least 20 chars`,
      ).toBeGreaterThanOrEqual(20);
      expect(
        dc.catchphrase.length,
        `${id}: catchphrase must be at most 40 chars`,
      ).toBeLessThanOrEqual(40);
    }
  });

  it("catchphrases must not end with 。(句点なし体言止め)", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      const dc = result!.detailedContent as AnimalPersonalityDetailedContent;
      expect(
        dc.catchphrase.endsWith("。"),
        `${id}: catchphrase must not end with 。: "${dc.catchphrase}"`,
      ).toBe(false);
    }
  });

  it("hondo-ten behaviors must not have duplicate concepts about inefficiency", () => {
    const result = animalPersonalityQuiz.results.find(
      (r) => r.id === "hondo-ten",
    );
    const dc = result!.detailedContent as AnimalPersonalityDetailedContent;
    const hasEfficiencyDuplicate =
      dc.behaviors.filter((b) => b.includes("効率") || b.includes("非効率"))
        .length >= 2;
    expect(
      hasEfficiencyDuplicate,
      `hondo-ten: behaviors must not have two items about inefficiency. behaviors: ${JSON.stringify(dc.behaviors)}`,
    ).toBe(false);
  });

  it("new variant types have strengths (2-3 items)", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      const dc = result!.detailedContent as AnimalPersonalityDetailedContent;
      expect(
        Array.isArray(dc.strengths),
        `${id}: strengths must be an array`,
      ).toBe(true);
      expect(
        dc.strengths.length,
        `${id}: strengths must have at least 2 items`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        dc.strengths.length,
        `${id}: strengths must have at most 3 items`,
      ).toBeLessThanOrEqual(3);
    }
  });

  it("new variant types have weaknesses (2-3 items)", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      const dc = result!.detailedContent as AnimalPersonalityDetailedContent;
      expect(
        Array.isArray(dc.weaknesses),
        `${id}: weaknesses must be an array`,
      ).toBe(true);
      expect(
        dc.weaknesses.length,
        `${id}: weaknesses must have at least 2 items`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        dc.weaknesses.length,
        `${id}: weaknesses must have at most 3 items`,
      ).toBeLessThanOrEqual(3);
    }
  });

  it("new variant types have behaviors (3-5 items)", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      const dc = result!.detailedContent as AnimalPersonalityDetailedContent;
      expect(
        Array.isArray(dc.behaviors),
        `${id}: behaviors must be an array`,
      ).toBe(true);
      expect(
        dc.behaviors.length,
        `${id}: behaviors must have at least 3 items`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        dc.behaviors.length,
        `${id}: behaviors must have at most 5 items`,
      ).toBeLessThanOrEqual(5);
    }
  });

  it("new variant types have todayAction as a non-empty string", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      const dc = result!.detailedContent as AnimalPersonalityDetailedContent;
      expect(typeof dc.todayAction, `${id}: todayAction must be a string`).toBe(
        "string",
      );
      expect(
        dc.todayAction.length,
        `${id}: todayAction must not be empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("new variant types do NOT have old fields (traits, advice)", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      const dc = result!.detailedContent as unknown as Record<string, unknown>;
      expect(
        dc["traits"],
        `${id}: old field 'traits' must not exist`,
      ).toBeUndefined();
      expect(
        dc["advice"],
        `${id}: old field 'advice' must not exist`,
      ).toBeUndefined();
    }
  });

  it("catchphrases are all unique across new variant types", () => {
    const catchphrases = NEW_VARIANT_IDS.map((id) => {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      return (result!.detailedContent as AnimalPersonalityDetailedContent)
        .catchphrase;
    });
    const unique = new Set(catchphrases);
    expect(
      unique.size,
      `Catchphrases are not all unique among new variant types`,
    ).toBe(NEW_VARIANT_IDS.length);
  });

  it("todayAction texts are unique across new variant types", () => {
    const actions = NEW_VARIANT_IDS.map((id) => {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      return (result!.detailedContent as AnimalPersonalityDetailedContent)
        .todayAction;
    });
    const unique = new Set(actions);
    expect(unique.size, `todayAction texts are not all unique`).toBe(
      NEW_VARIANT_IDS.length,
    );
  });

  it("no todayAction uses the generic 'そのままでいい' phrase", () => {
    for (const id of NEW_VARIANT_IDS) {
      const result = animalPersonalityQuiz.results.find((r) => r.id === id);
      const dc = result!.detailedContent as AnimalPersonalityDetailedContent;
      expect(
        dc.todayAction.includes("そのままでいい"),
        `${id}: todayAction contains vague phrase "そのままでいい": "${dc.todayAction}"`,
      ).toBe(false);
    }
  });
});

describe("animal-personality — accentColor WCAG AA compliance", () => {
  it("accentColor must be #15803d (WCAG AA compliant, contrast ratio 4.59:1 on white)", () => {
    // #16a34a has contrast ratio 3.30:1 — fails WCAG AA (requires 4.5:1)
    // #15803d has contrast ratio 4.59:1 — passes WCAG AA
    expect(animalPersonalityQuiz.meta.accentColor).toBe("#15803d");
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
