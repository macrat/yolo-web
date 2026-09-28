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

/** 診断のデータのモジュールのうち、相性の表を持つもの。同じ表を再び書き出すモジュールは1つにまとめる。 */
const dataModules = import.meta.glob("../data/*.ts", {
  eager: true,
}) as Record<
  string,
  { compatibilityMatrix?: Record<string, CompatibilityEntry> }
>;
const compatibilityMatrices = new Map<
  Record<string, CompatibilityEntry>,
  string
>();
for (const [path, module] of Object.entries(dataModules)) {
  if (
    module.compatibilityMatrix &&
    !compatibilityMatrices.has(module.compatibilityMatrix)
  ) {
    compatibilityMatrices.set(module.compatibilityMatrix, path);
  }
}

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

  test("相性の表を持つ診断のデータがある", () => {
    expect(compatibilityMatrices.size).toBeGreaterThan(0);
  });

  for (const [matrix, path] of compatibilityMatrices) {
    test(`${path}: 相性の名前`, () => {
      expect(
        missingIn(Object.values(matrix).map((entry) => entry.label)),
      ).toEqual([]);
    });
  }
});
