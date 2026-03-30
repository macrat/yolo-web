/**
 * クイズintro画面のミニマル情報バッジに使用するユーティリティ関数。
 * 問題数から所要時間の目安を計算する。
 */

/**
 * 問題数から所要時間の目安テキストを返す。
 * - 5問以下: 約1分
 * - 6〜8問: 約1〜2分
 * - 9問以上: 約2分
 */
export function getEstimatedTime(questionCount: number): string {
  if (questionCount <= 5) {
    return "約1分";
  }
  if (questionCount <= 8) {
    return "約1〜2分";
  }
  return "約2分";
}
