/**
 * word-sense-personality（言葉センス診断）の全8結果 detailedContent の品質テスト。
 *
 * cycle-247 / B-323: 実測で勝っている診断系の結果ページが検索露出ゼロだった取りこぼしを
 * 是正するため、8結果すべてに標準形式 detailedContent（traits / behaviors / advice）を付与し
 * robots:index 可能化した。本テストはその品質（存在・項目数・非空・重複なし）を恒久ロックする。
 *
 * 8結果すべて標準形式（QuizResultDetailedContent: variant なし）を用いる。
 */
import { describe, it, expect } from "vitest";
import wordSensePersonalityQuiz, {
  WORD_SENSE_TYPE_IDS,
} from "../word-sense-personality";

const results = wordSensePersonalityQuiz.results;

describe("word-sense-personality detailedContent", () => {
  it("all 8 results exist and match WORD_SENSE_TYPE_IDS", () => {
    expect(results.length).toBe(8);
    expect(new Set(results.map((r) => r.id))).toEqual(
      new Set(WORD_SENSE_TYPE_IDS),
    );
  });

  it("every result has detailedContent in standard format (no variant)", () => {
    for (const result of results) {
      expect(
        result.detailedContent,
        `${result.id} is missing detailedContent`,
      ).toBeDefined();
      // 標準形式は variant を持たない（discriminated union の絞り込みで標準扱いになる）。
      const dc = result.detailedContent as { variant?: string };
      expect(
        dc.variant,
        `${result.id}: should use standard format (variant must be undefined)`,
      ).toBeUndefined();
    }
  });

  it("traits has 3-5 items and each is non-empty", () => {
    for (const result of results) {
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
          trait.trim().length,
          `${result.id}: each trait must be non-empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("behaviors has 3-5 items and each is non-empty", () => {
    for (const result of results) {
      const dc = result.detailedContent as unknown as { behaviors: string[] };
      const { behaviors } = dc;
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
          behavior.trim().length,
          `${result.id}: each behavior must be non-empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("advice is a non-empty string", () => {
    for (const result of results) {
      const dc = result.detailedContent as unknown as { advice: string };
      expect(
        dc.advice.trim().length,
        `${result.id}: advice must be non-empty`,
      ).toBeGreaterThan(0);
    }
  });

  it("traits and behaviors are unique across all types (no copy-paste between types)", () => {
    // 各タイプ固有の内容であることを担保する。型をまたいだ文の取り違え・コピペを検出。
    const allTraits: string[] = [];
    const allBehaviors: string[] = [];
    for (const result of results) {
      const dc = result.detailedContent as unknown as {
        traits: string[];
        behaviors: string[];
      };
      allTraits.push(...dc.traits);
      allBehaviors.push(...dc.behaviors);
    }
    expect(new Set(allTraits).size, "traits must be unique across types").toBe(
      allTraits.length,
    );
    expect(
      new Set(allBehaviors).size,
      "behaviors must be unique across types",
    ).toBe(allBehaviors.length);
  });
});
