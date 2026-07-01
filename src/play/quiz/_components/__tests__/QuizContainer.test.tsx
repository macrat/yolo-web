/**
 * EXPERIMENT: quiz_result_visual_v1
 *
 * QuizContainer の A/B 実験ゲート挙動テスト。
 *
 * 焦点: 実験対象セッションの限定（独立変数の純度確保 / docs/sql/ab-value-metrics.sql
 *       の `WHERE ab_variant IS NOT NULL` フィルタが介入ゼロのセッションで薄まらない
 *       こと）。
 *
 * - personality 系（quiz.meta.type === "personality"）: arm が確定したら `level_end`
 *   の payload に `ab_variant` / `experiment_id` が乗る
 * - knowledge 系（quiz.meta.type === "knowledge"）: 視覚差分 0px のため payload に
 *   `ab_variant` / `experiment_id` キー自体が存在しない（arm の localStorage 永続化は
 *   発生してよい）
 *
 * 実験終了時は本ファイルごと削除する。
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
  // localStorage を毎テスト clear（arm の永続化が前テストに引きずられないよう）
  window.localStorage.clear();
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

// ResultCard は重量級なので軽量化（本テストは GA payload を観察するのが目的）。
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

/**
 * arm を localStorage に固定する。useAbVariant は useEffect 内で `getAbArm`
 * を呼び、`getAbArm` は localStorage を最優先で読むので、ここで書いた値が
 * そのまま useState 経由で第二 render に反映される。
 */
function forceArm(arm: "A" | "B") {
  window.localStorage.setItem(
    "yolos-ab",
    JSON.stringify({ quiz_result_visual_v1: arm }),
  );
}

/** quiz をプレイして結果まで遷移し、level_end の最後の payload を返す */
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
  // 最後の level_end 呼び出し payload を返す
  const levelEndCalls = gtagSpy.mock.calls.filter((c) => c[1] === "level_end");
  expect(levelEndCalls.length).toBeGreaterThan(0);
  return levelEndCalls[levelEndCalls.length - 1][2] as Record<string, unknown>;
}

describe("QuizContainer — 実験対象セッションの限定（BL-1）", () => {
  test("personality クイズ: arm 確定後の level_end に ab_variant/experiment_id が乗る", async () => {
    forceArm("A");
    const payload = await playToLevelEnd(makePersonalityQuiz());
    expect("ab_variant" in payload).toBe(true);
    expect("experiment_id" in payload).toBe(true);
    expect(payload.ab_variant).toBe("A");
    expect(payload.experiment_id).toBe("quiz_result_visual_v1");
  });

  test("personality クイズ: arm=B でも同様に ab_variant が乗る", async () => {
    forceArm("B");
    const payload = await playToLevelEnd(makePersonalityQuiz());
    expect(payload.ab_variant).toBe("B");
  });

  test("knowledge クイズ: arm が localStorage に永続化されていても level_end に ab_variant/experiment_id は乗らない", async () => {
    // 「arm の localStorage 永続化は knowledge にも発生してよい」契約の検証も兼ねる：
    // 仮に何らかの経路で arm が永続化されていても、knowledge では GA payload に出ない。
    forceArm("A");
    const payload = await playToLevelEnd(makeKnowledgeQuiz());
    expect("ab_variant" in payload).toBe(false);
    expect("experiment_id" in payload).toBe(false);
  });

  test("knowledge クイズ: arm 未確定（localStorage 未設定）でも level_end に ab_variant/experiment_id は乗らない", async () => {
    // 何もしない（localStorage は beforeEach で clear 済み）
    const payload = await playToLevelEnd(makeKnowledgeQuiz());
    expect("ab_variant" in payload).toBe(false);
    expect("experiment_id" in payload).toBe(false);
  });

  // EXPERIMENT: quiz_result_visual_v1 — cycle-272 T1b 修正の回帰防止
  //
  // BQ 実測（tmp/cycle-272-ab-recording.md）で診断対象 level_end の 20.8% が
  // null-arm 漏れ（useAbVariant の useEffect→setState→re-render 完了前に
  // level_end が発火）と判明し、QuizContainer は event handler 内で
  // `getAbArm()` を命令的に呼んで arm を解決する経路に修正した。
  //
  // 本テストは「localStorage 未設定（＝useAbVariant が null を返す状態）でも
  // personality クイズの level_end には ab_variant/experiment_id が乗る」を
  // 直接検証する。将来 `resolveAb` が useState/useMemo（再render 前提）経由
  // に書き戻されれば、このテストが落ちて回帰を捕まえる。
  //
  // getAbArm は localStorage が空のとき新規ランダム割当（"A"/"B" 50/50）して
  // localStorage に書き戻すので、ab_variant は具体値ではなく集合で検証する。
  test("personality クイズ: arm 未確定（localStorage 未設定）でも level_end に ab_variant/experiment_id が乗る（cycle-272 null-arm 漏れ是正）", async () => {
    // localStorage は beforeEach で clear 済み。useAbVariant は最初 null を返す。
    const payload = await playToLevelEnd(makePersonalityQuiz());
    expect("ab_variant" in payload).toBe(true);
    expect("experiment_id" in payload).toBe(true);
    expect(["A", "B"]).toContain(payload.ab_variant);
    expect(payload.experiment_id).toBe("quiz_result_visual_v1");
  });
});

// NICE-1: 結果リビール（完走→結果で注意を誘導する a11y 挙動）の回帰ガード。
//
// ⚠️ この describe は A/B 実験 quiz_result_visual_v1 とは独立した恒久テスト。
//    ファイル冒頭の注記どおり実験終了で本ファイルを削除する際は、この describe を
//    別ファイル（例: QuizContainer.reveal.test.tsx）へ退避すること。
//
// jsdom で検証可能な範囲に絞る:
// - 完走（result phase 到達）で result region に role="region" / tabIndex=-1 /
//   種別別の aria-label（personality→「診断結果」・knowledge→「クイズ結果」）が付く
// - scrollIntoView が呼ばれ、focus が preventScroll: true 付きで呼ばれる（N1）
describe("QuizContainer — 結果リビール（NICE-1: a11y 回帰ガード）", () => {
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
    // playToLevelEnd は render→完走までを行う（GA payload は本テストでは使わない）。
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
