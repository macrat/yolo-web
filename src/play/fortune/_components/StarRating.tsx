/**
 * StarRating — 星評価コンポーネント（DailyFortuneCard の金色表示用）。
 *
 * 旧トップページの FortunePreview 用だった "purple" variant は、
 * FortunePreview の削除（cycle-232 トップ道具箱化）で未使用のデッドパスに
 * なったため variant 機構ごと削除した（T-6 r1 N-1。利用者が
 * DailyFortuneCard だけになり、色は金色1種で足りる）。
 *
 * 星の表示ロジック:
 * - fullStars: Math.floor(rating) 個の filled star (★)
 * - hasHalf: 小数部が HALF_STAR_THRESHOLD (0.3) 以上なら half star (☆) を1つ表示
 * - emptyStars: 残りを empty star (☆) で埋める
 */

import styles from "./StarRating.module.css";

/** 半星と判定する小数部の最小閾値 */
const HALF_STAR_THRESHOLD = 0.3;

export interface StarRatingProps {
  /** 1〜5 の評価値（小数可） */
  rating: number;
}

/** 星評価コンポーネント（金色） */
export default function StarRating({ rating }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  // 浮動小数点誤差を回避するため小数第1位で丸めてから閾値と比較する
  // 例: 2.3 - 2 = 0.29999999999999982 (誤差) → Math.round(...*10)/10 = 0.3 (正しい値)
  const hasHalf =
    Math.round((rating - fullStars) * 10) / 10 >= HALF_STAR_THRESHOLD;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className={styles.stars} aria-label={`${rating} / 5`}>
      {"★".repeat(fullStars)}
      {/* half star と empty stars はグレーで表示して filled star と区別する */}
      <span className={styles.emptyStar}>
        {hasHalf && "☆"}
        {"☆".repeat(Math.max(0, emptyStars))}
      </span>
      <span className={styles.ratingNumber}>({rating})</span>
    </span>
  );
}
