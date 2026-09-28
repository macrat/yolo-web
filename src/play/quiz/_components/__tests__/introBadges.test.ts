import { describe, it, expect } from "vitest";
import type { QuizDefinition, QuizMeta, QuizQuestion } from "../../types";
import {
  ANSWER_SECONDS_PER_QUESTION,
  READING_CHARS_PER_MINUTE,
  countReadingChars,
  getEstimatedMinutes,
  getEstimatedTime,
} from "../introBadges";

function makeQuiz(
  type: QuizMeta["type"],
  questions: QuizQuestion[],
): QuizDefinition {
  return {
    meta: { slug: "test", title: "テスト", type } as QuizMeta,
    questions,
    results: [],
  };
}

/** 設問・選択肢・解説の字数を指定して1問を作る。 */
function makeQuestion(
  id: string,
  textLength: number,
  choiceLengths: number[],
  explanationLength = 0,
): QuizQuestion {
  return {
    id,
    text: "問".repeat(textLength),
    choices: choiceLengths.map((length, i) => ({
      id: `${id}-${i}`,
      text: "選".repeat(length),
    })),
    explanation: explanationLength > 0 ? "解".repeat(explanationLength) : "",
  };
}

describe("countReadingChars", () => {
  it("診断では設問と選択肢の字を数える", () => {
    const quiz = makeQuiz("personality", [
      makeQuestion("q1", 20, [10, 10, 10, 10]),
      makeQuestion("q2", 30, [5, 5]),
    ]);
    expect(countReadingChars(quiz)).toBe(20 + 40 + 30 + 10);
  });

  it("知識クイズでは、答えたあとに出る解説の字も数える", () => {
    const quiz = makeQuiz("knowledge", [makeQuestion("q1", 20, [4, 4], 60)]);
    expect(countReadingChars(quiz)).toBe(20 + 8 + 60);
  });

  it("サロゲートペアの字は1字と数える", () => {
    const quiz = makeQuiz("personality", [
      { id: "q1", text: "𠮟る", choices: [] },
    ]);
    expect(countReadingChars(quiz)).toBe(2);
  });
});

describe("getEstimatedMinutes", () => {
  it("黙読の速さで読む時間と、1問ごとに答える時間を足して、分に切り上げる", () => {
    // 1000字を読む2分と、10問に答える30秒で、2.5分 → 3分。
    const quiz = makeQuiz(
      "personality",
      Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 100, [])),
    );
    expect(READING_CHARS_PER_MINUTE).toBe(500);
    expect(ANSWER_SECONDS_PER_QUESTION).toBe(3);
    expect(getEstimatedMinutes(quiz)).toBe(3);
  });

  it("ちょうど分に届くときは、その分のままにする", () => {
    // 450字を読む54秒と、2問に答える6秒で、ちょうど1分。
    const quiz = makeQuiz("personality", [
      makeQuestion("q1", 225, []),
      makeQuestion("q2", 225, []),
    ]);
    expect(getEstimatedMinutes(quiz)).toBe(1);
  });

  it("分を少しでも超えたら、次の分に切り上げる", () => {
    const quiz = makeQuiz("personality", [
      makeQuestion("q1", 226, []),
      makeQuestion("q2", 225, []),
    ]);
    expect(getEstimatedMinutes(quiz)).toBe(2);
  });
});

describe("getEstimatedTime", () => {
  it("「約N分」の形で返す", () => {
    const quiz = makeQuiz("personality", [makeQuestion("q1", 10, [5, 5])]);
    expect(getEstimatedTime(quiz)).toBe("約1分");
  });
});
