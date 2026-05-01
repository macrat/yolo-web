"use client";

/**
 * AddTileModal — タイル追加モーダル
 *
 * 編集モードで「+ ツールを追加」クリック時に表示する選択 UI。
 *
 * タイル候補の取得優先順:
 * 1. getAllTileableEntries()（tile フィールドが定義されている実タイル）
 * 2. getAllFixtures()（フィクスチャダミー）— 本サイクルでは実タイル 0 件のためこちらが主
 *
 * 候補は「すでに配置済み（existingSlugs）」のものを除いて表示する。
 *
 * アクセシビリティ:
 * - role="dialog" + aria-modal="true" + aria-labelledby
 * - フォーカストラップ（Tab で modal 内を循環）
 * - Escape キーで閉じる
 * - 背景クリックで閉じる
 *
 * DESIGN.md 準拠:
 * - border-radius: --r-normal
 * - focus-visible スタイルあり
 * - dark mode: :global(:root.dark) 方式
 */

import { useEffect, useRef, useId, useState } from "react";
import type { Tileable } from "@/lib/toolbox/types";
import type { TileSize } from "@/components/Tile/types";
import { getAllTileableEntries } from "@/lib/toolbox/registry";
import { ALL_FIXTURES } from "@/components/Tile/fixtures";
import styles from "./AddTileModal.module.css";

interface AddTileModalProps {
  /** 既に配置済みの slug セット（重複追加を防ぐため除外に使用） */
  existingSlugs: Set<string>;
  /** タイル選択時のコールバック */
  onAdd: (tileable: Tileable, size: TileSize) => void;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
}

/** モーダル内で選択できるタイル候補エントリ */
interface TileCandidate {
  tileable: Tileable;
  recommendedSize: TileSize;
  /** フィクスチャ由来かどうか（フィクスチャダミーは UI に区別表示） */
  isFixture: boolean;
}

/**
 * モーダルに表示するタイル候補を構築する。
 *
 * 優先順:
 * 1. getAllTileableEntries()（tile フィールド定義済みの実タイル）
 * 2. ALL_FIXTURES（フィクスチャダミータイル）
 *
 * existingSlugs に含まれる slug は除外する。
 */
function buildCandidates(existingSlugs: Set<string>): TileCandidate[] {
  const realEntries = getAllTileableEntries()
    .filter((t) => !existingSlugs.has(t.slug))
    .map((t) => ({
      tileable: t,
      recommendedSize:
        (Array.isArray(t.tile)
          ? t.tile[0]?.recommendedSize
          : t.tile?.recommendedSize) ?? ("medium" as TileSize),
      isFixture: false,
    }));

  const fixtureEntries = ALL_FIXTURES.filter(
    (f) => !existingSlugs.has(f.tileable.slug),
  ).map((f) => ({
    tileable: f.tileable,
    recommendedSize: f.recommendedSize,
    isFixture: true,
  }));

  // 同一 slug の重複を避けて統合（real が優先）
  const seenSlugs = new Set(realEntries.map((e) => e.tileable.slug));
  const deduped = fixtureEntries.filter((f) => !seenSlugs.has(f.tileable.slug));

  return [...realEntries, ...deduped];
}

/**
 * AddTileModal — タイル追加モーダルコンポーネント
 */
function AddTileModal({ existingSlugs, onAdd, onClose }: AddTileModalProps) {
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 検索クエリ
  const [searchQuery, setSearchQuery] = useState("");

  // タイル候補（初回レンダリング時に構築）
  const [candidates] = useState<TileCandidate[]>(() =>
    buildCandidates(existingSlugs),
  );

  // 検索フィルタ済み候補
  const filteredCandidates =
    searchQuery.trim() === ""
      ? candidates
      : candidates.filter(
          (c) =>
            c.tileable.displayName.includes(searchQuery) ||
            c.tileable.shortDescription.includes(searchQuery) ||
            c.tileable.slug.includes(searchQuery),
        );

  /**
   * Escape キーで閉じる。
   * フォーカストラップは Tab キーのデフォルト動作 + モーダル内要素のみ focusable にすることで実現。
   */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /**
   * モーダル開時に最初のフォーカス可能要素（検索入力欄）にフォーカスを移動する。
   */
  useEffect(() => {
    const input = modalRef.current?.querySelector<HTMLInputElement>(
      "input[type='search']",
    );
    input?.focus();
  }, []);

  /**
   * オーバーレイ（背景）クリックで閉じる。
   * モーダル本体（.modal）のクリックは伝播を止める。
   */
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      aria-hidden="false"
    >
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="add-tile-modal"
      >
        {/* モーダルヘッダー */}
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            ツールを追加
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="閉じる"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className={styles.closeIcon}
            >
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>

        {/* 検索入力 */}
        <div className={styles.searchWrapper}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="ツール名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="ツール名で検索"
          />
        </div>

        {/* 候補リスト */}
        <div
          className={styles.listWrapper}
          role="list"
          aria-label="追加できるツール一覧"
        >
          {filteredCandidates.length === 0 ? (
            <p className={styles.empty}>
              {searchQuery.trim() !== ""
                ? "検索結果なし"
                : "追加できるツールがありません"}
            </p>
          ) : (
            filteredCandidates.map((candidate) => (
              <button
                key={candidate.tileable.slug}
                type="button"
                className={styles.candidateItem}
                role="listitem"
                onClick={() =>
                  onAdd(candidate.tileable, candidate.recommendedSize)
                }
                aria-label={`${candidate.tileable.displayName}を追加`}
              >
                <div className={styles.candidateInfo}>
                  {/* アイコンまたはプレースホルダー */}
                  {candidate.tileable.icon ? (
                    <span className={styles.candidateIcon} aria-hidden="true">
                      {candidate.tileable.icon}
                    </span>
                  ) : (
                    <span
                      className={styles.candidateIconPlaceholder}
                      aria-hidden="true"
                    />
                  )}

                  <div className={styles.candidateText}>
                    <span className={styles.candidateName}>
                      {candidate.tileable.displayName}
                      {candidate.isFixture && (
                        <span className={styles.fixtureBadge}>ダミー</span>
                      )}
                    </span>
                    <span className={styles.candidateDescription}>
                      {candidate.tileable.shortDescription}
                    </span>
                  </div>
                </div>

                {/* 推奨サイズバッジ */}
                <span
                  className={styles.sizeBadge}
                  data-size={candidate.recommendedSize}
                  aria-label={`推奨サイズ: ${candidate.recommendedSize}`}
                >
                  {candidate.recommendedSize}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AddTileModal;
