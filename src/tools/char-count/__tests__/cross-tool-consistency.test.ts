/**
 * cross-tool-consistency.test.ts
 *
 * char-count と byte-counter が同一入力で同一の文字数・空白なし文字数・単語数を
 * 返すことを保証する回帰テスト。
 *
 * 両ツールが src/lib/text-counting.ts（SSoT）から同一関数を import しているため、
 * このテストは「構造的に同一実装を共有していること」の結果として通る。
 */
import { describe, test, expect } from "vitest";
import { analyzeText as charCountAnalyze } from "../logic";
import { analyzeText as byteCounterAnalyze } from "../../byte-counter/logic";

describe("char-count と byte-counter の整合性（SSoT共有の検証）", () => {
  const testCases = [
    { label: "ASCII文字列", input: "hello world" },
    { label: "日本語文字列", input: "東京は大きい" },
    { label: "日英混在", input: "日本語 と English" },
    { label: "絵文字を含む文字列", input: "あa😀" },
    { label: "絵文字と空白を含む文字列", input: "Hello 😀 World" },
    { label: "空文字列", input: "" },
    { label: "空白のみ", input: "   " },
  ];

  for (const { label, input } of testCases) {
    test(`文字数が一致する: ${label}`, () => {
      const charResult = charCountAnalyze(input);
      const byteResult = byteCounterAnalyze(input);
      // char-count の chars フィールドと byte-counter の charCount フィールドを比較
      expect(charResult.chars).toBe(byteResult.charCount);
    });

    test(`空白なし文字数が一致する: ${label}`, () => {
      const charResult = charCountAnalyze(input);
      const byteResult = byteCounterAnalyze(input);
      // char-count の charsNoSpaces フィールドと byte-counter の charCountNoSpaces フィールドを比較
      expect(charResult.charsNoSpaces).toBe(byteResult.charCountNoSpaces);
    });

    test(`単語数が一致する: ${label}`, () => {
      const charResult = charCountAnalyze(input);
      const byteResult = byteCounterAnalyze(input);
      // char-count の words フィールドと byte-counter の wordCount フィールドを比較
      expect(charResult.words).toBe(byteResult.wordCount);
    });
  }
});
