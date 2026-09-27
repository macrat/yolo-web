import type { CharFeedback } from "./types";

/**
 * 判定ごとの、盤の印と、その意味の語。盤のマス・マスの読み上げ・共有の文が同じものを使い、盤の上の凡例
 * （registry.ts の legend）と同じ字と語にそろえる（DESIGN.md §8「推測への判定」）。
 */
export const FEEDBACK_MARKS: Record<
  CharFeedback,
  { mark: string; meaning: string }
> = {
  correct: { mark: "◯", meaning: "正しい位置" },
  present: { mark: "△", meaning: "別の位置" },
  absent: { mark: "×", meaning: "含まれない" },
};
