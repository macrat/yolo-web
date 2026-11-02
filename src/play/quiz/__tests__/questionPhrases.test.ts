import { describe, expect, test } from "vitest";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { questionPhrases } from "../questionPhrases";
import { quizBySlug } from "../registry";

const quizzes = [...quizBySlug.values()];

describe("questionPhrases", () => {
  test("全15本を数える", () => {
    expect(quizzes).toHaveLength(15);
  });

  test.each(quizzes.map((quiz) => [quiz.meta.slug, quiz] as const))(
    "%s: 全問の見出しと全選択肢の区切りは splitIntoPhrases の区切りで、つなぐと元の文に戻る",
    (_slug, quiz) => {
      const phrases = questionPhrases(quiz);
      expect(Object.keys(phrases)).toEqual(
        quiz.questions.map((question) => question.id),
      );
      for (const question of quiz.questions) {
        const { heading, choices } = phrases[question.id];
        const { phrases: headingPhrases, ...headingFont } = heading;
        expect(headingPhrases, question.id).toEqual(
          splitIntoPhrases(question.text),
        );
        expect(headingPhrases.join(""), question.id).toBe(question.text);
        expect(headingFont, question.id).toEqual(
          headingFontAttr(question.text),
        );
        expect(Object.keys(choices), question.id).toEqual(
          question.choices.map((choice) => choice.id),
        );
        for (const choice of question.choices) {
          const label = `${question.id}/${choice.id}`;
          expect(choices[choice.id], label).toEqual(
            splitIntoPhrases(choice.text),
          );
          expect(choices[choice.id].join(""), label).toBe(choice.text);
        }
      }
    },
  );
});
