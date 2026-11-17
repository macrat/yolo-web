import { describe, test, expect } from "vitest";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { PHRASE_MAX_LENGTH, sayingPhrases } from "../engine";
import puzzleData from "../../data/nakamawake-data.json";
import type { NakamawakePuzzle } from "../types";

const phrasedWords = (puzzleData as NakamawakePuzzle[])
  .flatMap((puzzle) => puzzle.groups.flatMap((group) => group.words))
  .flatMap((word) => {
    const phrases = sayingPhrases(splitIntoPhrases(word));
    return phrases ? [phrases] : [];
  });

describe("句の切れ目で折る語（問題のデータ）", () => {
  test("どの句も、語のマスの1行に入る字の数までにする", () => {
    for (const phrases of phrasedWords) {
      for (const phrase of phrases) {
        expect([...phrase].length, phrases.join("|")).toBeLessThanOrEqual(
          PHRASE_MAX_LENGTH,
        );
      }
    }
  });

  test("ことわざと句を並べた語だけが句に分かれる", () => {
    const phrased = phrasedWords.map((phrases) => phrases.join("|")).sort();
    expect(phrased).toEqual([
      "味噌を|つける",
      "手に|汗握る",
      "春の|小川",
      "棚から|ぼた餅",
      "犬も|歩けば|棒に|当たる",
      "猿も|木から|落ちる",
      "目は|口ほどに|物を|言う",
      "石の|上にも|三年",
      "秋の|田の",
      "絵に|描いた餅",
      "腹が|立つ",
      "花より|団子",
      "豚に|真珠",
      "赤の|他人",
      "足を|引っ張る",
      "酒は|百薬の長",
      "雨降って|地固まる",
      "風が|吹けば|桶屋が|儲かる",
      "馬の|耳に|念仏",
    ]);
  });
});
