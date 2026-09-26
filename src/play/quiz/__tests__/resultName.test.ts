import { describe, it, expect } from "vitest";
import { resultNameWithReading } from "../resultName";
import wordSensePersonalityQuiz from "../data/word-sense-personality";

describe("resultNameWithReading", () => {
  it("読みを持つタイプは、読みにくい語の後ろに読みを丸括弧で添える", () => {
    expect(
      resultNameWithReading({
        title: "和顔愛語タイプ",
        reading: { word: "和顔愛語", kana: "わがんあいご" },
      }),
    ).toBe("和顔愛語（わがんあいご）タイプ");
  });

  it("読みを持たないタイプは title のまま", () => {
    expect(
      resultNameWithReading({
        title: "ムササビ——座布団サイズで120m飛ぶ孤高の夢想家",
      }),
    ).toBe("ムササビ——座布団サイズで120m飛ぶ孤高の夢想家");
  });

  it("word-sense-personality のどのタイプも、読みにくい語が title の中にある", () => {
    for (const result of wordSensePersonalityQuiz.results) {
      expect(result.reading, result.id).toBeDefined();
      expect(result.title, result.id).toContain(result.reading?.word);
      expect(resultNameWithReading(result), result.id).toBe(
        `${result.reading?.word}（${result.reading?.kana}）タイプ`,
      );
    }
  });
});
