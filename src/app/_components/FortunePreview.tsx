"use client";

/**
 * FortunePreview — トップページのヒーロー直下に表示する運勢プレビューセクション。
 *
 * localStorage ベースのユーザーシードを使用するため Client Component として実装。
 * useSyncExternalStore の server snapshot で SSR 時は null を返し、
 * クライアントマウント後に運勢タイトルと星評価のティーザーを表示する。
 * これにより SSR とクライアントの初回レンダリング出力が一致し、Hydration Error を防ぐ。
 *
 * ストアのキャッシュ・購読ロジックは fortuneStore モジュールに集約し、
 * DailyFortuneCard と実装を共有する。
 */

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  subscribeFortuneStore,
  getFortuneSnapshot,
  getFortuneServerSnapshot,
} from "@/play/fortune/fortuneStore";
import StarRating from "@/play/fortune/_components/StarRating";
import styles from "./FortunePreview.module.css";

/** トップページ向け「今日のユーモア運勢」プレビューコンポーネント */
export default function FortunePreview() {
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
