/**
 * QuestionCard — 選択肢の二重発火ガード（B-620 回帰テスト）。
 *
 * 欠陥の機序:
 *  QuestionCard の旧ガードは `answered` state（`setAnswered(true)` は
 *  quizType === "knowledge" のときだけ実行される）に依存していたため、
 *  (a) personality では `answered` が永久に false でガードが効かず、
 *  (b) knowledge でも state 更新は同一 tick では反映されないため、
 *  同一レンダー内で 2 回 click が届くと onAnswer が 2 回呼ばれた。
 *
 *  QuizContainer.handleAnswer は `setAnswers([...answers, newAnswer])`（closure の
 *  同じ answers を使う）と `setCurrentIndex((prev) => prev + 1)`（関数形更新）を
 *  混在させているため、2 回呼ばれると「回答は 1 件しか増えないのに index は 2 進む」
 *  ＝設問が 1 問飛ばされ、回答が 1 件欠けたまま結果が算出される。
 *
 * 本ファイルは
 *  1. QuestionCard 単体で「同一レンダー内の 2 回 click でも onAnswer は 1 回」
 *  2. knowledge の正誤表示・disabled の見せ方が変わっていないこと
 *  3. QuizContainer と結線した状態で設問が飛ばず回答が欠けないこと
 * を恒久的に守る。
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuestionCard from "../QuestionCard";
import QuizContainer from "../QuizContainer";
import type {
  QuizAnswer,
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

// ResultExtraLoader は QuizContainer から answers をそのまま受け取る唯一の子。
// ここをスパイ化することで「結果算出に使われた回答」の実体を検査できる。
// vi.mock のファクトリは巻き上げられるため vi.hoisted で受け皿を先に作る。
const { recordedAnswers } = vi.hoisted(() => ({
  recordedAnswers: [] as Array<ReadonlyArray<QuizAnswer>>,
}));

vi.mock("../ResultExtraLoader", () => ({
  default: ({ answers }: { answers: QuizAnswer[] }) => {
    recordedAnswers.push([...answers]);
    return null;
  },
}));

// 結果系は重量級なので軽量モック（本テストは回答の記録と設問送りを観察するのが目的）。
vi.mock("../ResultCard", () => ({
  default: () => <div data-testid="result-card" />,
}));
vi.mock("../ResultNextContent", () => ({
  default: () => null,
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

// analytics.ts は window.gtag を直接呼ぶのでスタブを差し込む。
const gtagSpy = vi.fn();
beforeEach(() => {
  gtagSpy.mockClear();
  recordedAnswers.length = 0;
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
});

/** personality 用の 1 設問（選択肢 2 つ）。 */
function makePersonalityQuestion(): QuizQuestion {
  return {
    id: "q1",
    text: "問1",
    choices: [
      { id: "c1a", text: "選択1A", points: { "type-a": 1 } },
      { id: "c1b", text: "選択1B", points: { "type-b": 1 } },
    ],
  };
}

/** knowledge 用の 1 設問（正解・不正解と解説つき）。 */
function makeKnowledgeQuestion(): QuizQuestion {
  return {
    id: "q1",
    text: "問1",
    choices: [
      { id: "c1a", text: "選択1A", isCorrect: true },
      { id: "c1b", text: "選択1B", isCorrect: false },
    ],
    explanation: "解説文",
  };
}

/** 選択肢ボタン（テキストが「選択」で始まるもの）を表示順で返す。 */
function getChoiceButtons(): HTMLElement[] {
  return screen
    .getAllByRole("button")
    .filter((b) => /^選択/.test(b.textContent ?? ""));
}

/**
 * 同一レンダー内（同一 tick・React の再レンダー commit を挟まない）で
 * 連続して click を届ける。実機の二重タップ / 入力イベントのまとめ配送に相当する。
 */
async function clickTwiceInSameRender(buttons: HTMLElement[]) {
  await act(async () => {
    for (const button of buttons) {
      button.click();
    }
  });
}

/** N 問の personality quiz（設問送りを観察できる最小構成）。 */
function makeNQuestionPersonalityQuiz(questionCount: number): QuizDefinition {
  const meta: QuizMeta = {
    // determineResult（汎用 personality 判定）を通す slug を使う。
    slug: "animal-personality",
    title: "動物診断",
    type: "personality",
    description: "テスト",
    questionCount,
  } as QuizMeta;
  const questions: QuizQuestion[] = Array.from(
    { length: questionCount },
    (_, i) => ({
      id: `q${i + 1}`,
      text: `問${i + 1}`,
      choices: [
        { id: `c${i + 1}a`, text: `選択${i + 1}A`, points: { "type-a": 1 } },
        { id: `c${i + 1}b`, text: `選択${i + 1}B`, points: { "type-b": 1 } },
      ],
    }),
  );
  const results: QuizResult[] = [
    { id: "type-a", title: "タイプA", description: "A" },
    { id: "type-b", title: "タイプB", description: "B" },
  ];
  return { meta, questions, results };
}

describe("QuestionCard — 選択肢の二重発火ガード（B-620）", () => {
  test("personality: 同じ選択肢が同一レンダー内で 2 回押されても onAnswer は 1 回だけ", async () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={makePersonalityQuestion()}
        quizType="personality"
        onAnswer={onAnswer}
        onNext={vi.fn()}
      />,
    );
    // 選択肢は shuffle されるので表示順ではなく名前で特定する。
    const choice = screen.getByRole("button", { name: /選択1A/ });
    await clickTwiceInSameRender([choice, choice]);

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith("c1a");
  });

  test("personality: 別々の選択肢が同一レンダー内で押されても最初の 1 回だけが通る", async () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={makePersonalityQuestion()}
        quizType="personality"
        onAnswer={onAnswer}
        onNext={vi.fn()}
      />,
    );
    const buttons = getChoiceButtons();
    expect(buttons).toHaveLength(2);
    await clickTwiceInSameRender(buttons);

    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  test("knowledge: 同じ選択肢が同一レンダー内で 2 回押されても onAnswer は 1 回だけ", async () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={makeKnowledgeQuestion()}
        quizType="knowledge"
        onAnswer={onAnswer}
        onNext={vi.fn()}
      />,
    );
    const choice = screen.getByRole("button", { name: /選択1A/ });
    await clickTwiceInSameRender([choice, choice]);

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith("c1a");
  });

  test("knowledge: 回答後の正誤表示・disabled・解説・次へボタンの見せ方は変わらない", async () => {
    render(
      <QuestionCard
        question={makeKnowledgeQuestion()}
        quizType="knowledge"
        onAnswer={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    // 不正解の選択肢を 1 回だけ押す（正誤ラベルの出方を両方見るため）。
    const wrongChoice = screen.getByRole("button", { name: /選択1B/ });
    await act(async () => {
      wrongChoice.click();
    });

    // 色だけでなく文字ラベルで正誤を伝える（WCAG 1.4.1）。
    expect(screen.getByText("正解")).toBeInTheDocument();
    expect(screen.getByText("あなたの回答")).toBeInTheDocument();
    // 回答後は全選択肢が disabled になる。
    for (const button of getChoiceButtons()) {
      expect(button).toBeDisabled();
    }
    expect(screen.getByText("解説文")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "次へ" })).toBeInTheDocument();
  });

  test("personality: 回答後も選択肢は disabled にならず、正誤ラベル・次へは出ない", async () => {
    // personality は即座に次設問へ遷移して QuestionCard が再マウントされるため、
    // disabled にする視覚的意味がない一方、押下直後にフォーカス中のボタンを
    // 不活性化するとフォーカスが失われ SR 利用者の現在位置が壊れる。
    // 二重発火の抑止は同期 ref ロックが担うので、見せ方は変えない。
    render(
      <QuestionCard
        question={makePersonalityQuestion()}
        quizType="personality"
        onAnswer={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    const [firstChoice] = getChoiceButtons();
    await act(async () => {
      firstChoice.click();
    });

    for (const button of getChoiceButtons()) {
      expect(button).not.toBeDisabled();
    }
    expect(screen.queryByText("正解")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "次へ" })).toBeNull();
  });
});

describe("QuizContainer + QuestionCard — 二重発火で設問が飛ばない（B-620）", () => {
  /** intro→playing へ遷移する（"はじめる" を押す）。 */
  async function startQuiz(quiz: QuizDefinition) {
    render(<QuizContainer quiz={quiz} />);
    const startBtn = screen.getByRole("button", { name: "はじめる" });
    await act(async () => {
      startBtn.click();
    });
  }

  test("中盤の設問で二重発火しても次の設問へ 1 問だけ進む（設問飛ばしが起きない）", async () => {
    await startQuiz(makeNQuestionPersonalityQuiz(3));
    expect(
      screen.getByRole("heading", { level: 2, name: "問1" }),
    ).toBeInTheDocument();

    await clickTwiceInSameRender([
      getChoiceButtons()[0],
      getChoiceButtons()[0],
    ]);

    // 問2 が表示されている（問3 へ飛んでいない）。
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: "問3" })).toBeNull();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  test("全設問で二重発火しても回答は設問数ぶん記録され、level_end は 1 回だけ発火する", async () => {
    const quiz = makeNQuestionPersonalityQuiz(3);
    await startQuiz(quiz);

    for (let i = 0; i < quiz.questions.length; i++) {
      await clickTwiceInSameRender([
        getChoiceButtons()[0],
        getChoiceButtons()[0],
      ]);
    }

    // 結果に到達している。
    expect(screen.getByTestId("result-card")).toBeInTheDocument();

    // 結果算出に渡された回答が全設問ぶん揃っている（1 件も欠けていない）。
    const finalAnswers = recordedAnswers[recordedAnswers.length - 1];
    expect(finalAnswers).toHaveLength(quiz.questions.length);
    expect(finalAnswers.map((a) => a.questionId)).toEqual(["q1", "q2", "q3"]);

    // 完走イベントも二重に飛ばない。
    const levelEndCalls = gtagSpy.mock.calls.filter(
      (c) => c[1] === "level_end",
    );
    expect(levelEndCalls).toHaveLength(1);
  });
});
