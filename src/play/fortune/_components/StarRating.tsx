import {
  MAX_RATING,
  countFullStars,
  formatRating,
} from "@/play/fortune/rating";
import styles from "./StarRating.module.css";

export interface StarRatingProps {
  /** 1〜5 の評価値（小数可） */
  rating: number;
}

/**
 * 運勢の星。評価にいちばん近い数だけ ★ を、残りを ☆ で、5つの星に並べ、評価の値を数字で添える。
 * 星は形で読み分け、色を持たない（DESIGN.md §2）。半分の星は ☆ と見分けられないので、端数は数字が言う。
 * 読み上げは星の字を1つずつ読まず、評価を1つの文で言う。
 */
export default function StarRating({ rating }: StarRatingProps) {
  const fullStars = countFullStars(rating);
  const value = formatRating(rating);

  return (
    <span
      className={styles.rating}
      role="img"
      aria-label={`${MAX_RATING}つ星のうち${value}`}
    >
      <span className={styles.stars}>
        {"★".repeat(fullStars)}
        {"☆".repeat(MAX_RATING - fullStars)}
      </span>
      <span>({value})</span>
    </span>
  );
}
