"use client";

import { useState, useEffect, useRef } from "react";
import { useAchievements } from "@/lib/achievements/useAchievements";
import { getTodayJst } from "@/lib/achievements/date";
import { getUserSeed, selectFortune } from "@/play/fortune/logic";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import type { DailyFortuneEntry } from "@/play/fortune/types";
import styles from "./DailyFortuneCard.module.css";

/** Render star rating with filled and empty stars */
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className={styles.stars} aria-label={`${rating} / 5`}>
      {"★".repeat(fullStars)}
      {hasHalf && "☆"}
      {"☆".repeat(Math.max(0, emptyStars))}
      <span className={styles.ratingNumber}>({rating})</span>
    </span>
  );
}

/** Format "YYYY-MM-DD" to a readable Japanese date */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日の運勢`;
}

/** Compute initial fortune state from localStorage + date (client only) */
function computeInitialFortune(): {
  fortune: DailyFortuneEntry;
  today: string;
} | null {
  if (typeof window === "undefined") return null;
  const userSeed = getUserSeed();
  if (userSeed === null) return null;
  const dateStr = getTodayJst();
  return { fortune: selectFortune(dateStr, userSeed), today: dateStr };
}

/**
 * Client-side daily fortune card.
 *
 * Uses localStorage-based user seed + JST date to deterministically
 * select a fortune entry. Records play for the achievement system.
 */
export default function DailyFortuneCard() {
  const { recordPlay } = useAchievements();
  // Lazy initial state: computed once on first client render
  const [state] = useState(computeInitialFortune);
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (state && !hasRecorded.current) {
      hasRecorded.current = true;
      recordPlay("fortune-daily");
    }
  }, [state, recordPlay]);

  if (!state) {
    return (
      <div className={styles.card}>
        <p className={styles.loading}>運勢を占っています...</p>
      </div>
    );
  }

  const { fortune, today } = state;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/fortune/daily`
      : "/fortune/daily";
  const shareText = `今日のユーモア運勢は「${fortune.title}」(${fortune.rating}/5) でした! #yolosnet`;

  return (
    <div className={styles.card}>
      <p className={styles.date}>{formatDate(today)}</p>
      <h2 className={styles.title}>{fortune.title}</h2>
      <div className={styles.ratingRow}>
        <StarRating rating={fortune.rating} />
      </div>
      <p className={styles.description}>{fortune.description}</p>

      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>ラッキーアイテム</span>
          <span className={styles.detailValue}>{fortune.luckyItem}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>今日のアクション</span>
          <span className={styles.detailValue}>{fortune.luckyAction}</span>
        </div>
      </div>

      <ShareButtons
        shareText={shareText}
        shareUrl={shareUrl}
        quizTitle="今日のユーモア運勢"
        contentType="fortune"
        contentId="fortune-daily"
      />

      <p className={styles.comeback}>明日も来てね! 毎日運勢が変わります</p>
    </div>
  );
}
