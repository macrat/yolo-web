"use client";

/**
 * Tile.medium-search — keigo-reference の medium（2×1）検索バリアント。
 *
 * ## 機能（T-D-バリアント設計で確定）
 * - 検索テキスト入力欄
 * - リアルタイムフィルタリング（filterEntries を活用）
 * - 候補一覧表示（例文展開なし、概ね 5〜10 件）
 * - 該当なし時の空状態表示
 *
 * ## 3 軸対照（T-D-バリアント設計 確定）
 * - (a) 入力: テキスト入力あり（検索クエリ）← small-daily-pick は入力なし
 * - (b) 出力: 検索結果リスト（複数件）← small-daily-pick は 1 件カード
 * - (c) インタラクション: 入力のたびにリアルタイムフィルタ ← small-daily-pick は詳細ページ遷移のみ
 *
 * T-D-実装（cycle-191）で新設。(legacy) ルート不触・INITIAL_DEFAULT_LAYOUT 不投入。
 */

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import { filterEntries, getCategoryName } from "./logic";
import type { KeigoEntry } from "./logic";
import styles from "./Tile.medium-search.module.css";

/** 表示する最大件数（タイルサイズに合わせた適切な件数） */
const MAX_DISPLAY_COUNT = 8;

/** 候補アイテム 1 件の表示 */
function ResultItem({ entry }: { entry: KeigoEntry }) {
  return (
    <div className={styles.resultItem} role="listitem">
      <span className={styles.casualText}>{entry.casual}</span>
      <span className={styles.formsText}>
        {entry.sonkeigo} / {entry.kenjogo}
      </span>
      <span className={styles.categoryBadge}>
        {getCategoryName(entry.category)}
      </span>
    </div>
  );
}

export default function KeigoReferenceMediumSearch() {
  const [query, setQuery] = useState("");

  // クエリに基づいてフィルタリング（カテゴリは全件: "all"）
  const results = filterEntries(query, "all");
  const displayResults = results.slice(0, MAX_DISPLAY_COUNT);
  const hasMore = results.length > MAX_DISPLAY_COUNT;

  return (
    <div className={styles.tile}>
      {/* 検索入力エリア */}
      <div className={styles.searchArea}>
        <label className={styles.searchLabel} htmlFor="keigo-medium-search">
          敬語を検索
        </label>
        <Input
          id="keigo-medium-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: 言う、いただく、確認…"
          aria-label="敬語を検索"
          aria-controls="keigo-medium-search-results"
        />
      </div>

      {/* 結果件数 */}
      {query.trim() && (
        <div className={styles.resultCount} aria-live="polite">
          {results.length} 件
          {hasMore && ` (上位 ${MAX_DISPLAY_COUNT} 件を表示)`}
        </div>
      )}

      {/* 候補一覧 */}
      <div
        id="keigo-medium-search-results"
        className={styles.resultList}
        role="list"
        aria-label="検索結果"
      >
        {displayResults.length > 0 ? (
          displayResults.map((entry) => (
            <ResultItem key={entry.id} entry={entry} />
          ))
        ) : (
          <div className={styles.emptyState} role="status">
            <span className={styles.emptyIcon} aria-hidden="true">
              🔍
            </span>
            <span>「{query}」に一致する敬語が見つかりません</span>
          </div>
        )}
      </div>

      {/* 詳細ページへの導線 */}
      <Link href="/tools/keigo-reference" className={styles.detailLink}>
        例文・用例を含む全詳細はこちら →
      </Link>
    </div>
  );
}
