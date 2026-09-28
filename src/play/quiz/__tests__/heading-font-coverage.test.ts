/**
 * 解き終えるまでの画面と解き終えた画面は、診断のデータから来る見出しを、クライアントの部品が見出しの書体の属性なしで
 * 描く（字の表をブラウザへ送らない）。そのため、それらの見出しの字がすべて見出しの書体（Zen Antique）にあることを、
 * データの側で確かめる（DESIGN.md §3）。
 */
import { describe, expect, test } from "vitest";
import { charsMissingFromZenAntique } from "@/lib/zen-antique-charset";
import type { CompatibilityEntry } from "../types";
import { quizBySlug } from "../registry";
import { solvedScreenReadingHeadings } from "../readingHeadings";
import { compatibilityMatrix as animalPersonality } from "../data/animal-personality";
import { compatibilityMatrix as characterFortune } from "../data/character-fortune";
import { compatibilityMatrix as characterPersonality } from "../data/character-personality";
import { compatibilityMatrix as japaneseCulture } from "../data/japanese-culture";
import { compatibilityMatrix as musicPersonality } from "../data/music-personality";
import { compatibilityMatrix as wordSensePersonality } from "../data/word-sense-personality";

const compatibilityMatrices: Record<
  string,
  Record<string, CompatibilityEntry>
> = {
  "animal-personality": animalPersonality,
  "character-fortune": characterFortune,
  "character-personality": characterPersonality,
  "japanese-culture": japaneseCulture,
  "music-personality": musicPersonality,
  "word-sense-personality": wordSensePersonality,
};

function missingIn(texts: readonly string[]): string[] {
  return texts.flatMap((text) =>
    charsMissingFromZenAntique(text).map((char) => `${char}（${text}）`),
  );
}

describe("診断のデータから来る見出しの字が、すべて見出しの書体にある", () => {
  for (const [slug, quiz] of quizBySlug) {
    test(`${slug}: 設問文`, () => {
      expect(missingIn(quiz.questions.map((q) => q.text))).toEqual([]);
    });

    test(`${slug}: 解き終えた画面の読みものの小見出し`, () => {
      expect(missingIn(solvedScreenReadingHeadings(quiz))).toEqual([]);
    });
  }

  for (const [slug, matrix] of Object.entries(compatibilityMatrices)) {
    test(`${slug}: 相性の名前`, () => {
      expect(
        missingIn(Object.values(matrix).map((entry) => entry.label)),
      ).toEqual([]);
    });
  }
});
