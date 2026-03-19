/**
 * StarRating — 共通の星評価コンポーネント。
 *
 * FortunePreview (紫) と DailyFortuneCard (金色) の両方で使用する。
 * variant prop で色を切り替える。
 *
 * 星の表示ロジック:
 * - fullStars: Math.floor(rating) 個の filled star (★)
 * - hasHalf: 小数部が HALF_STAR_THRESHOLD (0.3) 以上なら half star (☆) を1つ表示
 * - emptyStars: 残りを empty star (☆) で埋める
 */

import styles from "./StarRating.module.css";

/** 半星と判定する小数部の最小閾値 */
const HALF_STAR_THRESHOLD = 0.3;

/** 星評価コンポーネントの色バリアント */
export type StarRatingVariant = "purple" | "gold";

export interface StarRatingProps {
  /** 1〜5 の評価値（小数可） */
  rating: number;
  /**
   * 色バリアント。
   * - "purple": FortunePreview 用 (#7c3aed)
   * - "gold": DailyFortuneCard 用 (#f59e0b, デフォルト)
   */
  variant?: StarRatingVariant;
}

/** 共通の星評価コンポーネント */
export default function StarRating({
  rating,
  variant = "gold",
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  // 浮動小数点誤差を回避するため小数第1位で丸めてから閾値と比較する
  // 例: 2.3 - 2 = 0.29999999999999982 (誤差) → Math.round(...*10)/10 = 0.3 (正しい値)
  const hasHalf =
    Math.round((rating - fullStars) * 10) / 10 >= HALF_STAR_THRESHOLD;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span
      className={styles.stars}
      data-variant={variant}
      aria-label={`${rating} / 5`}
    >
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
