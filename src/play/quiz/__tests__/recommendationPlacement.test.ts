import { describe, expect, test } from "vitest";
import { recommendationPlacement } from "../recommendationPlacement";
import { quizBySlug } from "../registry";

describe("recommendationPlacement", () => {
  test("辞典の項目のページは、その結果そのものをもっと知るリンクとして「このタイプについて」に置く", () => {
    expect(recommendationPlacement("/dictionary/colors/ai")).toBe("aboutType");
    expect(recommendationPlacement("/dictionary/yoji/初志貫徹")).toBe(
      "aboutType",
    );
    expect(recommendationPlacement("/dictionary/kanji/山")).toBe("aboutType");
  });

  test("辞典の一覧・分類のページと、ほかの遊びは「次はこれを試してみよう」に置く", () => {
    for (const link of [
      "/dictionary/colors",
      "/dictionary/yoji",
      "/dictionary/kanji",
      "/dictionary/yoji/page/2",
      "/dictionary/yoji/category/life",
      "/dictionary/kanji/grade/1",
      "/dictionary/kanji/radical/水",
      "/dictionary/kanji/stroke/5",
      "/play/kanji-kanaru",
      "/play/yoji-level",
    ]) {
      expect(recommendationPlacement(link), link).toBe("next");
    }
  });

  test("おすすめのリンクを持つ診断・クイズの結果は、この分け方で次のように分かれる", () => {
    const placements: Record<string, Record<string, string[]>> = {};
    for (const [slug, quiz] of quizBySlug) {
      for (const result of quiz.results) {
        if (!result.recommendation || !result.recommendationLink) continue;
        const placement = recommendationPlacement(result.recommendationLink);
        ((placements[slug] ??= {})[placement] ??= []).push(result.id);
      }
    }
    expect(placements).toEqual({
      "traditional-color": {
        aboutType: ["ai", "fuji", "yamabuki", "kon", "sakura"],
        next: ["shu", "wakakusa", "hisui"],
      },
      "yoji-personality": {
        aboutType: quizBySlug
          .get("yoji-personality")!
          .results.map((result) => result.id),
      },
      "word-sense-personality": {
        next: quizBySlug
          .get("word-sense-personality")!
          .results.map((result) => result.id),
      },
      "kanji-level": {
        next: quizBySlug.get("kanji-level")!.results.map((result) => result.id),
      },
      "kotowaza-level": {
        next: quizBySlug
          .get("kotowaza-level")!
          .results.map((result) => result.id),
      },
      "yoji-level": {
        next: quizBySlug.get("yoji-level")!.results.map((result) => result.id),
      },
    });
  });
});
