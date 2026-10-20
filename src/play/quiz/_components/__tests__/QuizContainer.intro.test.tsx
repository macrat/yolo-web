/**
 * QuizContainer の開始の画面。事実の行 → 一文 →「はじめる」→ 説明 → 関連の入口の順に積み、
 * 説明は開始の画面だけに出る。
 *
 * ページを開いたとき（マウント）は、画面を送らずフォーカスも動かさない。ページの途中へのリンクや戻る操作で着いた
 * 位置と、読み上げの位置を壊さないためである。「もう一度挑戦する」でやり直したあとは、状態の値が開いた直後と同じでも、
 * 開始の画面をページの頭から見せ、フォーカスを「はじめる」に移す（DESIGN.md §8）。
 */

import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuizContainer, { ANSWER_SHOWN_MS } from "../QuizContainer";
import type { QuizDefinition, QuizMeta } from "../../types";

// analytics.ts は window.gtag を直接呼ぶのでスタブを差し込む。送りの関数（window.scrollBy）を観察する。
let scrollBySpy: ReturnType<typeof vi.fn>;
beforeEach(() => {
  (window as unknown as { gtag: () => void }).gtag = vi.fn();
  scrollBySpy = vi.fn();
  vi.stubGlobal("scrollBy", scrollBySpy);
  vi.stubGlobal("visualViewport", undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// 結果の画面は、結果のボックスと「もう一度挑戦する」だけを描く。
vi.mock("../ResultCard", () => ({
  default: ({
    resultBoxRef,
    onRetry,
  }: {
    resultBoxRef: React.Ref<HTMLElement>;
    onRetry: () => void;
  }) => (
    <section ref={resultBoxRef} tabIndex={-1}>
      <button type="button" onClick={onRetry}>
        もう一度挑戦する
      </button>
    </section>
  ),
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
    <QuizContainer
      head={<h1>見出し</h1>}
      quiz={quiz}
      resultHeadings={{}}
      readingHeadings={{}}
    />,
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

test("開始の画面と設問の画面は、ページの頭と本体を1つのセクションに置く（DESIGN.md §5）", async () => {
  const { container } = renderQuiz();
  const sectionsOf = () =>
    Array.from(container.querySelectorAll(":scope > section"));
  expect(sectionsOf()).toHaveLength(1);
  const [intro] = sectionsOf();
  expect(intro).toContainElement(screen.getByRole("heading", { level: 1 }));
  expect(intro).toContainElement(
    screen.getByRole("button", { name: "はじめる" }),
  );

  await act(async () => {
    screen.getByRole("button", { name: "はじめる" }).click();
  });
  expect(sectionsOf()).toHaveLength(1);
  const [playing] = sectionsOf();
  expect(playing).toContainElement(screen.getByRole("heading", { level: 1 }));
  expect(playing).toContainElement(screen.getByText("選択1A"));
});

/** ページの送りの位置を決める。jsdom は送りを持たないので、読む値だけを差し替える。 */
function stubScrollY(scrollY: number): void {
  vi.stubGlobal("scrollY", scrollY);
}

test("途中まで送った位置で開いたときは、画面を送らずフォーカスも動かさない", () => {
  stubScrollY(300);
  renderQuiz();
  expect(scrollBySpy).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(document.body);
});

test("ページの途中へのリンク（#faq）で着いたときは、画面を送らずフォーカスも動かさない", () => {
  window.location.hash = "#faq";
  try {
    stubScrollY(800);
    renderQuiz();
    expect(scrollBySpy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  } finally {
    window.location.hash = "";
  }
});

test("「もう一度挑戦する」のあとは、開始の画面をページの頭から見せ、フォーカスを「はじめる」に移す", async () => {
  vi.useFakeTimers();
  renderQuiz();
  await act(async () => {
    screen.getByRole("button", { name: "はじめる" }).click();
  });
  await act(async () => {
    screen.getByRole("button", { name: "選択1A" }).click();
  });
  await act(async () => {
    vi.advanceTimersByTime(ANSWER_SHOWN_MS);
  });
  scrollBySpy.mockClear();

  // 結果の画面を送った位置で押す。やり直したあとの状態は、開いた直後と同じ値になる。開始の画面の事実の行と
  // 「はじめる」は、ページの頭から 300・500 の所にある（画面の上端から測ると、送った 1200 だけ上）。
  stubScrollY(1200);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const at = (top: number, bottom: number) =>
        ({
          top,
          bottom,
          left: 0,
          right: 0,
          width: 0,
          height: bottom - top,
        }) as DOMRect;
      if (this.tagName === "P" && this.textContent?.includes("全1問")) {
        return at(300 - 1200, 320 - 1200);
      }
      if (this.tagName === "BUTTON" && this.textContent === "はじめる") {
        return at(456 - 1200, 500 - 1200);
      }
      return at(0, 0);
    },
  );
  await act(async () => {
    screen.getByRole("button", { name: "もう一度挑戦する" }).click();
  });
  expect(scrollBySpy).toHaveBeenCalledTimes(1);
  expect(scrollBySpy).toHaveBeenCalledWith({
    top: -1200,
    behavior: "instant",
  });
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "はじめる" }),
  );
});
