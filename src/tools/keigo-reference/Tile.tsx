"use client";

/**
 * KeigoReferenceTile — 敬語リファレンスの軽量版タイルコンポーネント
 *
 * 道具箱内で medium タイル（2col span 想定）として表示する軽量版。
 * 設計判断 Y2 に従い、以下の 3 段構成:
 *   上段: 検索ボックス + 主要カテゴリチップ（基本動詞 / ビジネス頻出 / 接客サービス）
 *   中段: 検索 or カテゴリ選択結果の候補 3〜5 件（動詞名のみ）
 *   下段: 候補クリック時に尊敬語 / 謙譲語 / 丁寧語を 1 行ずつ + 例文 1 つ
 * フッター: 「詳細を開く」リンクで /tools/keigo-reference へ
 *
 * ロジックは既存 logic.ts をそのまま再利用（検索アルゴリズムの再実装なし）。
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  filterEntries,
  getKeigoCategories,
  type KeigoCategory,
  type KeigoEntry,
} from "./logic";
import type { TileComponentProps } from "@/lib/toolbox/tile-loader";
import styles from "./Tile.module.css";

/**
 * タイル上段に表示する主要カテゴリチップ。
 * logic.ts の getKeigoCategories() を SSoT として使用し、詳細ページとラベルを統一する。
 * タイルは軽量版のため「すべて」カテゴリは省略し、3 件（basic/business/service）のみ表示。
 */
const TILE_CATEGORIES = getKeigoCategories();

/** タイルに表示する候補の最大件数 */
const MAX_CANDIDATES = 5;

export default function KeigoReferenceTile(
  // slug は TileComponentProps の型契約として受け取るが、このタイル内では使用しない
  // （コンポーネントが自身のデータソース logic.ts を直接参照するため）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: TileComponentProps,
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    KeigoCategory | "all"
  >("all");
  const [selectedEntry, setSelectedEntry] = useState<KeigoEntry | null>(null);

  // カテゴリ選択 or 検索クエリで絞り込んだ候補（最大 MAX_CANDIDATES 件）
  const candidates = useMemo(() => {
    const entries = filterEntries(searchQuery, selectedCategory);
    return entries.slice(0, MAX_CANDIDATES);
  }, [searchQuery, selectedCategory]);

  const handleCategoryClick = (category: KeigoCategory) => {
    setSelectedCategory(category);
    setSelectedEntry(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedEntry(null);
  };

  const handleCandidateClick = (entry: KeigoEntry) => {
    setSelectedEntry((prev) => (prev?.id === entry.id ? null : entry));
  };

  return (
    <div className={styles.tile}>
      {/* 上段: 検索 + カテゴリチップ */}
      <div className={styles.searchRow}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="動詞を検索..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="敬語を検索"
        />
        <div
          className={styles.categoryChips}
          role="radiogroup"
          aria-label="カテゴリ"
        >
          {TILE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="radio"
              className={`${styles.chip} ${selectedCategory === cat.id ? styles.chipActive : ""}`}
              onClick={() => handleCategoryClick(cat.id)}
              aria-checked={selectedCategory === cat.id}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 中段: 候補リスト */}
      <ul className={styles.candidateList} aria-label="候補一覧">
        {candidates.length === 0 ? (
          <li className={styles.noResults}>該当する動詞が見つかりません</li>
        ) : (
          candidates.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className={`${styles.candidateButton} ${selectedEntry?.id === entry.id ? styles.candidateActive : ""}`}
                onClick={() => handleCandidateClick(entry)}
                aria-expanded={selectedEntry?.id === entry.id}
              >
                {entry.casual}
              </button>
            </li>
          ))
        )}
      </ul>

      {/* 下段: 選択した動詞の詳細（尊敬語 / 謙譲語 / 丁寧語 + 例文 1 つ） */}
      {selectedEntry && (
        <div className={styles.detail} aria-label="敬語詳細">
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>尊敬語</span>
            <span className={styles.detailValue}>{selectedEntry.sonkeigo}</span>
            <span className={styles.detailLabel}>謙譲語</span>
            <span className={styles.detailValue}>{selectedEntry.kenjogo}</span>
            <span className={styles.detailLabel}>丁寧語</span>
            <span className={styles.detailValue}>{selectedEntry.teineigo}</span>
          </div>
          {/* 例文 1 つ（最初のもの） */}
          {selectedEntry.examples.length > 0 && (
            <div className={styles.example}>
              <div className={styles.exampleContext}>
                {selectedEntry.examples[0].context}
              </div>
              <div className={styles.exampleLine}>
                <span className={styles.exampleLabel}>尊敬:</span>
                {selectedEntry.examples[0].sonkeigo}
              </div>
              <div className={styles.exampleLine}>
                <span className={styles.exampleLabel}>謙譲:</span>
                {selectedEntry.examples[0].kenjogo}
              </div>
            </div>
          )}
        </div>
      )}

      {/* フッター: 詳細を開くリンク */}
      <div className={styles.footer}>
        <Link href="/tools/keigo-reference" className={styles.detailLink}>
          詳細を開く →
        </Link>
      </div>
    </div>
  );
}
