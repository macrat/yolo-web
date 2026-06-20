/**
 * EXPERIMENT: quiz_result_visual_v1
 *
 * OtherTypesNavAb は `useAbVariant` を呼ばず、arm を props で受け取る純粋
 * コンポーネント（関心の分離・原則#3）。
 *
 * - arm="A": retro 版（タイプ絵文字を描画）
 * - arm="B" | null | undefined: current 版（絵文字なし・ミニマル）
 *
 * 当時 (d804b5d1) の retro `OtherTypesNav` は各タイプの `r.icon`（絵文字）を
 * `<span aria-hidden="true">` で描画する。current 版（cycle-254）はそれを撤去
 * している。本テストではこの「絵文字の有無」を分岐の signal として利用する。
 *
 * 実験終了時は本ファイルごと削除する。
 */

import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import OtherTypesNavAb from "../OtherTypesNavAb";
import type { QuizResult } from "@/play/quiz/types";

const results: QuizResult[] = [
  { id: "type-a", title: "タイプA", description: "A", icon: "🅰️" },
  { id: "type-b", title: "タイプB", description: "B", icon: "🅱️" },
];

describe("OtherTypesNavAb — arm で retro / current を出し分け", () => {
  test('arm="A": retro 版が選ばれ、タイプ絵文字が aria-hidden で描画される', () => {
    const { container } = render(
      <OtherTypesNavAb
        quizSlug="t"
        currentResultId="type-a"
        results={results}
        arm="A"
      />,
    );
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    // 当時 (d804b5d1) の retro 版はリンク内に r.icon を `<span aria-hidden>` として描画する。
    expect(hidden.length).toBeGreaterThan(0);
    // current 版は絵文字を描画しない → retro が選ばれていることの signal。
    expect(Array.from(hidden).some((el) => el.textContent === "🅱️")).toBe(true);
  });

  test('arm="B": current 版が選ばれ、タイプ絵文字が描画されない', () => {
    const { container } = render(
      <OtherTypesNavAb
        quizSlug="t"
        currentResultId="type-a"
        results={results}
        arm="B"
      />,
    );
    // current 版（cycle-254）は絵文字を撤去している。
    expect(container.textContent).not.toContain("🅱️");
    expect(container.textContent).not.toContain("🅰️");
  });

  test("arm=null: hydration safe フォールバックとして current が選ばれる", () => {
    const { container } = render(
      <OtherTypesNavAb
        quizSlug="t"
        currentResultId="type-a"
        results={results}
        arm={null}
      />,
    );
    expect(container.textContent).not.toContain("🅱️");
  });

  test("arm 未指定 (undefined): 後方互換として current が選ばれる", () => {
    const { container } = render(
      <OtherTypesNavAb
        quizSlug="t"
        currentResultId="type-a"
        results={results}
      />,
    );
    expect(container.textContent).not.toContain("🅱️");
  });

  test("results が 1 件以下: 両 arm とも何もレンダリングしない", () => {
    const { container: cA } = render(
      <OtherTypesNavAb
        quizSlug="t"
        currentResultId="type-a"
        results={[results[0]]}
        arm="A"
      />,
    );
    const { container: cB } = render(
      <OtherTypesNavAb
        quizSlug="t"
        currentResultId="type-a"
        results={[results[0]]}
        arm="B"
      />,
    );
    expect(cA.querySelector("nav")).toBeNull();
    expect(cB.querySelector("nav")).toBeNull();
  });
});
