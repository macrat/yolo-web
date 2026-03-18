"use client";

/**
 * FortunePreview — トップページのヒーロー直下に表示する運勢プレビューセクション。
 *
 * localStorage ベースのユーザーシードを使用するため Client Component として実装。
 * SSR 時 (window 未定義) はローディングテキストを表示し、
 * クライアントマウント後に運勢タイトルと星評価のティーザーを表示する。
 */

import { useState } from "react";
import Link from "next/link";
import { getUserSeed, selectFortune } from "@/play/fortune/logic";
import { getTodayJst } from "@/lib/achievements/date";
import type { DailyFortuneEntry } from "@/play/fortune/types";
import StarRating from "@/play/fortune/_components/StarRating";
import styles from "./FortunePreview.module.css";

/**
 * クライアント側でのみ運勢を計算する。
 * window が未定義の SSR 環境では null を返す。
 */
function computeFortune(): {
  fortune: DailyFortuneEntry;
  today: string;
} | null {
  if (typeof window === "undefined") return null;
  const userSeed = getUserSeed();
  if (userSeed === null) return null;
  const today = getTodayJst();
  return { fortune: selectFortune(today, userSeed), today };
}

/** トップページ向け「今日のユーモア運勢」プレビューコンポーネント */
export default function FortunePreview() {
  // Lazy initializer: SSR 時は null (window 未定義)、クライアント初回レンダリング時に計算。
  // DailyFortuneCard と同じパターン。ハイドレーション不一致はローディング表示で吸収する。
  const [state] = useState(computeFortune);

  return (
    <section className={styles.section} aria-labelledby="home-fortune-heading">
      {/* セクションヘッダー */}
      <div className={styles.header}>
        <h2 id="home-fortune-heading" className={styles.title}>
          今日のユーモア運勢
        </h2>
        {/* 毎日更新バッジ */}
        <span className={styles.dailyBadge}>毎日更新</span>
      </div>

      {/* 運勢プレビューカード */}
      <Link href="/play/daily" className={styles.card}>
        {/* 装飾絵文字 */}
        <span className={styles.cardDeco} aria-hidden="true">
          🔮
        </span>

        {/* SSR フォールバック: マウント前はローディングテキストを表示 */}
        {state === null ? (
          <p className={styles.loading}>今日の運勢を読み込み中...</p>
        ) : (
          <>
            <p className={styles.fortuneTitle}>{state.fortune.title}</p>
            <StarRating rating={state.fortune.rating} variant="purple" />
          </>
        )}

        {/* CTA */}
        <span className={styles.cta}>今日の運勢を見る</span>
      </Link>
    </section>
  );
}
