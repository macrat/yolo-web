/**
 * QuizContainer の開始の画面。事実の行 → 一文 →「はじめる」→ 説明 → 関連の入口の順に積み、
 * 説明は開始の画面だけに出る。
 */

import { test, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuizContainer from "../QuizContainer";
import type { QuizDefinition, QuizMeta } from "../../types";

// analytics.ts は window.gtag を直接呼ぶのでスタブを差し込む。
beforeEach(() => {
  (window as unknown as { gtag: () => void }).gtag = vi.fn();
});

vi.mock("../ResultCard", () => ({
  default: () => null,
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

const DESCRIPTION = "あなたの答えから、似たキャラを見つけます。";

const quiz: QuizDefinition = {
  meta: {
    slug: "character-personality",
    title: "似たキャラ診断",
    type: "personality",
    description: DESCRIPTION,
    questionCount: 1,
    relatedLinks: [{ label: "守護キャラ診断を受ける", href: "/play/x" }],
  } as QuizMeta,
  questions: [
    {
      id: "q1",
      text: "問1",
      choices: [
        { id: "c1a", text: "選択1A", points: { "type-a": 1 } },
        { id: "c1b", text: "選択1B", points: { "type-b": 1 } },
      ],
    },
  ],
  results: [
    { id: "type-a", title: "タイプA", description: "A" },
    { id: "type-b", title: "タイプB", description: "B" },
  ],
};

function renderQuiz() {
  return render(
    <QuizContainer quiz={quiz} resultHeadings={{}} readingHeadings={{}} />,
  );
}

test("開始の画面は、事実の行 → 一文 →「はじめる」→ 説明 → 関連の入口の順に並ぶ", () => {
  const { container } = renderQuiz();
  const order = [
    screen.getByText("全1問"),
    screen.getByText("気軽に答えていくと、結果が出ます。"),
    screen.getByRole("button", { name: "はじめる" }),
    screen.getByText(DESCRIPTION),
    screen.getByRole("link", { name: "守護キャラ診断を受ける" }),
  ];
  const all = Array.from(container.querySelectorAll("*"));
  const positions = order.map((element) => all.indexOf(element));
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
});

test("事実の行の所要時間は、読む字数から見積もった目安を言う", () => {
  renderQuiz();
  expect(screen.getByText("約1分")).toBeInTheDocument();
});

test("説明は開始の画面だけに出て、設問の画面には出ない", async () => {
  renderQuiz();
  expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
  await act(async () => {
    screen.getByRole("button", { name: "はじめる" }).click();
  });
  expect(screen.queryByText(DESCRIPTION)).not.toBeInTheDocument();
});
