import { describe, it, expect } from "vitest";
import { resultNameWithReading } from "../resultName";
import { quizBySlug } from "../registry";

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

  it("登録されたどのクイズでも、読みを持つ結果は title が読みにくい語を含み、読みが名前に入る", () => {
    for (const [slug, quiz] of quizBySlug) {
      for (const result of quiz.results) {
        if (!result.reading) continue;
        const label = `${slug}/${result.id}`;
        expect(result.title, label).toContain(result.reading.word);
        expect(resultNameWithReading(result), label).toContain(
          `${result.reading.word}（${result.reading.kana}）`,
        );
      }
    }
  });
});
