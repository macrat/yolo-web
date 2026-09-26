import styles from "./StarRating.module.css";

const MAX_STARS = 5;

export interface StarRatingProps {
  /** 1〜5 の評価値（小数可） */
  rating: number;
}

/**
 * 運勢の星。評価の整数の部分を ★、残りを ☆ で、5つの星に並べ、評価の値を数字で添える。
 * 星は形で読み分け、色を持たない（DESIGN.md §2）。半分の星は ☆ と見分けられないので、端数は数字が言う。
 * 読み上げは星の字を1つずつ読まず、評価を1つの文で言う。
 */
export default function StarRating({ rating }: StarRatingProps) {
  const fullStars = Math.min(MAX_STARS, Math.max(0, Math.floor(rating)));

  return (
    <span
      className={styles.rating}
      role="img"
      aria-label={`5つ星のうち${rating}`}
    >
      <span className={styles.stars}>
        {"★".repeat(fullStars)}
        {"☆".repeat(MAX_STARS - fullStars)}
      </span>
      <span>({rating})</span>
    </span>
  );
}
