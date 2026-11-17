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
  it("黙読の速さで読む時間と、1問ごとに答える時間を足して、分に四捨五入する", () => {
    // 1000字を読む2分と、10問に答える30秒で、ちょうど2.5分 → 3分。
    const quiz = makeQuiz(
      "personality",
      Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`, 100, [])),
    );
    expect(READING_CHARS_PER_MINUTE).toBe(500);
    expect(ANSWER_SECONDS_PER_QUESTION).toBe(3);
    expect(getEstimatedMinutes(quiz)).toBe(3);
  });

  it("半分に満たない端数は切り捨て、見積もりにいちばん近い分を言う", () => {
    // 1751字を読む210.12秒と、10問に答える30秒で、4.002分 → 4分。
    const quiz = makeQuiz(
      "personality",
      Array.from({ length: 10 }, (_, i) =>
        makeQuestion(`q${i}`, i === 0 ? 176 : 175, []),
      ),
    );
    expect(getEstimatedMinutes(quiz)).toBe(4);
  });

  it("1分に満たないときは1分と言う", () => {
    // 10字を読む1.2秒と、1問に答える3秒。
    const quiz = makeQuiz("personality", [makeQuestion("q1", 10, [])]);
    expect(getEstimatedMinutes(quiz)).toBe(1);
  });
});

describe("getEstimatedTime", () => {
  it("「約N分」の形で返す", () => {
    const quiz = makeQuiz("personality", [makeQuestion("q1", 10, [5, 5])]);
    expect(getEstimatedTime(quiz)).toBe("約1分");
  });
});
