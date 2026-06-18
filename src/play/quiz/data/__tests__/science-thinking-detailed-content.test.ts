/**
 * science-thinking（理系思考タイプ診断）の全10結果 detailedContent の品質テスト。
 *
 * cycle-250 / B-518（B-323 の具体化）: 診断系で結果体験（detailedContent）を欠く最上位だった
 * science-thinking の10結果すべてに標準形式 detailedContent（traits / behaviors / advice）を付与し、
 * 結果到達者の体験を厚くするとともに cycle-249 の OtherTypesNav 回遊導線を自動有効化した。
 * 本テストはその品質（存在・標準形式・項目数・非空・型をまたぐコピペなし）を恒久ロックする。
 *
 * 10結果すべて標準形式（QuizResultDetailedContent: variant なし）を用いる。
 */
import { describe, it, expect } from "vitest";
import scienceThinkingQuiz, { SCIENCE_TYPE_IDS } from "../science-thinking";

const results = scienceThinkingQuiz.results;

describe("science-thinking detailedContent", () => {
  it("all 10 results exist and match SCIENCE_TYPE_IDS", () => {
    expect(results.length).toBe(10);
    expect(new Set(results.map((r) => r.id))).toEqual(
      new Set(SCIENCE_TYPE_IDS),
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
