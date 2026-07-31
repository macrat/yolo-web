/**
 * 選択肢・「次へ」の二重発火で設問が飛ぶ欠陥（B-620 回帰テスト）。
 *
 * 欠陥の機序:
 *  QuizContainer は phase / currentIndex / answers を別々の useState で持ち、
 *  `setAnswers([...answers, a])`（closure の値＝重複しても 1 件しか増えない）と
 *  `setCurrentIndex((prev) => prev + 1)`（関数形＝呼ばれた回数だけ進む）を
 *  混在させていた。そのため同じ経路が 2 回届くと「回答は 1 件しか増えないのに
 *  index は 2 進む」＝設問が 1 問飛ばされ、回答が 1 件欠けたまま結果が算出された。
 *  二重発火の経路は 3 つある。
 *   - 同一レンダー内の 2 回 click（旧 `answered` state ガードは personality では
 *     永久に false・knowledge でも同一 tick には反映されないため素通りした）。
 *   - knowledge の「次へ」（ガードが一切無かった）。
 *   - 実機の二重タップの 2 回目（**別 task** で届くのでマウント単位の ref では
 *     原理的に止まらず、再マウント後の新しい設問への回答として通ってしまう）。
 *
 * 本ファイルは
 *  1. QuestionCard 単体で「同一レンダー内の 2 回 click でも onAnswer は 1 回」
 *  2. knowledge の正誤表示・disabled の見せ方が変わっていないこと
 *  3. QuizContainer と結線した状態で、上記 3 経路のいずれでも設問が飛ばず
 *     回答が欠けないこと
 * を恒久的に守る。進行状態の不変条件そのものは quizProgress.test.ts が守る。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuestionCard from "../QuestionCard";
import QuizContainer from "../QuizContainer";
import { calculateKnowledgeScore } from "../../scoring";
import {
  activationOriginOfClick,
  SCREEN_SWAP_SETTLE_MS,
} from "../../quizProgress";
import { installQuizTestClock, type QuizTestClock } from "@/test/quizTestClock";
import { makeTestQuizMeta } from "@/test/quizFixtures";
import { clickAsKeyboard, clickAsPointer } from "@/test/quizClicks";
import type { ActivationOrigin } from "../../quizProgress";
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
// 「もう一度挑戦する」だけは本物と同じ結線（click の発生源を親へ渡す）で置く。
// result→intro は QuizContainer が起こす4つ目の画面の入れ替わりで、そこだけ扱いが
// 違う（窓ではなく intro へのリビールで塞ぐ）ため、モックで潰すと検証できなくなる。
vi.mock("../ResultCard", () => ({
  default: ({ onRetry }: { onRetry: (origin: ActivationOrigin) => void }) => (
    <div data-testid="result-card">
      <button
        type="button"
        onClick={(event) => onRetry(activationOriginOfClick(event.detail))}
      >
        もう一度挑戦する
      </button>
    </div>
  ),
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
// QuizContainer の遷移間隔ガードを制御する時計。テストからは「来訪者が普通に
// 時間をかけて答えた」ことと「二重タップの 2 回目が Nms 後に届いた」ことを
// 明示的に書き分ける。
let clock: QuizTestClock;
beforeEach(() => {
  gtagSpy.mockClear();
  recordedAnswers.length = 0;
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
  clock = installQuizTestClock();
});
afterEach(() => {
  clock.restore();
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
 *
 * 送るのは**ポインタ由来**の click（`clickAsPointer`）。`HTMLElement.click()` は
 * 仕様上キーボード等と同じ合成 click（detail = 0）で、指のタップの代わりに
 * ならないため（詳細は `src/test/quizClicks.ts`）。
 */
async function clickTwiceInSameRender(buttons: HTMLElement[]) {
  await act(async () => {
    for (const button of buttons) {
      clickAsPointer(button);
    }
  });
}

/** N 問の personality quiz（設問送りを観察できる最小構成）。 */
function makeNQuestionPersonalityQuiz(questionCount: number): QuizDefinition {
  const meta: QuizMeta = makeTestQuizMeta({
    // determineResult（汎用 personality 判定）を通す slug を使う。
    slug: "animal-personality",
    title: "動物診断",
    type: "personality",
    category: "personality",
    questionCount,
  });
  // 戻り値の型を明示する: Array.from の callback には QuizQuestion[] の文脈型が
  // 伝播しないため、注釈がないと choices[].points が
  // `{ "type-a": number; "type-b"?: undefined }` の union に推論され
  // Record<string, number> へ代入不能になる（typecheck が落ちる）。
  const questions: QuizQuestion[] = Array.from(
    { length: questionCount },
    (_, i): QuizQuestion => ({
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

/** N 問の knowledge quiz（「次へ」経路とスコアを観察できる最小構成）。 */
function makeNQuestionKnowledgeQuiz(questionCount: number): QuizDefinition {
  const meta: QuizMeta = makeTestQuizMeta({
    slug: "kanji-level",
    title: "漢字レベル",
    type: "knowledge",
    category: "knowledge",
    questionCount,
  });
  const questions: QuizQuestion[] = Array.from(
    { length: questionCount },
    (_, i): QuizQuestion => ({
      id: `q${i + 1}`,
      text: `問${i + 1}`,
      choices: [
        // 名前は getChoiceButtons（/^選択/）で拾えるようにしつつ、正誤を判別できる形にする。
        { id: `c${i + 1}a`, text: `選択${i + 1}正`, isCorrect: true },
        { id: `c${i + 1}b`, text: `選択${i + 1}誤`, isCorrect: false },
      ],
      explanation: `解説${i + 1}`,
    }),
  );
  // 満点でのみ到達する結果を用意し、回答欠落があればレベルが下がるようにする。
  const results: QuizResult[] = [
    { id: "lv-low", title: "レベル低", description: "低", minScore: 0 },
    {
      id: "lv-high",
      title: "レベル高",
      description: "高",
      minScore: questionCount,
    },
  ];
  return { meta, questions, results };
}

describe("QuestionCard — 選択肢の二重発火ガード（B-620）", () => {
  test("personality: 同じ選択肢が同一レンダー内で 2 回押されても onAnswer は 1 回だけ", async () => {
    // onAnswer は「受け付けた」を意味する true を返す契約（親が弾いたときのみ false）。
    const onAnswer = vi.fn(() => true);
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
    // 第3引数は click の発生源。ポインタ由来の click は detail >= 1 なので "pointer"。
    expect(onAnswer).toHaveBeenCalledWith("q1", "c1a", "pointer");
  });

  test("personality: 別々の選択肢が同一レンダー内で押されても最初の 1 回だけが通る", async () => {
    // onAnswer は「受け付けた」を意味する true を返す契約（親が弾いたときのみ false）。
    const onAnswer = vi.fn(() => true);
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
    // onAnswer は「受け付けた」を意味する true を返す契約（親が弾いたときのみ false）。
    const onAnswer = vi.fn(() => true);
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
    // 第3引数は click の発生源。ポインタ由来の click は detail >= 1 なので "pointer"。
    expect(onAnswer).toHaveBeenCalledWith("q1", "c1a", "pointer");
  });

  test("knowledge: 回答後の正誤表示・disabled・解説・次へボタンの見せ方は変わらない", async () => {
    render(
      <QuestionCard
        question={makeKnowledgeQuestion()}
        quizType="knowledge"
        onAnswer={vi.fn(() => true)}
        onNext={vi.fn()}
      />,
    );
    // 不正解の選択肢を 1 回だけ押す（正誤ラベルの出方を両方見るため）。
    const wrongChoice = screen.getByRole("button", { name: /選択1B/ });
    await act(async () => {
      clickAsPointer(wrongChoice);
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
        onAnswer={vi.fn(() => true)}
        onNext={vi.fn()}
      />,
    );
    const [firstChoice] = getChoiceButtons();
    await act(async () => {
      clickAsPointer(firstChoice);
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
      clickAsPointer(startBtn);
    });
  }

  /** 「次へ」を1回押す（間隔ガードを通過させてから）。 */
  async function clickNext() {
    clock.advancePastTransitionGuard();
    const nextButton = screen.getByRole("button", { name: "次へ" });
    await act(async () => {
      clickAsPointer(nextButton);
    });
  }

  test("中盤の設問で二重発火しても次の設問へ 1 問だけ進む（設問飛ばしが起きない）", async () => {
    await startQuiz(makeNQuestionPersonalityQuiz(3));
    expect(
      screen.getByRole("heading", { level: 2, name: "問1" }),
    ).toBeInTheDocument();

    clock.advancePastTransitionGuard();
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
      clock.advancePastTransitionGuard();
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

  test("欠陥1: knowledge の「次へ」が同一レンダー内で 2 回押されても 1 問しか進まない", async () => {
    await startQuiz(makeNQuestionKnowledgeQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });

    clock.advancePastTransitionGuard();
    const nextButton = screen.getByRole("button", { name: "次へ" });
    await clickTwiceInSameRender([nextButton, nextButton]);

    // 問2 が表示されている（問3 へ飛んでいない）。
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  test("欠陥1: 「次へ」を間隔ガードを跨いで 2 回押しても設問は飛ばない（冪等性そのもの）", async () => {
    // 間隔ガードに頼らず、進行状態の不変条件だけで守れていることを確認する。
    // 1 回目の「次へ」で問2 へ進んだ後、問2 は未回答なので 2 回目は効かない。
    await startQuiz(makeNQuestionKnowledgeQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    await clickNext();
    // 問2 の画面には「次へ」が無い（未回答なので押しようがない）。
    expect(screen.queryByRole("button", { name: "次へ" })).toBeNull();
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();
  });

  test("欠陥1: knowledge を完走すると回答が全設問ぶん揃う（満点が欠けない）", async () => {
    const quiz = makeNQuestionKnowledgeQuiz(3);
    await startQuiz(quiz);
    for (let i = 0; i < quiz.questions.length; i++) {
      clock.advancePastTransitionGuard();
      // 各設問で選択肢と「次へ」をそれぞれ二重に押す。
      const choice = screen.getByRole("button", { name: `選択${i + 1}正` });
      await clickTwiceInSameRender([choice, choice]);
      clock.advancePastTransitionGuard();
      const nextButton = screen.getByRole("button", { name: "次へ" });
      await clickTwiceInSameRender([nextButton, nextButton]);
    }

    expect(screen.getByTestId("result-card")).toBeInTheDocument();
    const finalAnswers = recordedAnswers[recordedAnswers.length - 1];
    expect(finalAnswers.map((a) => a.questionId)).toEqual(["q1", "q2", "q3"]);
    // 全問正解を選んだので、欠落があればスコアが下がる。
    expect(calculateKnowledgeScore(quiz.questions, [...finalAnswers])).toBe(3);
  });

  // 実機の二重タップの 2 回目は別 task で届くため、1 回目で再マウントされた
  // 新しい QuestionCard のボタンに落ちる（＝マウント単位の ref では止まらない）。
  // 進行状態の冪等化でも「次の設問への正当な回答」と区別できないので、
  // 遷移の最小間隔ガードで弾く。
  //
  // 掃引する間隔は**窓の根拠に合わせて**選んでいる: OS が 1 つのジェスチャと
  // 見なす範囲（Android の DOUBLE_TAP_TIMEOUT 300ms・Windows のダブルクリック
  // 既定 500ms）と、レビューが実機で 2 回目のタップを再現できた 500ms までを
  // 覆う。**実タップの間隔は未計装＝未測定**であり、本番 GA の 0〜175ms は
  // 同一 task の 2 回発火に対する送信/収集タイムスタンプの差であって、ここで
  // 塞ぐ「別 task の 2 打目」の間隔ではない（quizProgress.ts の
  // MIN_MS_BETWEEN_ACCEPTED_TRANSITIONS のコメントを参照）。
  test.each([0, 20, 40, 60, 80, 120, 175, 250, 350, 500])(
    "欠陥2: 遷移から %ims 後に同じ座標へ届いた 2 回目のタップは次の設問に入らない",
    async (gapMs) => {
      await startQuiz(makeNQuestionPersonalityQuiz(3));
      clock.advancePastTransitionGuard();
      await act(async () => {
        clickAsPointer(getChoiceButtons()[0]);
      });
      expect(
        screen.getByRole("heading", { level: 2, name: "問2" }),
      ).toBeInTheDocument();

      clock.advance(gapMs);
      await act(async () => {
        clickAsPointer(getChoiceButtons()[0]);
      });

      // 問2 に留まっており、問2 への回答も記録されていない。
      expect(
        screen.getByRole("heading", { level: 2, name: "問2" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "2",
      );
    },
  );

  test("弾かれたタップの後でも、同じ設問に答え直せる（詰まりが残らない）", async () => {
    // 弾かれたのは「記録されなかった」というだけで、来訪者はその設問にまだ
    // 答えていない。QuestionCard 側のロックが掛かって二度と答えられなくなる
    // ことがあってはならない。
    await startQuiz(makeNQuestionPersonalityQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    // 遷移直後の余波タップ（弾かれる）。
    clock.advance(100);
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
    // 改めて答える。
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問3" }),
    ).toBeInTheDocument();
  });

  test("knowledge: 弾かれたタップでは正誤表示も出ない（記録の無い回答を見せない）", async () => {
    await startQuiz(makeNQuestionKnowledgeQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "選択1正" }));
    });
    await clickNext();
    // 問2 の表示直後（間隔ガード内）のタップ。
    clock.advance(100);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "選択2誤" }));
    });
    expect(screen.queryByText("あなたの回答")).not.toBeInTheDocument();
    expect(screen.queryByText("解説2")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "次へ" })).toBeNull();

    // 改めて答えれば通常どおり正誤と解説が出る。
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "選択2正" }));
    });
    expect(screen.getByText("解説2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "次へ" })).toBeInTheDocument();
  });

  // 3巡目 Major 1 の回帰: knowledge の「回答→次へ」に間隔ガードを掛けてはならない
  // （以下の test 名の「Major1回帰」もこの巡を指す）。
  //
  // 回答しても**表示中の設問は変わらない**（選択肢は同じ位置に残って disabled に
  // なり、「次へ」はその下に生える）。つまり2打目が落ちる先は「同じ disabled ボタン」
  // でしかなく、間隔ガードが追加で防ぐものは無い。一方で摩擦は実在し、解説を読まない
  // 来訪者が答えた直後に押す「次へ」を無言で弾いていた（実機で 79/170/321/469/559ms
  // が無視され 660ms で初めて通ることを実測）。
  //
  // 既存の他テストは clock.advancePastTransitionGuard() を挟むので、この摩擦を
  // 構造的に検出できない。ここでは**時計を進めずに**押す。
  test.each([0, 50, 150, 300, 450, 550])(
    "Major1回帰: knowledge で回答の %ims 後に「次へ」を1回押したら進む",
    async (gapMs) => {
      await startQuiz(makeNQuestionKnowledgeQuiz(3));
      clock.advancePastTransitionGuard();
      await act(async () => {
        clickAsPointer(getChoiceButtons()[0]);
      });
      expect(screen.getByRole("button", { name: "次へ" })).toBeInTheDocument();

      // 回答から gapMs しか経っていない状態で「次へ」を**1回だけ**押す。
      clock.advance(gapMs);
      await act(async () => {
        clickAsPointer(screen.getByRole("button", { name: "次へ" }));
      });

      expect(
        screen.getByRole("heading", { level: 2, name: "問2" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "2",
      );
    },
  );

  test("Major1回帰: 「次へ」で設問が変わった直後のタップは（これまでどおり）弾かれる", async () => {
    // 「次へ」自体を素通しにしても、その先の設問への誤入力は塞がれたままであること。
    // ＝ 3巡目 Major 1 の修正で守りが減っていないことの確認。
    await startQuiz(makeNQuestionKnowledgeQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    clock.advance(50);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "次へ" }));
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();

    // 「次へ」の2打目に相当する、設問2の選択肢への誤タップ。
    clock.advance(90);
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    expect(screen.queryByRole("button", { name: "次へ" })).toBeNull();
    expect(screen.queryByText("解説2")).not.toBeInTheDocument();
  });

  test("欠陥2: 間隔ガードを越えた回答（＝正当な高速回答）は通る", async () => {
    await startQuiz(makeNQuestionPersonalityQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    // 617ms は BigQuery で観測された最速セッションの**平均**ペース（617ms/問）。
    // 設問ごとの間隔ではないので「これより速い回答が無い」ことの証明にはならず、
    // ここでは「窓のすぐ外にある実在の量でも通る」ことの確認として使う。
    clock.advance(617);
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問3" }),
    ).toBeInTheDocument();
  });

  test("「はじめる」を同一レンダー内で 2 回押しても level_start は 1 回だけ", async () => {
    // 来訪者への影響は無い（進行状態は reducer が冪等）が、B-613 は
    // `runs_with_start` を分母に使う。1 プレイで 2 回飛ぶと読みが静かに歪む。
    render(<QuizContainer quiz={makeNQuestionPersonalityQuiz(3)} />);
    const startBtn = screen.getByRole("button", { name: "はじめる" });
    await clickTwiceInSameRender([startBtn, startBtn]);

    expect(
      screen.getByRole("heading", { level: 2, name: "問1" }),
    ).toBeInTheDocument();
    const levelStartCalls = gtagSpy.mock.calls.filter(
      (c) => c[1] === "level_start",
    );
    expect(levelStartCalls).toHaveLength(1);
  });
});

/**
 * 6巡目 Major 1 の回帰。**ガードはポインタ由来の click にしか当たらない。**
 *
 * 間隔ガードが守っているのは「1 つのジェスチャの 2 打目が、画面の入れ替わりで
 * 別の要素へ落ちる」ことだけで、これは**座標のヒットテストを経て届く入力**にしか
 * 起こらない。キーボード（Enter / Space）や支援技術の起動は要素を名指しで叩くので、
 * 1 つの操作が 2 つの要素に届く経路が原理的に無い——にもかかわらずガードを当てて
 * いたため、キーボードのみの来訪者は 50/150/300/500ms の回答をすべて無言で捨てられ、
 * 「Enter が効かない」だけが残っていた（レビュアーが実ブラウザで実測）。
 *
 * 判別は `click` の `detail`（クリック回数）。ポインタ由来は 1 以上、合成 click は
 * 0 になる（根拠と一次資料は quizProgress.ts の activationOriginOfClick）。
 */
describe("QuizContainer — 間隔ガードはポインタ由来の click にだけ当たる（B-620 6巡目 Major 1）", () => {
  async function startQuiz(quiz: QuizDefinition) {
    render(<QuizContainer quiz={quiz} />);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
  }

  test.each([0, 50, 150, 300, 500])(
    "personality: 設問が変わった %ims 後のキーボード回答（Tab→Enter）は通る",
    async (gapMs) => {
      await startQuiz(makeNQuestionPersonalityQuiz(3));
      clock.advancePastTransitionGuard();
      await act(async () => {
        clickAsKeyboard(getChoiceButtons()[0]);
      });
      expect(
        screen.getByRole("heading", { level: 2, name: "問2" }),
      ).toBeInTheDocument();

      // 設問 2 が出た gapMs 後に、キーボードで 2 問目に答える。
      clock.advance(gapMs);
      await act(async () => {
        clickAsKeyboard(getChoiceButtons()[0]);
      });

      expect(
        screen.getByRole("heading", { level: 2, name: "問3" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "3",
      );
    },
  );

  test.each([0, 50, 150, 300, 500])(
    "knowledge: 設問が変わった %ims 後のキーボード回答は記録され、正誤と解説が出る",
    async (gapMs) => {
      await startQuiz(makeNQuestionKnowledgeQuiz(3));
      clock.advancePastTransitionGuard();
      await act(async () => {
        clickAsKeyboard(screen.getByRole("button", { name: "選択1正" }));
      });
      await act(async () => {
        clickAsKeyboard(screen.getByRole("button", { name: "次へ" }));
      });
      expect(
        screen.getByRole("heading", { level: 2, name: "問2" }),
      ).toBeInTheDocument();

      clock.advance(gapMs);
      await act(async () => {
        clickAsKeyboard(screen.getByRole("button", { name: "選択2正" }));
      });

      expect(screen.getByText("解説2")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "次へ" })).toBeInTheDocument();
    },
  );

  test("同じ 0ms でも、ポインタの 2 打目は弾かれキーボードは通る（判別が空振りでない）", async () => {
    // 片方だけを見ると「ガードを外した」のか「発生源で分けた」のか区別できない。
    // **同一の時刻**で両方を撃ち、結果が分かれることを 1 つのテストで示す。
    await startQuiz(makeNQuestionPersonalityQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();

    // 時計は 1ms も進めない。まずポインタ由来の 2 打目 → 弾かれる。
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );

    // 同じ時刻のキーボード起動 → 通る。
    await act(async () => {
      clickAsKeyboard(getChoiceButtons()[0]);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問3" }),
    ).toBeInTheDocument();
  });

  test("キーボードで完走しても回答は全設問ぶん揃う（時計を一切進めない）", async () => {
    const quiz = makeNQuestionPersonalityQuiz(3);
    await startQuiz(quiz);
    for (let i = 0; i < quiz.questions.length; i++) {
      await act(async () => {
        clickAsKeyboard(getChoiceButtons()[0]);
      });
    }
    expect(screen.getByTestId("result-card")).toBeInTheDocument();
    const finalAnswers = recordedAnswers[recordedAnswers.length - 1];
    expect(finalAnswers.map((a) => a.questionId)).toEqual(["q1", "q2", "q3"]);
  });
});

/**
 * 3巡目 Major 2（新規発見）の回帰。
 *
 * 最終設問の「次へ」を二重タップすると、1打目で phase が result になり、2打目は
 * **結果画面に切り替わった後の座標**に落ちる。3巡目に**1本で**、そこが推薦リンク
 * だったために /play/kotowaza-level・/play/daily へ離脱するのを観測した
 * （gap 90/200/400ms）。10問答えた対価である結果を一度も見られない。
 *
 * **ただし全15本で成り立つ主張ではない。** 9巡目の15本悉皆ではタップ座標に操作
 * 要素が来た本は 0/15 で、窓を残しているのは「リビール直後のビューポート内に結果
 * 領域の操作要素がある本が 3/15 実在する」ことに対する保険である（根拠と残る
 * 不確実性は quizProgress.ts の settleScopeAfterScreenSwap 経路3）。
 *
 * 塞ぎ方は「リビール直後の短い窓だけ結果領域がポインタ入力を受け取らない」。
 * jsdom は座標も CSS の pointer-events も評価しないので、ここでは**窓が立つこと・
 * 外れること**を属性で検査する（実際に離脱しないことは実ブラウザで確認する）。
 */
describe("QuizContainer — 結果リビール直後のポインタ入力の窓（B-620 3巡目 Major 2）", () => {
  /** knowledge を最後まで解いて result phase へ到達する。 */
  async function playKnowledgeToResult(questionCount: number) {
    const quiz = makeNQuestionKnowledgeQuiz(questionCount);
    render(<QuizContainer quiz={quiz} />);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
    for (let i = 0; i < questionCount; i++) {
      clock.advancePastTransitionGuard();
      await act(async () => {
        clickAsPointer(screen.getByRole("button", { name: `選択${i + 1}正` }));
      });
      await act(async () => {
        clickAsPointer(screen.getByRole("button", { name: "次へ" }));
      });
    }
    expect(screen.getByTestId("result-card")).toBeInTheDocument();
  }

  test("結果に到達した直後、結果領域はポインタ入力を受け取らない", async () => {
    await playKnowledgeToResult(3);
    expect(screen.getByRole("region", { name: "クイズ結果" })).toHaveAttribute(
      "data-settling",
      "true",
    );
  });

  test("窓は自動的に外れる（結果の操作が恒久に死なない）", async () => {
    // setTimeout / clearTimeout だけを差し替える。Date は差し替えない
    // （進行の時計は installQuizTestClock の Date.now スパイが持っているため）。
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      await playKnowledgeToResult(3);
      const region = screen.getByRole("region", { name: "クイズ結果" });
      expect(region).toHaveAttribute("data-settling", "true");

      await act(async () => {
        vi.advanceTimersByTime(SCREEN_SWAP_SETTLE_MS);
      });
      expect(region).not.toHaveAttribute("data-settling");
    } finally {
      vi.useRealTimers();
    }
  });
});

/**
 * 7巡目 Major 1（第4経路の発見）→ 8巡目 Blocker 1（リビールの欠落）→
 * 10巡目 Blocker 1（窓の撤去根拠が実測で成立しない）の回帰。
 * **第4の画面の入れ替わり: result→intro（もう一度挑戦する）。**
 *
 * 1打目で intro へ戻るとページが一気に短くなる。ところが retry には
 * 「入れ替わった先の画面へスクロールしてフォーカスを移す」処理が無かったため、
 * スクロール位置は縮んだ高さにクランプされるだけで、**視界は縮む前と同じ共通
 * フッタのまま・フォーカスは `<body>` に落ちる**という状態になっていた
 * （実測 375×667・animal-personality: 「はじめる」が `top: -2,384px`＝3.5画面ぶん
 * 上・`document.activeElement` は BODY。値は cycle-301 review-log 8巡目に揃えて
 * ある）。来訪者から見れば「押しても何も起きて
 * いない」ので、もう一度押すのは当然であり、しかもその時点で視界にある唯一の
 * 操作要素が共通フッタのナビだった——それが「2打目が離脱に化ける」の実態である。
 *
 * かつてはこの症状を**ページ全体（body）へ `pointer-events: none` を掛ける窓**で
 * 覆っていたが、根本原因はスクロール位置とフォーカスの未処理であって2打目の
 * 落ち先ではない（AP-I02）。**リビールがこの経路の根本是正であり、body 全体の窓は
 * それによって不要になったので機構ごと撤去した。**
 *
 * **ただし窓が丸ごと不要になったわけではない。** 撤去当時の根拠は「窓なしで実ブラウザ
 * 15本 × 8間隔（0/40/90/140/200/300/500/700ms）＝120 試行すべてで離脱ゼロ」だったが、
 * **その 120 試行は1つのスクロール位置に固定して測ったもの**だった（結果まで解いた
 * 直後の位置＝retry ボタンが y≈312）。retry ボタンの画面内位置だけを振って測り直すと
 * **3本12試行中5件が他のクイズへ離脱**した（gap 150ms。着弾先は intro の関連リンクで、
 * これは 15/15 本のクイズ定義に存在する）ため、**範囲を intro 領域に
 * 限った窓**を入れ直した。脆弱帯は**少なくとも y≈145–190**（11巡目の独立ハーネス:
 * 190 で 3/3 離脱・205 で消失・130 では離脱なし）、細かい25点掃引のハーネスでは
 * **y≈145–215** まで観測されている——**上端はハーネスによって割れているので一方を
 * 正とせず、測り直すときは最低でも y=120〜215 を掃くこと**（初報の 140–185 だけを
 * 測ると実在する帯を取りこぼす。詳細は quizProgress.ts の経路4）。
 * いま窓が立つのは経路3（`result-region`）と
 * 経路4（`intro-region`）の2つである。
 *
 * jsdom は座標も CSS も評価しないので、ここでは**リビールが起きること**と
 * **窓がどこに立つ／立たないか**を検査する（実際に離脱しないことは実ブラウザ）。
 */
/**
 * 「**ページ全体を不活性にする機構を持たない**」ことの検査。
 *
 * `document.body.className` の不変だけでは弱い——同じ機構は
 * `body.style.pointerEvents = "none"` の直書きや `inert` 属性でも再導入でき、
 * class 名は一切変わらない。守りたいのは class ではなく「**body が不活性でない**」
 * ことなので、実際に不活性化しうる経路をまとめて見る。
 *
 * jsdom は CSS ファイルを評価しないので、**CSS class 経由**の再導入は
 * `getComputedStyle` では見えない。そちらは class 名の不変が受け持つ——
 * 3つを併せて初めて、現実的な再導入の経路を覆える。
 */
function expectBodyIsNotInert(bodyClassBefore: string): void {
  expect(document.body.className).toBe(bodyClassBefore);
  expect(getComputedStyle(document.body).pointerEvents).not.toBe("none");
  expect(document.body.hasAttribute("inert")).toBe(false);
}

describe("QuizContainer — retry のリビールと窓の範囲（B-620 8巡目 Blocker 1・10巡目 Blocker 1）", () => {
  let scrollIntoViewSpy: ReturnType<typeof vi.fn>;
  let originalScrollIntoView: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalScrollIntoView = Object.getOwnPropertyDescriptor(
      window.HTMLElement.prototype,
      "scrollIntoView",
    );
    // jsdom は scrollIntoView 未実装なので関数を差し込んで spy 化する。
    scrollIntoViewSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView =
      scrollIntoViewSpy as unknown as HTMLElement["scrollIntoView"];
  });

  afterEach(() => {
    if (originalScrollIntoView) {
      Object.defineProperty(
        window.HTMLElement.prototype,
        "scrollIntoView",
        originalScrollIntoView,
      );
    } else {
      Reflect.deleteProperty(window.HTMLElement.prototype, "scrollIntoView");
    }
  });

  /** personality を完走して result phase へ到達する（ポインタ操作）。 */
  async function playPersonalityToResult(questionCount: number) {
    const quiz = makeNQuestionPersonalityQuiz(questionCount);
    const view = render(<QuizContainer quiz={quiz} />);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
    for (let i = 0; i < questionCount; i++) {
      clock.advancePastTransitionGuard();
      await act(async () => {
        clickAsPointer(getChoiceButtons()[0]);
      });
    }
    expect(screen.getByTestId("result-card")).toBeInTheDocument();
    return view;
  }

  async function clickRetry() {
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "もう一度挑戦する" }));
    });
  }

  test("経路4: retry で intro 領域へスクロールし、フォーカスが <body> に落ちない", async () => {
    await playPersonalityToResult(3);
    scrollIntoViewSpy.mockClear();

    await clickRetry();

    const introRegion = screen.getByRole("region", { name: "診断のはじめ" });
    expect(introRegion).toHaveAttribute("tabindex", "-1");
    // 「はじめる」が視界に入る＝来訪者が「戻った」と分かる状態にする。
    expect(scrollIntoViewSpy.mock.contexts).toContain(introRegion);
    // フォーカスは intro 領域。BODY に落ちると SR 利用者の現在位置が壊れる。
    expect(document.activeElement).toBe(introRegion);
    expect(document.activeElement).not.toBe(document.body);
  });

  test("経路4: retry のスクロールは即時（数画面ぶん飛ぶので smooth にしない）", async () => {
    await playPersonalityToResult(3);
    scrollIntoViewSpy.mockClear();
    await clickRetry();

    const introRegion = screen.getByRole("region", { name: "診断のはじめ" });
    const call = scrollIntoViewSpy.mock.calls.find(
      (_c, i) => scrollIntoViewSpy.mock.contexts[i] === introRegion,
    );
    expect(call?.[0]).toEqual({ behavior: "auto", block: "start" });
  });

  test("経路4: knowledge の intro 領域のラベルは「クイズのはじめ」（N2 と同じ理由）", async () => {
    const questionCount = 2;
    render(<QuizContainer quiz={makeNQuestionKnowledgeQuiz(questionCount)} />);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
    for (let i = 0; i < questionCount; i++) {
      clock.advancePastTransitionGuard();
      await act(async () => {
        clickAsPointer(screen.getByRole("button", { name: `選択${i + 1}正` }));
      });
      await act(async () => {
        clickAsPointer(screen.getByRole("button", { name: "次へ" }));
      });
    }
    await clickRetry();
    expect(
      screen.getByRole("region", { name: "クイズのはじめ" }),
    ).toBeInTheDocument();
  });

  test("初回マウントの intro ではリビールしない（ページを開いただけの来訪者から見出しを奪わない）", async () => {
    render(<QuizContainer quiz={makeNQuestionPersonalityQuiz(3)} />);
    expect(
      screen.getByRole("region", { name: "診断のはじめ" }),
    ).toBeInTheDocument();
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  test("経路4: ページ全体を不活性にする機構は持たない（body に class を足さない）", async () => {
    // 根本原因（スクロールとフォーカスの未処理）を直したので、サイト全体を
    // 覆う窓は不要になった。再導入されたらこの検査が落ちる。
    // **窓そのものは intro 領域に存在する**（次の test）。ここが守っているのは
    // 「窓の範囲がコンポーネントの外へ出ていないこと」であって、窓の不在ではない。
    await playPersonalityToResult(3);
    const bodyClassBefore = document.body.className;
    await clickRetry();
    expect(
      screen.getByRole("button", { name: "はじめる" }),
    ).toBeInTheDocument();
    expectBodyIsNotInert(bodyClassBefore);
  });

  test("経路4: retry の窓は intro 領域だけに立つ（ヘッダ・フッタを含む祖先には及ばない）", async () => {
    // 2打目は intro に切り替わった後の同じ座標に落ちる。リビールが intro を画面
    // 先頭へ移すので、そこには関連リンク（15/15 本のクイズ定義に存在する）が必ず
    // fold 内に来る。実測（375×667・本番ビルド・gap 150ms）で retry ボタンが
    // 脆弱帯にあると 2打目が関連リンクを叩いて他のクイズへ離脱した。脆弱帯は
    // **少なくとも y≈145–190**、細かい25点掃引のハーネスでは **y≈145–215** まで
    // 観測されている（上端はハーネス差。一方を正とせず、再測は quizProgress.ts
    // 経路4 の範囲で行う）。
    //
    // **窓の範囲がヘッダ／フッタに及んでいないこと**は、属性が立つ要素が intro 領域
    // ただ1つであること＋その祖先が誰も不活性でないことで押さえる（jsdom は CSS を
    // 評価しないので pointer-events そのものは見えない。実際に離脱しないことと
    // 範囲の目視は実ブラウザで確認する）。
    const bodyClassBefore = document.body.className;
    const { container } = await playPersonalityToResult(3);
    await clickRetry();

    const introRegion = screen.getByRole("region", { name: "診断のはじめ" });
    expect(introRegion).toHaveAttribute("data-settling", "true");

    // 属性が立っているのは intro 領域だけ。祖先にも兄弟にも立っていない。
    expect(document.querySelectorAll("[data-settling]")).toHaveLength(1);
    for (
      let ancestor = introRegion.parentElement;
      ancestor !== null;
      ancestor = ancestor.parentElement
    ) {
      expect(ancestor.hasAttribute("data-settling")).toBe(false);
      expect(ancestor.hasAttribute("inert")).toBe(false);
      expect(getComputedStyle(ancestor).pointerEvents).not.toBe("none");
    }
    expectBodyIsNotInert(bodyClassBefore);
    // 「はじめる」も関連リンクも intro 領域の内側にある＝窓1つで両方を覆える。
    expect(
      introRegion.contains(screen.getByRole("button", { name: "はじめる" })),
    ).toBe(true);
    expect(container.contains(introRegion)).toBe(true);
  });

  test("経路4: retry の窓は自動的に外れる（intro の操作が恒久に死なない）", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      await playPersonalityToResult(3);
      await clickRetry();
      const introRegion = screen.getByRole("region", { name: "診断のはじめ" });
      expect(introRegion).toHaveAttribute("data-settling", "true");

      await act(async () => {
        vi.advanceTimersByTime(SCREEN_SWAP_SETTLE_MS);
      });
      expect(introRegion).not.toHaveAttribute("data-settling");
      expect(document.querySelectorAll("[data-settling]")).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("経路4: 連続プレイでも窓は毎回立ち、毎回外れる（2周目が不活性のまま残らない）", async () => {
    // 窓を畳むタイマーは useEffect(..., [settleScope])。**同じ値**を連続して set
    // すると再起動しないので、2周目の窓が無音で短くなったり、逆に外れ損ねたりする
    // 余地がある。現在の遷移規則では result-region と intro-region が必ず交互に
    // 立つので到達不能——その不変を実際に2周まわして押さえる。
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const quiz = makeNQuestionPersonalityQuiz(3);
      render(<QuizContainer quiz={quiz} />);
      for (let round = 0; round < 2; round++) {
        await act(async () => {
          clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
        });
        for (let i = 0; i < 3; i++) {
          clock.advancePastTransitionGuard();
          await act(async () => {
            clickAsPointer(getChoiceButtons()[0]);
          });
        }
        expect(
          screen.getByRole("region", { name: "診断結果" }),
        ).toHaveAttribute("data-settling", "true");
        await act(async () => {
          vi.advanceTimersByTime(SCREEN_SWAP_SETTLE_MS);
        });
        expect(
          screen.getByRole("region", { name: "診断結果" }),
        ).not.toHaveAttribute("data-settling");

        clock.advancePastTransitionGuard();
        await act(async () => {
          clickAsPointer(
            screen.getByRole("button", { name: "もう一度挑戦する" }),
          );
        });
        expect(
          screen.getByRole("region", { name: "診断のはじめ" }),
        ).toHaveAttribute("data-settling", "true");
        await act(async () => {
          vi.advanceTimersByTime(SCREEN_SWAP_SETTLE_MS);
        });
        expect(
          screen.getByRole("region", { name: "診断のはじめ" }),
        ).not.toHaveAttribute("data-settling");
      }
    } finally {
      vi.useRealTimers();
    }
  });

  test("経路4: unmount しても窓のタイマーを取り残さない（AP-I11）", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      const view = await playPersonalityToResult(3);
      await clickRetry();
      expect(
        screen.getByRole("region", { name: "診断のはじめ" }),
      ).toHaveAttribute("data-settling", "true");

      // 窓が開いている＝畳むタイマーが1本走っている。unmount の cleanup が
      // それを解除することを、**本数の差**で見る（環境が持つ他のタイマーの
      // 本数に依存しないため。絶対値で 0 を期待すると React / 計装側のタイマーを
      // 巻き込んで無関係に落ちる）。
      const pendingBeforeUnmount = vi.getTimerCount();
      view.unmount();
      expect(vi.getTimerCount()).toBe(pendingBeforeUnmount - 1);

      await act(async () => {
        vi.advanceTimersByTime(SCREEN_SWAP_SETTLE_MS * 2);
      });
      expect(document.querySelectorAll("[data-settling]")).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  test("経路4: 非ポインタ（キーボード）の retry では窓を開けない（軸3）", async () => {
    // キーボードが起こした入れ替わりの後に「そのジェスチャの2打目」は存在しない。
    // 守るものがゼロなのに intro を 600ms 不活性にするのは摩擦だけを作る。
    // 対照は下の「ポインタの retry では窓が立つ」——arm した入力の種別だけが違う。
    await playPersonalityToResult(3);
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsKeyboard(screen.getByRole("button", { name: "もう一度挑戦する" }));
    });
    expect(
      screen.getByRole("region", { name: "診断のはじめ" }),
    ).not.toHaveAttribute("data-settling");
    expect(document.querySelectorAll("[data-settling]")).toHaveLength(0);
  });

  test("対照: 同じ retry でもポインタで押せば窓が立つ（上の検査が空振りでない）", async () => {
    await playPersonalityToResult(3);
    await clickRetry();
    expect(
      screen.getByRole("region", { name: "診断のはじめ" }),
    ).toHaveAttribute("data-settling", "true");
  });

  test("初回マウントの intro には窓を立てない（ページを開いただけの来訪者を弾かない）", async () => {
    render(<QuizContainer quiz={makeNQuestionPersonalityQuiz(3)} />);
    expect(
      screen.getByRole("region", { name: "診断のはじめ" }),
    ).not.toHaveAttribute("data-settling");
  });

  test("経路3（playing→result）は結果領域だけに窓を開ける（body には掛けない）", async () => {
    // 守るのは「結果領域の中のリンク」なので、ヘッダやフッタまで不活性にするのは
    // 守るものが無いところに摩擦を作ることになる。
    const bodyClassBefore = document.body.className;
    await playPersonalityToResult(3);
    expect(screen.getByRole("region", { name: "診断結果" })).toHaveAttribute(
      "data-settling",
      "true",
    );
    expectBodyIsNotInert(bodyClassBefore);
  });

  // 窓が自動的に外れること（結果の操作が恒久に死なない）は、上の
  // 「QuizContainer — 結果リビール直後のポインタ入力の窓」の describe が守っている。

  test("経路1（intro→playing）・経路2（playing→playing）は窓を開けない", async () => {
    // 実測（全15本の悉皆・ただし**1つのスクロール位置に固定**）で2打目が落ちたのは
    // 設問見出し `H2`（経路1 は 10/15・経路2 は 12/12）か設問1の選択肢（経路1 は
    // 5/15）か `BODY`（経路2 の knowledge 3/3。B-624）で、選択肢は間隔ガードが弾く。
    // **別のスクロール位置では測っていない**——それでも窓を開けないのは、行き先の
    // playing 画面に QuizContainer が描くのが進捗バーと設問カードだけで、離脱を
    // 起こすリンクを含まないため（ヘッダ・共通フッタ等は QuizContainer の外＝
    // ここで開ける窓の範囲外）。窓まで二重に掛けるのは過剰。
    const bodyClassBefore = document.body.className;
    render(<QuizContainer quiz={makeNQuestionPersonalityQuiz(3)} />);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
    expectBodyIsNotInert(bodyClassBefore);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();

    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();
    expectBodyIsNotInert(bodyClassBefore);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});

/**
 * 7巡目 Minor 1 の回帰。**ガードと窓を arm する側の入力種別（第3の軸）。**
 *
 * 6巡目 Major 1 で「ガードを**受け取る**入力」をポインタに絞ったが、「ガードを
 * **arm する**（＝画面を入れ替えた）入力」は見ていなかった。守っているのは
 * 「1つのジェスチャの2打目」なので、画面を入れ替えたのがキーボードなら**その
 * 2打目は原理的に存在しない**——次に届くポインタ入力は必ず別のジェスチャの
 * 1打目であり、弾くのは正当な入力を無言で捨てるだけになる。
 *
 * 実ブラウザの実測（6巡目 Major 1 とまったく同じ形）:
 *   キーボードで回答 → 新しいジェスチャの1打目を指でタップ
 *   → 140 / 300 / 550ms は無言で拒否・700ms で受理（＝拒否は空振りでない）。
 */
describe("QuizContainer — ガードと窓を arm するのはポインタが起こした遷移だけ（B-620 7巡目 Minor 1）", () => {
  async function startQuiz(quiz: QuizDefinition) {
    render(<QuizContainer quiz={quiz} />);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
  }

  test.each([0, 140, 300, 550])(
    "キーボードで回答した %ims 後の指のタップ（新しいジェスチャの1打目）は受理される",
    async (gapMs) => {
      await startQuiz(makeNQuestionPersonalityQuiz(3));
      clock.advancePastTransitionGuard();
      // 設問1をキーボードで回答（＝この遷移はガードを arm しない）。
      await act(async () => {
        clickAsKeyboard(getChoiceButtons()[0]);
      });
      expect(
        screen.getByRole("heading", { level: 2, name: "問2" }),
      ).toBeInTheDocument();

      // 設問2を指でタップ。直前の遷移はキーボード由来なので「2打目」ではありえない。
      clock.advance(gapMs);
      await act(async () => {
        clickAsPointer(getChoiceButtons()[0]);
      });

      expect(
        screen.getByRole("heading", { level: 2, name: "問3" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "3",
      );
    },
  );

  test("対照: 同じ 140ms でも、ポインタが起こした遷移の直後なら弾かれる", async () => {
    // 上の検査が「ガードを外しただけ」ではないことを示す対。arm した入力の種別
    // だけを変え、他の条件（間隔・受け取る入力）は揃える。
    await startQuiz(makeNQuestionPersonalityQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    clock.advance(140);
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });

    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  test("キーボードで押した「はじめる」もガードを arm しない", async () => {
    // intro→playing も画面の入れ替わり。キーボードで始めた直後の指のタップは、
    // その設問への最初の入力であって「2打目」ではない。
    render(<QuizContainer quiz={makeNQuestionPersonalityQuiz(3)} />);
    await act(async () => {
      clickAsKeyboard(screen.getByRole("button", { name: "はじめる" }));
    });
    await act(async () => {
      clickAsPointer(getChoiceButtons()[0]);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();
  });

  test("キーボードで押した「次へ」もガードを arm しない", async () => {
    await startQuiz(makeNQuestionKnowledgeQuiz(3));
    clock.advancePastTransitionGuard();
    await act(async () => {
      clickAsKeyboard(screen.getByRole("button", { name: "選択1正" }));
    });
    await act(async () => {
      clickAsKeyboard(screen.getByRole("button", { name: "次へ" }));
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    ).toBeInTheDocument();

    // 「次へ」で設問が変わった直後の指のタップ。arm されていないので通る。
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "選択2正" }));
    });
    expect(screen.getByText("解説2")).toBeInTheDocument();
  });

  test("キーボードだけで完走した結果領域には窓を掛けない", async () => {
    // 実測で `data-settling="true"` / `pointer-events: none` が 600ms 掛かって
    // いた。キーボード完走の後にポインタの2打目は存在しないので、守るものはゼロ。
    render(<QuizContainer quiz={makeNQuestionPersonalityQuiz(3)} />);
    await act(async () => {
      clickAsKeyboard(screen.getByRole("button", { name: "はじめる" }));
    });
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        clickAsKeyboard(getChoiceButtons()[0]);
      });
    }
    expect(screen.getByTestId("result-card")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "診断結果" }),
    ).not.toHaveAttribute("data-settling");
  });

  test("キーボードの retry でも intro へ戻り、フォーカスは intro 領域へ移る", async () => {
    // 窓（ポインタ入力の不活性化）は arm しないが、**リビールは入力の種類に
    // 関係なく要る**。リビールが守っているのは「画面が入れ替わったことが分かる
    // か」「フォーカスの現在位置が残るか」で、これはキーボード利用者にも等しく
    // 当てはまる（むしろ SR 利用者にとって決定的である）。
    render(<QuizContainer quiz={makeNQuestionPersonalityQuiz(3)} />);
    await act(async () => {
      clickAsKeyboard(screen.getByRole("button", { name: "はじめる" }));
    });
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        clickAsKeyboard(getChoiceButtons()[0]);
      });
    }
    const bodyClassBefore = document.body.className;
    await act(async () => {
      clickAsKeyboard(screen.getByRole("button", { name: "もう一度挑戦する" }));
    });
    expect(
      screen.getByRole("button", { name: "はじめる" }),
    ).toBeInTheDocument();
    expectBodyIsNotInert(bodyClassBefore);
    expect(document.activeElement).toBe(
      screen.getByRole("region", { name: "診断のはじめ" }),
    );
  });

  test("非ポインタの遷移は、開いていた窓を閉じる（別の画面を不活性のまま残さない）", async () => {
    // ポインタで完走 → 結果領域に窓が立つ。その窓が守っていたのは「結果画面」で
    // あって、キーボードで intro へ戻った後の画面ではない。
    render(<QuizContainer quiz={makeNQuestionPersonalityQuiz(3)} />);
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
    for (let i = 0; i < 3; i++) {
      clock.advancePastTransitionGuard();
      await act(async () => {
        clickAsPointer(getChoiceButtons()[0]);
      });
    }
    expect(screen.getByRole("region", { name: "診断結果" })).toHaveAttribute(
      "data-settling",
      "true",
    );

    // 窓が開いている最中にキーボードで retry。
    const bodyClassBefore = document.body.className;
    await act(async () => {
      clickAsKeyboard(screen.getByRole("button", { name: "もう一度挑戦する" }));
    });
    expectBodyIsNotInert(bodyClassBefore);

    // 続けて指で「はじめる」を押せる（窓が残っていたら弾かれる）。
    await act(async () => {
      clickAsPointer(screen.getByRole("button", { name: "はじめる" }));
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "問1" }),
    ).toBeInTheDocument();
  });
});
