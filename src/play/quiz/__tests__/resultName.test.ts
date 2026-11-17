import { describe, it, expect } from "vitest";
import { resultHeadingName, resultNameWithReading } from "../resultName";
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

  it("名前に読みを添えた形のタイプは、名前の後ろに読みを全角の丸括弧で添える", () => {
    expect(
      resultNameWithReading({
        title: "藍色(あいいろ)",
        nameParts: { name: "藍色", reading: "あいいろ" },
      }),
    ).toBe("藍色（あいいろ）");
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

  it("登録されたどのクイズでも、名前と読みを分けて持つ結果は、title が名前と読みからなる", () => {
    for (const [slug, quiz] of quizBySlug) {
      for (const result of quiz.results) {
        if (!result.nameParts) continue;
        const { name, reading } = result.nameParts;
        expect(result.title, `${slug}/${result.id}`).toBe(
          `${name}(${reading})`,
        );
      }
    }
  });
});

describe("resultHeadingName", () => {
  it("名前に読みを添えた形のタイプは、名前を見出しに、読みをその下に分ける", () => {
    expect(
      resultHeadingName({
        title: "藍色(あいいろ)",
        nameParts: { name: "藍色", reading: "あいいろ" },
      }),
    ).toEqual({ name: "藍色", reading: "あいいろ" });
  });

  it("読みにくい語を持つタイプは、title を見出しに、語の読みをその下に置く", () => {
    expect(
      resultHeadingName({
        title: "和顔愛語タイプ",
        reading: { word: "和顔愛語", kana: "わがんあいご" },
      }),
    ).toEqual({ name: "和顔愛語タイプ", reading: "わがんあいご" });
  });

  it("読みを持たないタイプは、title だけを見出しにする", () => {
    expect(resultHeadingName({ title: "初志貫徹" })).toEqual({
      name: "初志貫徹",
      reading: undefined,
    });
  });
});
