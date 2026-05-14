/**
 * Tile.small-daily-pick — keigo-reference の small（1×1）日替わりバリアント。
 *
 * ## 機能（T-D-バリアント設計で確定）
 * - 日替わり 1 件のエントリを表示（getDailyEntry を使用）
 * - 入力なし（静的表示）
 * - 表示形式: エントリ 1 件のカード（敬語表現 + カテゴリラベル）
 * - タップで詳細ページに遷移する導線
 * - 「今日の敬語」ヘッダー
 *
 * ## 3 軸対照（T-D-バリアント設計 確定）
 * - (a) 入力: 入力なし（日付のみ） ← medium-search はテキスト入力あり
 * - (b) 出力: 1 件カード（尊敬語・謙譲語・カテゴリ）← medium-search は複数件リスト
 * - (c) インタラクション: タップで詳細ページ遷移のみ ← medium-search はリアルタイムフィルタ
 *
 * サーバーコンポーネントとして実装（入力なし・決定論的な表示のため "use client" 不要）。
 * T-D-実装（cycle-191）で新設。(legacy) ルート不触・INITIAL_DEFAULT_LAYOUT 不投入。
 */

import Link from "next/link";
import { getDailyEntry } from "./logic";
import styles from "./Tile.small-daily-pick.module.css";

/** カテゴリ ID → 表示名マッピング */
const CATEGORY_LABELS: Record<string, string> = {
  basic: "基本動詞",
  business: "ビジネス",
  service: "接客・サービス",
};

export default function KeigoReferenceSmallDailyPick() {
  const entry = getDailyEntry();

  return (
    <div className={styles.tile}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">
          📖
        </span>
        <span className={styles.headerLabel}>今日の敬語</span>
      </div>

      {/* エントリカード */}
      {entry ? (
        <div className={styles.entryCard}>
          <div className={styles.casualText}>{entry.casual}</div>
          <span className={styles.categoryBadge}>
            {CATEGORY_LABELS[entry.category] ?? entry.category}
          </span>
          <div className={styles.formsGrid}>
            <div className={styles.formRow}>
              <span className={styles.formLabel}>尊敬語</span>
              <span className={styles.formText}>{entry.sonkeigo}</span>
            </div>
            <div className={styles.formRow}>
              <span className={styles.formLabel}>謙譲語</span>
              <span className={styles.formText}>{entry.kenjogo}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>データがありません</div>
      )}

      {/* 詳細ページへの導線 */}
      <Link href="/tools/keigo-reference" className={styles.detailLink}>
        全一覧を確認する →
      </Link>
    </div>
  );
}
