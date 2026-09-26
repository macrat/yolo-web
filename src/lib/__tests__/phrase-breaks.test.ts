import { describe, expect, test } from "vitest";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { quizBySlug } from "@/play/quiz/registry";

const characterPersonalityTypeNames = (
  quizBySlug.get("character-personality")?.results ?? []
).map((result) => result.title);

const allQuizHeadings = [...quizBySlug.values()].flatMap((quiz) => [
  quiz.meta.title,
  ...quiz.results.map((result) => result.title),
]);

/** 区切りの性質を、BudouX の分け方に依らず見るための見出しの文。 */
const headings = new Set([
  ...allQuizHeadings,
  "柔和温順（にゅうわおんじゅん）タイプ",
  "ツールを10個から30個に拡充しました: プログラマティックSEO戦略の実践",
  "Markdownが思い通りに表示されない：改行・表・エスケープを仕組みから直す",
  "締切3分前に5手先を読む炎の策士",
  "晴れの日に傘を7本持って山に登る備えの王",
]);

const NO_LINE_START =
  /^[)\]）］」』】〕〉》、。，．,.！？!?…‥・：:ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶー]/u;
const NO_LINE_END = /[(\[（［「『【〔〈《]$/u;

function boundaries(phrases: string[]): [string, string][] {
  return phrases.slice(1).map((after, index) => [phrases[index], after]);
}

describe("splitIntoPhrases", () => {
  test("character-personality のタイプ名は24件ある", () => {
    expect(characterPersonalityTypeNames).toHaveLength(24);
  });

  test("区切りをつなぐと元の文と一字も違わず、空の文節を持たない", () => {
    for (const text of headings) {
      const phrases = splitIntoPhrases(text);
      expect(phrases.join(""), text).toBe(text);
      expect(
        phrases.every((phrase) => phrase.length > 0),
        text,
      ).toBe(true);
    }
  });

  test("数字とそれに続く字が別の文節に分かれない", () => {
    for (const text of headings) {
      for (const [before, after] of boundaries(splitIntoPhrases(text))) {
        expect(`${before}|${after}`, text).not.toMatch(/[0-9０-９]\|\S/u);
      }
    }
  });

  test("行の頭に置かない字で始まる文節が無く、開き括弧で終わる文節が無い", () => {
    for (const text of headings) {
      for (const [before, after] of boundaries(splitIntoPhrases(text))) {
        expect(after, text).not.toMatch(NO_LINE_START);
        expect(before, text).not.toMatch(NO_LINE_END);
      }
    }
  });

  test("最後の文節が1字にならない", () => {
    for (const text of headings) {
      const phrases = splitIntoPhrases(text);
      if (phrases.length > 1) {
        expect([...phrases[phrases.length - 1]].length, text).toBeGreaterThan(
          1,
        );
      }
    }
  });

  test("数字と助数詞は、続く語と1つの文節に入る", () => {
    const phrases = [
      ...splitIntoPhrases(
        "「よし行くぞ！」と叫んで3秒後に空を見上げる炎の詩人",
      ),
      ...splitIntoPhrases(
        "「もう少し調べてから」と言って気づいたら10年経っていた博士",
      ),
    ];
    expect(phrases.some((phrase) => phrase.includes("3秒後"))).toBe(true);
    expect(phrases.some((phrase) => phrase.includes("10年"))).toBe(true);
  });

  test("タイプ名はどれも2つ以上の文節に分かれ、見出しに折り所を持つ", () => {
    for (const name of characterPersonalityTypeNames) {
      expect(splitIntoPhrases(name).length).toBeGreaterThan(1);
    }
  });

  test("1つの文節しかない文は、そのまま1つで返す", () => {
    expect(splitIntoPhrases("王")).toEqual(["王"]);
  });

  test("空の文は文節を持たない", () => {
    expect(splitIntoPhrases("")).toEqual([]);
  });
});
