/** 運勢の評価の上限。星はこの数だけ並ぶ。 */
export const MAX_RATING = 5;

/**
 * 評価を小数第1位までの形で言う（「4.0」「4.4」）。星に添える数字・読み上げ・共有の文がこれを使い、
 * どの運勢でも同じ物差しの値が同じ形で出る。
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** ★ の数。評価にいちばん近い整数で、星の見た目が一目で値に合う。 */
export function countFullStars(rating: number): number {
  return Math.min(MAX_RATING, Math.max(0, Math.round(rating)));
}
