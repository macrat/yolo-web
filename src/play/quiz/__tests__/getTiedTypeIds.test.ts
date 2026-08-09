import { describe, it, expect } from "vitest";
import { getTiedTypeIds, determineResult } from "../scoring";
import type { QuizDefinition, QuizAnswer, QuizQuestion } from "../types";

/**
 * getTiedTypeIds（P2b・cycle-303）の単体テスト。
 *
 * 最高得点を分け合う全 typeId を quiz.results の配列順で返す純関数。
 * - 単独勝者 = 1 件
 * - 2 型同点 = 2 件
 * - 3 型同点 = 3 件
 * を合成 quiz で検証する。返り値の先頭は determineResult の勝者と一致すること
 * （主タイプの決定性＝シェア/再受験の再現性を保つ）も確認する。
 */

// A,B,C,D の 4 択で red/blue/green の 3 タイプに配点する合成 quiz。
// 選ぶ選択肢の組み合わせで単独勝者・2型同点・3型同点を作り分ける。
const questions: QuizQuestion[] = [
  {
    id: "q1",
    text: "Q1",
    choices: [
      { id: "a", text: "A", points: { red: 1 } },
      { id: "b", text: "B", points: { blue: 1 } },
      { id: "c", text: "C", points: { green: 1 } },
      { id: "d", text: "D", points: { red: 1 } },
    ],
  },
  {
    id: "q2",
    text: "Q2",
    choices: [
      { id: "a", text: "A", points: { red: 1 } },
      { id: "b", text: "B", points: { blue: 1 } },
      { id: "c", text: "C", points: { green: 1 } },
      { id: "d", text: "D", points: { blue: 1 } },
    ],
  },
  {
    id: "q3",
    text: "Q3",
    choices: [
      { id: "a", text: "A", points: { red: 1 } },
      { id: "b", text: "B", points: { blue: 1 } },
      { id: "c", text: "C", points: { green: 1 } },
      { id: "d", text: "D", points: { green: 1 } },
    ],
  },
];

const personalityQuiz: QuizDefinition = {
  meta: {
    slug: "synthetic-personality",
    title: "Synthetic",
    description: "synthetic personality quiz",
    shortDescription: "synthetic",
    type: "personality",
    category: "personality",
    questionCount: 3,
    icon: "S",
    accentColor: "#000",
    keywords: [],
    publishedAt: "2026-01-01",
  },
  questions,
  // 配列順は red -> blue -> green（同点時の決定的勝者は配列順で先頭のタイプ）。
  results: [
    { id: "red", title: "Red", description: "Red type" },
    { id: "blue", title: "Blue", description: "Blue type" },
    { id: "green", title: "Green", description: "Green type" },
  ],
};

const knowledgeQuiz: QuizDefinition = {
  ...personalityQuiz,
  meta: {
    ...personalityQuiz.meta,
    slug: "synthetic-knowledge",
    type: "knowledge",
    category: "knowledge",
  },
};

describe("getTiedTypeIds", () => {
  it("単独勝者は 1 件だけ返す", () => {
    // red:3, blue:0, green:0 -> red の単独勝者
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" }, // red
      { questionId: "q2", choiceId: "a" }, // red
      { questionId: "q3", choiceId: "a" }, // red
    ];
    expect(getTiedTypeIds(personalityQuiz, answers)).toEqual(["red"]);
  });

  it("3 型同点は 3 件を配列順で返す", () => {
    // q1=a(red), q2=b(blue), q3=c(green) -> red:1, blue:1, green:1 の 3 型同点
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" }, // red
      { questionId: "q2", choiceId: "b" }, // blue
      { questionId: "q3", choiceId: "c" }, // green
    ];
    expect(getTiedTypeIds(personalityQuiz, answers)).toEqual([
      "red",
      "blue",
      "green",
    ]);
  });

  it("返り値の先頭は determineResult の決定的勝者と一致する（3型同点でも）", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" }, // red
      { questionId: "q2", choiceId: "b" }, // blue
      { questionId: "q3", choiceId: "c" }, // green
    ];
    const tied = getTiedTypeIds(personalityQuiz, answers);
    expect(tied[0]).toBe(determineResult(personalityQuiz, answers).id);
  });

  it("knowledge 型は空配列を返す（スコア閾値判定のため同点集合の概念を持たない）", () => {
    const answers: QuizAnswer[] = [{ questionId: "q1", choiceId: "a" }];
    expect(getTiedTypeIds(knowledgeQuiz, answers)).toEqual([]);
  });
});

// 2 型同点を厳密に検証するための 4 問合成 quiz。
describe("getTiedTypeIds - 2 型同点", () => {
  const fourQuestions: QuizQuestion[] = [
    {
      id: "q1",
      text: "Q1",
      choices: [{ id: "a", text: "A", points: { red: 1 } }],
    },
    {
      id: "q2",
      text: "Q2",
      choices: [{ id: "a", text: "A", points: { red: 1 } }],
    },
    {
      id: "q3",
      text: "Q3",
      choices: [{ id: "a", text: "A", points: { blue: 1 } }],
    },
    {
      id: "q4",
      text: "Q4",
      choices: [{ id: "a", text: "A", points: { blue: 1 } }],
    },
  ];
  const quiz: QuizDefinition = {
    ...personalityQuiz,
    questions: fourQuestions,
    meta: { ...personalityQuiz.meta, questionCount: 4 },
  };

  it("red:2, blue:2, green:0 -> [red, blue] を配列順で返す", () => {
    const answers: QuizAnswer[] = [
      { questionId: "q1", choiceId: "a" },
      { questionId: "q2", choiceId: "a" },
      { questionId: "q3", choiceId: "a" },
      { questionId: "q4", choiceId: "a" },
    ];
    expect(getTiedTypeIds(quiz, answers)).toEqual(["red", "blue"]);
  });
});
