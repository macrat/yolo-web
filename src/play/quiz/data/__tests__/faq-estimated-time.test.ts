import { describe, it, expect } from "vitest";
import { quizBySlug } from "../../registry";
import { getEstimatedTime } from "../../_components/introBadges";

/**
 * FAQ で言う所要時間は、開始の画面の事実の行と同じ値にする。来訪者が両方を読んで食い違わないよう、
 * どのクイズ・診断でも、FAQ の答えに出る分数は事実の行の見積もりと一致しなければならない。
 */

/** 答えの中の、時間の長さを言う箇所（「約3分」「1〜2分程度」など）。 */
const DURATION_PATTERN =
  /約?\d+(?:[〜~～-]\d+)?分(?:程度|ほど|くらい|ぐらい)?/g;

const quizzes = [...quizBySlug.values()];

describe("FAQ の所要時間", () => {
  it("登録されたクイズ・診断を読み込めている", () => {
    expect(quizzes.length).toBeGreaterThan(0);
  });

  describe.each(quizzes.map((quiz) => [quiz.meta.slug, quiz] as const))(
    "%s",
    (_slug, quiz) => {
      const estimate = getEstimatedTime(quiz);
      const faq = quiz.meta.faq ?? [];

      it("答えに出る分数は、どれも事実の行の見積もりと同じ", () => {
        for (const { answer } of faq) {
          for (const duration of answer.match(DURATION_PATTERN) ?? []) {
            expect(duration).toBe(estimate);
          }
        }
      });

      it("時間を尋ねる問いの答えは、事実の行の見積もりを言う", () => {
        for (const { question, answer } of faq) {
          if (question.includes("時間")) {
            expect(answer).toContain(estimate);
          }
        }
      });
    },
  );
});
