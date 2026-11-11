import type { FeedbackLevel } from "./types";

/**
 * 判定の印と、その意味の語。盤のマス・くわしい遊び方・共有の文が同じ印を使い、読み上げは凡例
 * （registry.ts の legend）と同じ意味の語で言う。
 */
export const FEEDBACK_MARKS: Record<
  FeedbackLevel,
  { mark: string; meaning: string }
> = {
  correct: { mark: "◯", meaning: "一致" },
  close: { mark: "△", meaning: "近い" },
  wrong: { mark: "×", meaning: "不一致" },
};
