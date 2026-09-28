/**
 * QuizContainer — 結果に着いたとき。
 *
 * 最後の設問に答えると、結果のボックスまで画面を即時に送り（DESIGN.md §11）、ボックスにフォーカスを移す。
 * 結果は操作に応えて現れたものなので、ボックスに登場の動き（appear）を渡す。結果の見出しには、サーバーで
 * 作った区切りのうち、その結果のものを渡す。
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuizContainer from "../QuizContainer";
import type { ItemListItem } from "@/components/ItemList";
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

// ResultCard は、ページの頭・結果のボックスにあたる要素・追加の読みものだけを描く軽い形にし、受け取った値を属性で見せる。
vi.mock("../ResultCard", () => ({
  default: ({
    head,
    resultBoxRef,
    heading,
    appear,
    extra,
    nextItems,
  }: {
    head: React.ReactNode;
    resultBoxRef: React.Ref<HTMLElement>;
    heading: { phrases: string[] };
    appear?: boolean;
    extra?: React.ReactNode;
    nextItems?: unknown[];
  }) => (
    <>
      {head}
      <section
        ref={resultBoxRef}
        tabIndex={-1}
        data-testid="result-box"
        data-phrases={heading.phrases.join("|")}
        data-appear={String(Boolean(appear))}
        data-next-items={String(nextItems?.length ?? 0)}
      />
      {extra}
    </>
  ),
}));
// 追加の読みものは japanese-culture だけが持つことにし、置かれた所を見えるようにする。
vi.mock("../ResultExtraLoader", () => ({
  default: ({ slug }: { slug: string }) => (
    <div data-testid="result-extra" data-slug={slug} />
  ),
  hasResultExtra: (slug: string) => slug === "japanese-culture",
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
async function playToLevelEnd(
  quiz: QuizDefinition,
  recommendedContents?: ItemListItem[],
) {
  const resultHeadings = Object.fromEntries(
    quiz.results.map((result) => [result.id, { phrases: [...result.title] }]),
  );
  render(
    <QuizContainer
      head={<h1>見出し</h1>}
      quiz={quiz}
      resultHeadings={resultHeadings}
      readingHeadings={{}}
      recommendedContents={recommendedContents}
    />,
  );
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

describe("QuizContainer — 結果に着いたとき", () => {
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

  test("結果のボックスまで画面を即時に送り、ボックスにフォーカスを移す", async () => {
    await playToLevelEnd(makePersonalityQuiz());
    const box = screen.getByTestId("result-box");
    expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewSpy.mock.contexts[0]).toBe(box);
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({
      behavior: "instant",
      block: "start",
    });
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(box);
  });

  test("結果のボックスに登場の動きと、その結果の見出しの区切りを渡す", async () => {
    await playToLevelEnd(makePersonalityQuiz());
    const box = screen.getByTestId("result-box");
    expect(box).toHaveAttribute("data-appear", "true");
    expect(["タ|イ|プ|A", "タ|イ|プ|B"]).toContain(
      box.getAttribute("data-phrases"),
    );
  });

  test("知識クイズでも、結果のボックスへ送ってフォーカスを移す", async () => {
    await playToLevelEnd(makeKnowledgeQuiz());
    const box = screen.getByTestId("result-box");
    expect(box).toHaveAttribute("data-phrases", "L|e|v|e|l| |1");
    expect(document.activeElement).toBe(box);
  });

  test("解き終えた画面にも、ページの頭と次の遊びの行を渡す", async () => {
    await playToLevelEnd(makePersonalityQuiz(), [
      { name: "次の遊び", href: "/play/next" },
    ]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "見出し",
    );
    expect(screen.getByTestId("result-box")).toHaveAttribute(
      "data-next-items",
      "1",
    );
  });

  test("追加の読みものは、それを持つ診断だけに渡す", async () => {
    await playToLevelEnd(makePersonalityQuiz());
    expect(screen.queryByTestId("result-extra")).not.toBeInTheDocument();
  });

  test("追加の読みものを持つ診断では、その診断の追加の読みものを渡す", async () => {
    const quiz = makePersonalityQuiz();
    await playToLevelEnd({
      ...quiz,
      meta: { ...quiz.meta, slug: "japanese-culture" },
    });
    expect(screen.getByTestId("result-extra")).toHaveAttribute(
      "data-slug",
      "japanese-culture",
    );
  });

  test("開始の画面では画面を送らない", () => {
    const quiz = makePersonalityQuiz();
    render(
      <QuizContainer
        head={<h1>見出し</h1>}
        quiz={quiz}
        resultHeadings={{ "type-a": { phrases: ["タイプA"] } }}
        readingHeadings={{}}
      />,
    );
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
  });
});
