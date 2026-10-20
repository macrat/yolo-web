/**
 * QuizContainer — 問のあいだのフォーカスと、答えたあとの行の形。
 *
 * 来訪者の操作で画面が切り替わったら、QuizContainer が塗る前にフォーカスを移す（DESIGN.md §6）。
 *  - マウントのときは何もせず、フォーカスは body のまま。
 *  - 次の問が出たとき（「はじめる」・診断の答えを見せた 150ms のあと・知識クイズの「次へ」のあと）は問の見出しへ。
 *  - 答えたとき（診断の見せている 150ms のあいだ・知識クイズの答えたあと）は押した行（li）へ。
 * 知識クイズの押した行は、解説を説明として持ち、押していない行は持たない。
 * jsdom は塗りを持たないので、塗る前であることは実ブラウザで確かめる。本ファイルは document.activeElement を
 * 観察するため focus はスパイ化しない。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuizContainer, { ANSWER_SHOWN_MS } from "../QuizContainer";
import type {
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

// analytics.ts は window.gtag を直接呼ぶのでスタブを差し込む。
beforeEach(() => {
  (window as unknown as { gtag: () => void }).gtag = vi.fn();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

// 結果系は重量級なので軽量モック（本テストは回答の段階を観察するのが目的）。
vi.mock("../ResultCard", () => ({
  default: () => <div data-testid="result-card" />,
}));
vi.mock("../ResultExtraLoader", () => ({
  default: () => null,
  hasResultExtra: () => false,
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

const RESULTS: QuizResult[] = [
  { id: "type-a", title: "タイプA", description: "A" },
  { id: "type-b", title: "タイプB", description: "B" },
];

/** 2 問の診断（問の送りを観察できる最小構成）。 */
function makePersonalityQuiz(): QuizDefinition {
  const meta = {
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
  return { meta, questions, results: RESULTS };
}

/** 2 問の知識クイズ。 */
function makeKnowledgeQuiz(): QuizDefinition {
  const meta = {
    slug: "kanji-level",
    title: "漢字力診断",
    type: "knowledge",
    description: "テスト",
    questionCount: 2,
  } as QuizMeta;
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      text: "問1",
      choices: [
        { id: "c1a", text: "選択1A", isCorrect: true },
        { id: "c1b", text: "選択1B" },
        { id: "c1c", text: "選択1C" },
      ],
      explanation: "解説1",
    },
    {
      id: "q2",
      text: "問2",
      choices: [
        { id: "c2a", text: "選択2A", isCorrect: true },
        { id: "c2b", text: "選択2B" },
      ],
      explanation: "解説2",
    },
  ];
  return { meta, questions, results: RESULTS };
}

function renderQuiz(quiz: QuizDefinition) {
  render(
    <QuizContainer
      head={<h1>見出し</h1>}
      quiz={quiz}
      resultHeadings={{}}
      readingHeadings={{}}
    />,
  );
}

async function click(element: HTMLElement) {
  await act(async () => {
    element.click();
  });
}

async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

/** 選択肢の名前を持つ行（li）。 */
function rowOf(name: string): HTMLElement {
  const row = screen.getByText(name).closest("li");
  if (!row) throw new Error(`${name} の行が無い`);
  return row;
}

describe("QuizContainer — 問のあいだのフォーカス", () => {
  test("問の見出しは h2 で、プログラムからだけフォーカスを受け、字の箱を持つ", async () => {
    renderQuiz(makePersonalityQuiz());
    await click(screen.getByRole("button", { name: "はじめる" }));
    const heading = screen.getByRole("heading", { level: 2, name: "問1" });
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading).toHaveAttribute("data-text-box", "inline");
  });

  test("マウントのときは、フォーカスを動かさない", () => {
    renderQuiz(makePersonalityQuiz());
    expect(document.activeElement).toBe(document.body);
  });

  test("「はじめる」のあと、フォーカスは最初の問の見出しにある", async () => {
    renderQuiz(makePersonalityQuiz());
    await click(screen.getByRole("button", { name: "はじめる" }));
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 2, name: "問1" }),
    );
  });

  test("診断で答えると、見せているあいだは押した行に、150ms のあとは次の問の見出しにある", async () => {
    renderQuiz(makePersonalityQuiz());
    await click(screen.getByRole("button", { name: "はじめる" }));
    await click(screen.getByRole("button", { name: "選択1A" }));
    const pressedRow = rowOf("選択1A");
    expect(pressedRow).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(pressedRow);

    await advance(ANSWER_SHOWN_MS - 1);
    expect(document.activeElement).toBe(pressedRow);

    await advance(1);
    const nextHeading = screen.getByRole("heading", { level: 2, name: "問2" });
    expect(document.activeElement).toBe(nextHeading);
  });

  test("知識クイズで答えると押した行に、「次へ」のあとは次の問の見出しにある", async () => {
    renderQuiz(makeKnowledgeQuiz());
    await click(screen.getByRole("button", { name: "はじめる" }));
    await click(screen.getByRole("button", { name: "選択1B" }));
    expect(document.activeElement).toBe(rowOf("選択1B"));

    // 知識クイズは時間では進まない。
    await advance(ANSWER_SHOWN_MS * 10);
    expect(document.activeElement).toBe(rowOf("選択1B"));

    await click(screen.getByRole("button", { name: "次へ" }));
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 2, name: "問2" }),
    );
  });

  test("進み具合の帯にアクセシブル名がある", async () => {
    renderQuiz(makePersonalityQuiz());
    await click(screen.getByRole("button", { name: "はじめる" }));
    const progressbar = screen.getByRole("progressbar", { name: "設問の進捗" });
    expect(progressbar).toHaveAttribute("aria-valuenow", "1");
    expect(progressbar).toHaveAttribute("aria-valuetext", "2問中1問目");
  });
});

describe("QuizContainer — 知識クイズの答えたあとの行", () => {
  test("押した行が誤りなら「あなたの回答は不正解」、押していない正解の行に「正解」を添え、ほかの行には添えない", async () => {
    renderQuiz(makeKnowledgeQuiz());
    await click(screen.getByRole("button", { name: "はじめる" }));
    await click(screen.getByRole("button", { name: "選択1B" }));
    expect(rowOf("選択1B")).toHaveTextContent("選択1Bあなたの回答は不正解");
    expect(rowOf("選択1A")).toHaveTextContent(/^選択1A正解$/);
    expect(rowOf("選択1C")).toHaveTextContent(/^選択1C$/);
  });

  test("押した行が正解なら「あなたの回答は正解」だけを添える", async () => {
    renderQuiz(makeKnowledgeQuiz());
    await click(screen.getByRole("button", { name: "はじめる" }));
    await click(screen.getByRole("button", { name: "選択1A" }));
    expect(rowOf("選択1A")).toHaveTextContent("選択1Aあなたの回答は正解");
    expect(rowOf("選択1B")).toHaveTextContent(/^選択1B$/);
  });

  test("押した行だけが解説を説明として持ち、どの行もボタンでない字になる", async () => {
    renderQuiz(makeKnowledgeQuiz());
    await click(screen.getByRole("button", { name: "はじめる" }));
    await click(screen.getByRole("button", { name: "選択1B" }));
    expect(rowOf("選択1B")).toHaveAccessibleDescription("解説1");
    expect(rowOf("選択1A")).not.toHaveAttribute("aria-describedby");
    expect(rowOf("選択1C")).not.toHaveAttribute("aria-describedby");
    expect(
      screen.queryByRole("button", { name: /^選択/ }),
    ).not.toBeInTheDocument();
  });
});
