import { describe, expect, test } from "vitest";
import { getAllQuizSlugs } from "../registry";
import { resultTexts } from "../resultTexts";

describe("結果を渡すときの文", () => {
  test("どの診断・クイズも、ハッシュタグの語と誘いの文を持つ", () => {
    for (const slug of getAllQuizSlugs()) {
      const { hashtag, ctaText } = resultTexts(slug);
      expect(hashtag, slug).not.toBe("");
      expect(ctaText, slug).not.toBe("");
    }
  });

  // X はハッシュタグを、語の字でない字（空白・ダッシュ・疑問符・感嘆符・括弧など）の手前で切る。
  // 語の字のほかに入れてよいのは、和文の中点（・）と長音符（ー）だけ。
  test("ハッシュタグの語は、ハッシュタグを途中で切る字を含まない", () => {
    for (const slug of getAllQuizSlugs()) {
      const { hashtag } = resultTexts(slug);
      expect(hashtag, slug).toMatch(/^[\p{L}\p{N}_・ー]+$/u);
    }
  });

  test("登録されていない診断の文は引けない", () => {
    expect(() => resultTexts("no-such-quiz")).toThrow();
  });
});
