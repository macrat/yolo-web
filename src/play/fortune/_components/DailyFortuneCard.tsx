"use client";

import { useSyncExternalStore, useEffect, useRef } from "react";
import { useAchievements } from "@/lib/achievements/useAchievements";
import {
  subscribeFortuneStore,
  getFortuneSnapshot,
  getFortuneServerSnapshot,
} from "@/play/fortune/fortuneStore";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import StarRating from "./StarRating";
import styles from "./DailyFortuneCard.module.css";

/** Format "YYYY-MM-DD" to a readable Japanese date */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日の運勢`;
}

/**
 * Client-side daily fortune card.
 *
 * Uses localStorage-based user seed + JST date to deterministically
 * select a fortune entry. Records play for the achievement system.
 *
 * ストアのキャッシュ・購読ロジックは fortuneStore モジュールに集約し、
 * FortunePreview と実装を共有する。
 */
export default function DailyFortuneCard() {
  const { recordPlay } = useAchievements();

  // useSyncExternalStore を使い Hydration Error を防ぐ。
  // server snapshot (getFortuneServerSnapshot) により SSR 時は null が返り、
  // クライアント初回レンダリングでも最初は null からスタートするため
  // SSR とクライアントの出力が一致する。
  // マウント後は client snapshot (getFortuneSnapshot) が評価され運勢データが返る。
  // スナップショット関数はモジュールスコープのキャッシュを返すため参照同一性が保たれ、
  // 無限再レンダリングを防ぐ。
  const state = useSyncExternalStore(
    subscribeFortuneStore,
    getFortuneSnapshot, // client snapshot
    getFortuneServerSnapshot, // server snapshot (SSR時はnull)
  );

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
      ? `${window.location.origin}/play/daily`
      : "/play/daily";
  const shareText = `今日のユーモア運勢は「${fortune.title}」(${fortune.rating}/5) でした! #ユーモア運勢 #yolosnet`;

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
