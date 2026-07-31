/**
 * QuizContainer — 結果リビール（a11y 回帰ガード）。
 *
 * 完走（result phase 到達）で result region に role="region" / tabIndex=-1 /
 * 種別別の aria-label（personality→「診断結果」・knowledge→「クイズ結果」）が付き、
 * scrollIntoView と focus（preventScroll: true）が呼ばれることを検証する。
 *
 * A/B 実験 quiz_result_visual_v1 とは独立した恒久テスト。同実験の撤去
 * （cycle-279 C1）に伴い、旧 QuizContainer.test.tsx から本ファイルへ退避した。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuizContainer from "../QuizContainer";
import type {
  QuizDefinition,
  QuizMeta,
  QuizQuestion,
  QuizResult,
} from "../../types";

// gtag をモックして window.gtag に差し替える。analytics.ts は window.gtag を
// 直接呼ぶので、ここで spy を仕込むことで送出 payload を検査できる。
const gtagSpy = vi.fn();
beforeEach(() => {
  gtagSpy.mockClear();
  (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
});

// Panel / Button は軽量モックでテスト集中対象を絞る
vi.mock("@/components/Panel", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@/components/Button", () => ({
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// ResultCard は重量級なので軽量化（本テストは result region の a11y を観察するのが目的）。
vi.mock("../ResultCard", () => ({
  default: () => <div data-testid="result-card" />,
}));
vi.mock("../ResultExtraLoader", () => ({
  default: () => null,
}));
vi.mock("../ResultNextContent", () => ({
  default: () => null,
}));

// next/link を最低限の <a> に
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

/** 最小 personality quiz（type === "personality"）を組み立てる */
function makePersonalityQuiz(): QuizDefinition {
  const meta: QuizMeta = {
    slug: "character-personality",
    title: "似たキャラ診断",
    type: "personality",
    description: "テスト",
    questionCount: 1,
  } as QuizMeta;
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      text: "問1",
      choices: [
        { id: "c1", text: "選択1", points: { "type-a": 1 } },
        { id: "c2", text: "選択2", points: { "type-b": 1 } },
      ],
    },
  ];
  const results: QuizResult[] = [
    { id: "type-a", title: "タイプA", description: "A" },
    { id: "type-b", title: "タイプB", description: "B" },
  ];
  return { meta, questions, results };
}

/** 最小 knowledge quiz（type === "knowledge"）を組み立てる */
function makeKnowledgeQuiz(): QuizDefinition {
  const meta: QuizMeta = {
    slug: "yoji-level",
    title: "四字熟語レベル",
    type: "knowledge",
    description: "テスト",
    questionCount: 1,
  } as QuizMeta;
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      text: "問1",
      choices: [
        { id: "c1", text: "正解", isCorrect: true },
        { id: "c2", text: "不正解", isCorrect: false },
      ],
    },
  ];
  const results: QuizResult[] = [
    { id: "lv-1", title: "Level 1", description: "L1" },
  ];
  return { meta, questions, results };
}

/** quiz をプレイして結果まで遷移する（level_end 発火まで待つ） */
async function playToLevelEnd(quiz: QuizDefinition) {
  render(<QuizContainer quiz={quiz} />);
  // "はじめる" を押して playing へ
  const startBtn = screen.getByRole("button", { name: "はじめる" });
  await act(async () => {
    startBtn.click();
  });
  // playing phase: 設問1の選択肢ボタンを押す。
  // QuestionCard は選択肢を shuffle するので、テキスト名ではなく問題テキストを
  // 除いた残りの button 群（=選択肢）から最初の1つを押す。
  // 「はじめる」「次へ」等のチェーンとは別の choice button をたどる。
  const choiceButtons = screen
    .getAllByRole("button")
    .filter((b) => /^選択|^正解|^不正解$/.test(b.textContent ?? ""));
  expect(choiceButtons.length).toBeGreaterThan(0);
  await act(async () => {
    choiceButtons[0].click();
  });
  // knowledge は手動 next 必要
  if (quiz.meta.type === "knowledge") {
    const nextBtn = screen.queryByRole("button", { name: /次へ|結果/ });
    if (nextBtn) {
      await act(async () => {
        nextBtn.click();
      });
    }
  }
  const levelEndCalls = gtagSpy.mock.calls.filter((c) => c[1] === "level_end");
  expect(levelEndCalls.length).toBeGreaterThan(0);
}

describe("QuizContainer — 結果リビール（a11y 回帰ガード）", () => {
  let scrollIntoViewSpy: ReturnType<typeof vi.fn>;
  let focusSpy: ReturnType<typeof vi.spyOn>;
  // jsdom に元から scrollIntoView が無い場合の復元用（元記述子を退避）。
  let originalScrollIntoView: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalScrollIntoView = Object.getOwnPropertyDescriptor(
      window.HTMLElement.prototype,
      "scrollIntoView",
    );
    // jsdom は scrollIntoView 未実装なので関数を差し込んで spy 化する。
    // vi.fn() の汎用モック型は DOM メソッドのシグネチャに直接代入できないため、
    // テストのスタブとして該当メソッド型へ局所的にアサートする（any/ts-expect-error は使わない）。
    scrollIntoViewSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView =
      scrollIntoViewSpy as unknown as HTMLElement["scrollIntoView"];
    focusSpy = vi.spyOn(window.HTMLElement.prototype, "focus");
  });

  afterEach(() => {
    focusSpy.mockRestore();
    if (originalScrollIntoView) {
      Object.defineProperty(
        window.HTMLElement.prototype,
        "scrollIntoView",
        originalScrollIntoView,
      );
    } else {
      // 元々存在しなかったので削除して環境を元に戻す（delete 演算子の型制約回避）。
      Reflect.deleteProperty(window.HTMLElement.prototype, "scrollIntoView");
    }
  });

  test("personality 完走: result region に role/tabIndex/aria-label=診断結果 が付き、scrollIntoView と focus(preventScroll) が呼ばれる", async () => {
    // playToLevelEnd は render→完走までを行う。
    await playToLevelEnd(makePersonalityQuiz());
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("tabindex", "-1");
    expect(region).toHaveAttribute("aria-label", "診断結果");
    expect(scrollIntoViewSpy).toHaveBeenCalled();
    // N1: focus は既定スクロール抑止（preventScroll: true）で呼ばれる。
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  test("knowledge 完走: result region の aria-label が「クイズ結果」になる（N2）", async () => {
    await playToLevelEnd(makeKnowledgeQuiz());
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-label", "クイズ結果");
  });
});
