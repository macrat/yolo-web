import { loadDefaultJapaneseParser } from "budoux";
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
  "Unix タイムスタンプ変換ツール",
  "JSON 整形ツール",
  "CSS グラデーション生成ツール",
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

/** 並びの境目の位置（UTF-16 の位置）。 */
function boundaryOffsets(pieces: string[]): number[] {
  const offsets: number[] = [];
  let offset = 0;
  for (const piece of pieces.slice(0, -1)) {
    offset += piece.length;
    offsets.push(offset);
  }
  return offsets;
}

const budoux = loadDefaultJapaneseParser();

function parenDepth(text: string): number {
  let depth = 0;
  for (const ch of text) {
    if (/[(（]/u.test(ch)) depth += 1;
    else if (/[)）]/u.test(ch)) depth = Math.max(0, depth - 1);
  }
  return depth;
}

const HAN_OR_KATAKANA = /^[\p{Script=Han}\p{Script=Katakana}]/u;

function isScriptChange(before: string, after: string): boolean {
  const script = (ch: string) =>
    /[\p{Script=Katakana}ー]/u.test(ch)
      ? "katakana"
      : /\p{Script=Han}/u.test(ch)
        ? "han"
        : /\p{Script=Hiragana}/u.test(ch)
          ? "hiragana"
          : "other";
  return script(before) !== script(after) && script(before) !== "other";
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

  test("BudouX の境目を外すのは、禁則・開き括弧・数字・丸括弧の中・最後の1字の所だけ", () => {
    for (const text of headings) {
      const kept = new Set(boundaryOffsets(splitIntoPhrases(text)));
      for (const offset of boundaryOffsets(budoux.parse(text))) {
        if (kept.has(offset)) continue;
        const before = text.slice(0, offset);
        const after = text.slice(offset);
        const allowed =
          NO_LINE_START.test(after) ||
          NO_LINE_END.test(before) ||
          /[0-9０-９]$/u.test(before) ||
          parenDepth(before) > 0 ||
          [...after].length === 1;
        expect(allowed, `${text} の ${before}|${after}`).toBe(true);
      }
    }
  });

  test("BudouX に無い境目は、最初の文節の最初の空白より前の、字の種類が変わって漢字か片仮名が始まる所だけ", () => {
    for (const text of headings) {
      const budouxOffsets = new Set(boundaryOffsets(budoux.parse(text)));
      const offsets = boundaryOffsets(splitIntoPhrases(text));
      offsets.forEach((offset, index) => {
        if (budouxOffsets.has(offset)) return;
        const before = text.slice(0, offset);
        const after = text.slice(offset);
        expect(
          offsets.slice(0, index).every((o) => !budouxOffsets.has(o)),
          `${text} の ${before}|${after}`,
        ).toBe(true);
        expect(before, text).not.toMatch(/\s/u);
        expect(after, text).toMatch(HAN_OR_KATAKANA);
        expect(isScriptChange(before.at(-1) ?? "", after[0]), text).toBe(true);
      });
    }
  });

  test("丸括弧の中では区切らない", () => {
    for (const text of headings) {
      for (const offset of boundaryOffsets(splitIntoPhrases(text))) {
        expect(parenDepth(text.slice(0, offset)), text).toBe(0);
      }
    }
    expect(splitIntoPhrases("柔和温順（にゅうわおんじゅん）タイプ")).toEqual([
      "柔和温順",
      "（にゅうわおんじゅん）",
      "タイプ",
    ]);
  });

  test("最初の文節は、字の種類が変わって語が始まる所でも区切る", () => {
    expect(splitIntoPhrases("チューリング型思考者")).toEqual([
      "チューリング",
      "型思考者",
    ]);
    expect(splitIntoPhrases("ことわざビギナー")).toEqual([
      "ことわざ",
      "ビギナー",
    ]);
  });

  test("最初の文節の空白より後ろには語の切れ目の折り所を足さない", () => {
    expect(
      splitIntoPhrases("ムササビ -- 座布団サイズで120m飛ぶ孤高の夢想家")[0],
    ).toBe("ムササビ -- 座布団サイズで");
  });

  test("最初の文節の語の切れ目は、前後に2字以上の同じ字の種類が続く所だけ", () => {
    for (const piece of splitIntoPhrases(
      "お稲荷さんの看板を背負う孤高のリアリスト",
    )) {
      expect(piece).not.toBe("お");
    }
    expect(splitIntoPhrases("深夜シャッフル系")).toEqual([
      "深夜",
      "シャッフル系",
    ]);
  });

  test("1つの文節しかない文は、そのまま1つで返す", () => {
    expect(splitIntoPhrases("王")).toEqual(["王"]);
  });

  test("空の文は文節を持たない", () => {
    expect(splitIntoPhrases("")).toEqual([]);
  });
});
