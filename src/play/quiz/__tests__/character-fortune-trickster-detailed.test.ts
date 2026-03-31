import { describe, it, expect } from "vitest";
import type { CharacterFortuneDetailedContent } from "../types";
import characterFortuneQuiz from "../data/character-fortune";

/**
 * character-fortune trickster の detailedContent 構造テスト
 * CharacterFortuneDetailedContent 型への書き換えを検証する
 */
describe("character-fortune trickster detailedContent", () => {
  const trickster = characterFortuneQuiz.results.find(
    (r) => r.id === "trickster",
  );

  it("trickster が results 配列に存在する", () => {
    expect(trickster).toBeDefined();
  });

  it("detailedContent が定義されている", () => {
    expect(trickster?.detailedContent).toBeDefined();
  });

  it("variant が 'character-fortune' である", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    expect(dc.variant).toBe("character-fortune");
  });

  it("characterIntro が 20-80 字である", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    expect(dc.characterIntro.length).toBeGreaterThanOrEqual(20);
    expect(dc.characterIntro.length).toBeLessThanOrEqual(80);
  });

  it("behaviorsHeading が 5-30 字である", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    expect(dc.behaviorsHeading.length).toBeGreaterThanOrEqual(5);
    expect(dc.behaviorsHeading.length).toBeLessThanOrEqual(30);
  });

  it("behaviors が 3-5 項目ある", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    expect(dc.behaviors.length).toBeGreaterThanOrEqual(3);
    expect(dc.behaviors.length).toBeLessThanOrEqual(5);
  });

  it("characterMessageHeading が定義されている", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    expect(dc.characterMessageHeading).toBeDefined();
    expect(dc.characterMessageHeading.length).toBeGreaterThan(0);
  });

  it("characterMessage が 150-400 字である", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    expect(dc.characterMessage.length).toBeGreaterThanOrEqual(150);
    expect(dc.characterMessage.length).toBeLessThanOrEqual(400);
  });

  it("thirdPartyNote が 80-200 字である", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    expect(dc.thirdPartyNote.length).toBeGreaterThanOrEqual(80);
    expect(dc.thirdPartyNote.length).toBeLessThanOrEqual(200);
  });

  it("compatibilityPrompt が 20-80 字である", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    expect(dc.compatibilityPrompt.length).toBeGreaterThanOrEqual(20);
    expect(dc.compatibilityPrompt.length).toBeLessThanOrEqual(80);
  });

  it("曲者口調（俺、っしょ、じゃん、だよね）が characterIntro に使われている", () => {
    const dc = trickster?.detailedContent as CharacterFortuneDetailedContent;
    const hasTricksterTone =
      dc.characterIntro.includes("俺") ||
      dc.characterIntro.includes("っしょ") ||
      dc.characterIntro.includes("じゃん") ||
      dc.characterIntro.includes("だよね");
    expect(hasTricksterTone).toBe(true);
  });

  it("description は変更されていない（既存内容を保持）", () => {
    expect(trickster?.description).toContain("俺でしょ");
    expect(trickster?.title).toContain("斜め45度");
  });
});
