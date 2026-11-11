import { describe, expect, test } from "vitest";
import {
  answeredChoiceId,
  currentQuestionId,
  initialQuizProgress,
  reduceQuizProgress,
  type QuizProgress,
  type QuizProgressAction,
} from "../quizProgress";

const QUESTION_IDS = ["q1", "q2"] as const;

function apply(
  progress: QuizProgress,
  ...actions: QuizProgressAction[]
): QuizProgress {
  return actions.reduce(
    (state, action) => reduceQuizProgress(state, action, QUESTION_IDS),
    progress,
  );
}

const playing = apply(initialQuizProgress, { type: "start" });
const answeredQ1 = apply(playing, {
  type: "answer",
  questionId: "q1",
  choiceId: "a",
});
const atQ2 = apply(answeredQ1, { type: "advance", questionId: "q1" });
const result = apply(
  atQ2,
  { type: "answer", questionId: "q2", choiceId: "b" },
  { type: "advance", questionId: "q2" },
);

describe("reduceQuizProgress — 受け付ける更新", () => {
  test("始めると、回答の段階の最初の問に答えの無い状態で着く", () => {
    expect(playing).toMatchObject({
      phase: "playing",
      currentIndex: 0,
      answers: [],
    });
    expect(currentQuestionId(playing, QUESTION_IDS)).toBe("q1");
  });

  test("いま出ている問に答えると、答えが1件足される", () => {
    expect(answeredQ1.answers).toEqual([{ questionId: "q1", choiceId: "a" }]);
    expect(answeredChoiceId(answeredQ1, "q1")).toBe("a");
    expect(answeredQ1.currentIndex).toBe(0);
  });

  test("答えた問から進むと次の問へ、最後の問から進むと結果へ移る", () => {
    expect(atQ2).toMatchObject({ phase: "playing", currentIndex: 1 });
    expect(result.phase).toBe("result");
    expect(result.answers).toEqual([
      { questionId: "q1", choiceId: "a" },
      { questionId: "q2", choiceId: "b" },
    ]);
  });

  test("やり直すと、開いた直後と同じ段階・番号・答えに戻る", () => {
    const retried = apply(result, { type: "retry" });
    expect(retried).toMatchObject({
      phase: initialQuizProgress.phase,
      currentIndex: initialQuizProgress.currentIndex,
      answers: initialQuizProgress.answers,
    });
  });
});

describe("reduceQuizProgress — 捨てる更新", () => {
  test.each<[string, QuizProgress, QuizProgressAction]>([
    [
      "いま出ていない問への答え",
      playing,
      { type: "answer", questionId: "q2", choiceId: "b" },
    ],
    [
      "答えのある問への答え",
      answeredQ1,
      { type: "answer", questionId: "q1", choiceId: "b" },
    ],
    ["答えの無い問の進む", playing, { type: "advance", questionId: "q1" }],
    [
      "いま出ていない問の進む（重なったタイマーや「次へ」の2打目）",
      apply(atQ2, { type: "answer", questionId: "q2", choiceId: "b" }),
      { type: "advance", questionId: "q1" },
    ],
    ["開始でない段階の始める", answeredQ1, { type: "start" }],
    ["結果の段階の始める", result, { type: "start" }],
    ["結果でない段階のやり直す", answeredQ1, { type: "retry" }],
    ["開始の段階のやり直す", initialQuizProgress, { type: "retry" }],
    [
      "結果の段階の答え",
      result,
      { type: "answer", questionId: "q2", choiceId: "a" },
    ],
  ])("%s は状態を変えない", (_, state, action) => {
    expect(reduceQuizProgress(state, action, QUESTION_IDS)).toBe(state);
  });
});

describe("reduceQuizProgress — 切り替わりの番号", () => {
  test("開いた直後は 0 で、受け付けた更新ごとに1つ増える", () => {
    expect(initialQuizProgress.transition).toBe(0);
    expect(playing.transition).toBe(1);
    expect(answeredQ1.transition).toBe(2);
    expect(atQ2.transition).toBe(3);
    expect(result.transition).toBe(5);
    expect(apply(result, { type: "retry" }).transition).toBe(6);
  });

  test("捨てた更新では変わらない", () => {
    const rejected = apply(
      answeredQ1,
      { type: "answer", questionId: "q1", choiceId: "b" },
      { type: "start" },
      { type: "retry" },
      { type: "advance", questionId: "q2" },
    );
    expect(rejected.transition).toBe(answeredQ1.transition);
  });

  test("やり直したあとは、段階・番号・答えが開いた直後と同じでも、番号で見分けられる", () => {
    const retried = apply(result, { type: "retry" });
    expect(retried.transition).not.toBe(initialQuizProgress.transition);
  });
});
