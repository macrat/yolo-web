/**
 * OtherTypesNavAb — A/B arm-aware thin wrapper around OtherTypesNav.
 *
 * EXPERIMENT: quiz_result_visual_v1
 *
 * Selects the **retro** variant when `arm === "A"`, otherwise the **current**
 * (new minimal) variant. The retro variant restores the d804b5d1 visual
 * language (per-type icon and `--type-color` hue on the current-type span)
 * that cycle-254 removed.
 *
 * Pure presentational: the arm is **received as a prop**, never resolved
 * here. The single resolution site for the experiment arm is `QuizContainer`
 * (calls `useAbVariant` once and threads the value through
 * `ResultCard` → `OtherTypesNavAb`). This keeps:
 * - The truth source for arm at one place (関心の分離 / coding rule #3).
 * - The hook count down at upstream (no extra `useAbVariant` per render here).
 * - Tests mockable from a single point (no need to mock `useAbVariant` inside
 *   this wrapper).
 *
 * Hydration safety: when `arm` is `null` (SSR + first client render), we
 * render the current variant so the server HTML and the first client paint
 * match (cf. docs/visitor-value-measurement.md 論点1).
 *
 * Removing the experiment: delete this wrapper and the `_experiments/` folder,
 * then switch ResultCard back to importing `../OtherTypesNav` directly.
 */

import type React from "react";
import type { QuizResult } from "@/play/quiz/types";
import type { AbArm } from "@/lib/ab";
import OtherTypesNavCurrent from "../../OtherTypesNav";
import OtherTypesNavRetro from "./OtherTypesNav";

type OtherTypesNavResult = Pick<QuizResult, "id" | "title" | "icon" | "color">;

interface OtherTypesNavAbProps {
  quizSlug: string;
  currentResultId: string;
  results: readonly OtherTypesNavResult[];
  /** 見出しの階層。ResultCard は h3、静的結果ページ（h2 セクション内）は h2。 */
  headingLevel?: 2 | 3;
  /**
   * A/B 実験 quiz_result_visual_v1 の arm。
   * - "A": retro 版（絵文字＋--type-color）
   * - "B" | null | undefined: current 版（ミニマル）
   *
   * `null` は SSR / 初期 client render（未確定）を表す。`undefined` は
   * 「呼び出し側が arm を伝播していない」を表し、両者とも current にフォール
   * バックする。これにより本ラッパを「current への薄いプロキシ」として
   * 非実験コードから使う後方互換も保たれる（現状は ResultCard のみが利用）。
   */
  arm?: AbArm | null;
}

export default function OtherTypesNavAb({
  arm,
  ...props
}: OtherTypesNavAbProps): React.ReactNode {
  if (arm === "A") {
    return <OtherTypesNavRetro {...props} />;
  }
  return <OtherTypesNavCurrent {...props} />;
}
