/**
 * QuizContainer — 2打目で語を選ばない。
 *
 * 押した点の下が入れ替わる操作のあと、マウスのダブルクリックの2打目は、入れ替わった先の字（答えたあとの行・解説・
 * 次の問の見出し・結果・開始の画面）に落ちうる。連続の押しの1打目が画面を切り替えたときだけ、2打目からの
 * mousedown の既定の動き（語の選択）を止める。字の上で1打目から始めたダブルクリックは止めず、語を選べる。
 * 2打目の click は止めない。
 */

import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import QuizContainer from "../QuizContainer";
import type { QuizDefinition, QuizMeta } from "../../types";

beforeEach(() => {
  (window as unknown as { gtag: () => void }).gtag = vi.fn();
  vi.stubGlobal("scrollBy", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

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

const quiz: QuizDefinition = {
  meta: {
    slug: "kanji-level",
    title: "漢字力診断",
    type: "knowledge",
    description: "テスト",
    questionCount: 2,
  } as QuizMeta,
  questions: [
    {
      id: "q1",
      text: "問1",
      choices: [
        { id: "c1a", text: "選択1A", isCorrect: true },
        { id: "c1b", text: "選択1B" },
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
  ],
  results: [{ id: "lv-1", title: "Level 1", description: "L1" }],
};

async function renderAndStart(): Promise<void> {
  render(
    <QuizContainer
      head={<h1>見出し</h1>}
      quiz={quiz}
      resultHeadings={{}}
      readingHeadings={{}}
    />,
  );
  await act(async () => {
    screen.getByRole("button", { name: "はじめる" }).click();
  });
}

/** mousedown を送り、既定の動きが止められたかを返す。 */
function mouseDownPrevented(element: Element, detail: number): boolean {
  return !fireEvent.mouseDown(element, { detail });
}

test("答えを受け付けた連続の押しの2打目は、解説の字の上で語を選ばない", async () => {
  await renderAndStart();
  const choice = screen.getByRole("button", { name: "選択1B" });
  expect(mouseDownPrevented(choice, 1)).toBe(false);
  await act(async () => {
    fireEvent.click(choice, { detail: 1 });
  });
  expect(mouseDownPrevented(screen.getByText("解説1"), 2)).toBe(true);
});

test("3打目以降も、語を選ばない", async () => {
  await renderAndStart();
  const choice = screen.getByRole("button", { name: "選択1B" });
  mouseDownPrevented(choice, 1);
  await act(async () => {
    fireEvent.click(choice, { detail: 1 });
  });
  const explanation = screen.getByText("解説1");
  expect(mouseDownPrevented(explanation, 2)).toBe(true);
  expect(mouseDownPrevented(explanation, 3)).toBe(true);
});

test("「次へ」で次の問へ進んだ連続の押しの2打目は、次の問の見出しの字の上で語を選ばない", async () => {
  await renderAndStart();
  await act(async () => {
    screen.getByRole("button", { name: "選択1A" }).click();
  });
  const next = screen.getByRole("button", { name: "次へ" });
  mouseDownPrevented(next, 1);
  await act(async () => {
    fireEvent.click(next, { detail: 1 });
  });
  expect(
    mouseDownPrevented(screen.getByRole("heading", { name: "問2" }), 2),
  ).toBe(true);
});

test("問の見出しの字の上で始めたダブルクリックは、語を選べる", async () => {
  await renderAndStart();
  const heading = screen.getByRole("heading", { name: "問1" });
  expect(mouseDownPrevented(heading, 1)).toBe(false);
  expect(mouseDownPrevented(heading, 2)).toBe(false);
});

test("キーボードで押した答え（click の detail が 0）は、連続の押しの始まりにならない", async () => {
  await renderAndStart();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "選択1B" }), {
      detail: 0,
    });
  });
  expect(screen.getByText("解説1")).toBeInTheDocument();
  expect(mouseDownPrevented(screen.getByText("解説1"), 2)).toBe(false);
});
