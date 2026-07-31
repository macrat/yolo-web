/**
 * QuizContainer — 設問送りのフォーカス管理と a11y 命名（F2 / F3 回帰ガード）。
 *
 * F2（WCAG 2.4.3 / 4.1.3）:
 *  - 設問文が見出し（h2）であること。
 *  - playing phase で設問が切り替わると、新設問の h2 へフォーカスが移ること
 *    （前設問の回答ボタンから <body> へ focus が落ちないこと）。
 * F3（WCAG 4.1.2）:
 *  - ProgressBar の progressbar 要素に安定したアクセシブル名があること。
 *
 * 結果リビール（QuizContainer.reveal.test.tsx）とは独立した恒久テスト。
 * 本ファイルは document.activeElement を観察するため focus はスパイ化しない。
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuizContainer from "../QuizContainer";
import type {
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

// analytics.ts は window.gtag を直接呼ぶのでスタブを差し込む。
const gtagSpy = vi.fn();
beforeEach(() => {
  gtagSpy.mockClear();
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
});

// 結果系は重量級なので軽量モック（本テストは playing phase を観察するのが目的）。
vi.mock("../ResultCard", () => ({
  default: () => <div data-testid="result-card" />,
}));
vi.mock("../ResultExtraLoader", () => ({
  default: () => null,
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

/** 2 問の personality quiz（設問送りを観察できる最小構成）。 */
function makeTwoQuestionPersonalityQuiz(): QuizDefinition {
  const meta: QuizMeta = {
    slug: "character-personality",
    title: "似たキャラ診断",
    type: "personality",
    description: "テスト",
    questionCount: 2,
  } as QuizMeta;
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      text: "問1",
      choices: [
        { id: "c1a", text: "選択1A", points: { "type-a": 1 } },
        { id: "c1b", text: "選択1B", points: { "type-b": 1 } },
      ],
    },
    {
      id: "q2",
      text: "問2",
      choices: [
        { id: "c2a", text: "選択2A", points: { "type-a": 1 } },
        { id: "c2b", text: "選択2B", points: { "type-b": 1 } },
      ],
    },
  ];
  const results: QuizResult[] = [
    { id: "type-a", title: "タイプA", description: "A" },
    { id: "type-b", title: "タイプB", description: "B" },
  ];
  return { meta, questions, results };
}

/** intro→playing へ遷移する（"はじめる" を押す）。 */
async function startQuiz(quiz: QuizDefinition) {
  render(<QuizContainer quiz={quiz} />);
  const startBtn = screen.getByRole("button", { name: "はじめる" });
  await act(async () => {
    startBtn.click();
  });
}

/** 現在表示中の設問（h2）以外の choice ボタンから最初の1つを押す。 */
async function clickFirstChoice() {
  const choiceButtons = screen
    .getAllByRole("button")
    .filter((b) => /^選択/.test(b.textContent ?? ""));
  expect(choiceButtons.length).toBeGreaterThan(0);
  await act(async () => {
    choiceButtons[0].click();
  });
}

describe("QuizContainer — 設問送りのフォーカス管理 / a11y 命名（F2 / F3）", () => {
  test("F2(b): 設問文は見出し（h2）である", async () => {
    await startQuiz(makeTwoQuestionPersonalityQuiz());
    const heading = screen.getByRole("heading", { level: 2, name: "問1" });
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveAttribute("tabindex", "-1");
  });

  test("F2(a): 初回マウントで設問見出しへフォーカスが入る", async () => {
    await startQuiz(makeTwoQuestionPersonalityQuiz());
    const heading = screen.getByRole("heading", { level: 2, name: "問1" });
    expect(document.activeElement).toBe(heading);
  });

  test("F2(a): 設問が切り替わると新設問の h2 へフォーカスが移る", async () => {
    await startQuiz(makeTwoQuestionPersonalityQuiz());
    // 設問1の選択肢を押して設問2へ送る（personality は即時遷移）。
    await clickFirstChoice();
    // 新設問（問2）の見出しへフォーカスが移り、<body> に落ちていない。
    const nextHeading = screen.getByRole("heading", { level: 2, name: "問2" });
    expect(document.activeElement).toBe(nextHeading);
    expect(document.activeElement).not.toBe(document.body);
  });

  test("F3: ProgressBar にアクセシブル名がある", async () => {
    await startQuiz(makeTwoQuestionPersonalityQuiz());
    const progressbar = screen.getByRole("progressbar", { name: "設問の進捗" });
    expect(progressbar).toHaveAttribute("aria-valuenow", "1");
    expect(progressbar).toHaveAttribute("aria-valuetext", "2問中1問目");
  });
});
