import { describe, expect, test } from "vitest";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import { choicePhrasesOf } from "../choicePhrases";
import { allQuizMetas, quizBySlug } from "../registry";

describe("選択肢の文節の区切り", () => {
  test("登録したクイズ・診断のすべての選択肢に、つなぐと元の文に戻る区切りがある", () => {
    expect(allQuizMetas.length).toBeGreaterThan(0);
    for (const quiz of quizBySlug.values()) {
      const choices = quiz.questions.flatMap((question) => question.choices);
      const phrases = choicePhrasesOf(quiz);
      expect(Object.keys(phrases), quiz.meta.slug).toHaveLength(choices.length);
      for (const choice of choices) {
        expect(phrases[choice.id].join(""), choice.id).toBe(choice.text);
      }
    }
  });

  test("区切りは、行の頭と終わりに置けない字の所に無く、最後の文節が1字でない", () => {
    for (const quiz of quizBySlug.values()) {
      for (const phrases of Object.values(choicePhrasesOf(quiz))) {
        expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
      }
    }
  });

  test("文節を2つ以上持つ文は、文節の切れ目で分ける", () => {
    const quiz = quizBySlug.get("character-personality");
    if (quiz === undefined) throw new Error("character-personality が無い");
    const choice = quiz.questions[0].choices[0];
    expect(choicePhrasesOf(quiz)[choice.id].length).toBeGreaterThan(1);
  });
});
