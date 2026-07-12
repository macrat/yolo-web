"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeFortuneStore,
  getFortuneSnapshot,
  getFortuneServerSnapshot,
} from "@/play/fortune/fortuneStore";
import ShareButtons from "@/play/quiz/_components/ShareButtons";
import Tsutsumi from "@/components/Tsutsumi";
import {
  pickResultWairoColor,
  pickResultSymbol,
} from "@/play/quiz/_components/resultVisual";
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
 * select a fortune entry.
 *
 * ストアのキャッシュ・購読ロジックは fortuneStore モジュールに集約する。
 *
 * デザイン（DESIGN.md §4「包み」/§7「見せたくなる結果」）: 占いは診断・ゲームと同じく
 * 見せたくなる側。結果は罫で明確に包んだ独立ビジュアル（Tsutsumi）を主役にし、
 * 器（このカードの見出し部）は静かな到達ラベルだけを持つ（quiz ResultCard と同じ型）。
 * 和色は結果 id から決定的に写像（同じ運勢は常に同じ色・§2「成果物パレットは8色に限る」）。
 */
export default function DailyFortuneCard() {
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

      <div className={styles.medalWrap}>
        <p className={styles.medalLabel}>
          <span className={styles.medalLabelDone}>占い完了</span>
          今日の結果
        </p>
        <Tsutsumi
          typeName={fortune.title}
          symbol={pickResultSymbol(fortune.title)}
          color={pickResultWairoColor(fortune.id)}
          productName="今日のユーモア運勢"
          seal="占"
        />
      </div>

      <div className={styles.ratingRow}>
        <StarRating rating={fortune.rating} />
      </div>

      <p className={styles.description}>{fortune.description}</p>

      <dl className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <dt className={styles.detailLabel}>ラッキーアイテム</dt>
          <dd className={styles.detailValue}>{fortune.luckyItem}</dd>
        </div>
        <div className={styles.detailItem}>
          <dt className={styles.detailLabel}>今日のアクション</dt>
          <dd className={styles.detailValue}>{fortune.luckyAction}</dd>
        </div>
      </dl>

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
