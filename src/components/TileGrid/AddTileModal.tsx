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
 * アクセシビリティ（AP-I08 / AP-I09 / WCAG 2.1 準拠）:
 * - role="dialog" + aria-modal="true" + aria-labelledby
 * - フォーカストラップ: inert 属性で modal 外要素を非操作化（AP-I09: jsdom 非対応のため Playwright 検証必須）
 * - Escape キーで閉じる / 背景クリックで閉じる
 * - 候補リストは <ul><li><button> 構造（WCAG 4.1.2: role="listitem" を <button> に付けない）
 * - Portal: createPortal で document.body 直下にマウント（AP-I08: overflow/z-index の影響を受けない）
 *
 * DESIGN.md 準拠:
 * - border-radius: --r-normal / --r-interactive
 * - focus-visible スタイルあり
 * - dark mode: :global(:root.dark) 方式（AP-I07）
 */

import { useEffect, useRef, useId, useState } from "react";
import { createPortal } from "react-dom";
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
   * inert 属性によるフォーカストラップ（AP-I09 準拠）。
   *
   * React 19 以降、JSX の inert 属性をネイティブサポート。
   * モーダル open 中、モーダル外の要素に `inert` を付与することで
   * Tab フォーカスが modal 外に逃げない。
   * jsdom では inert の判定が不完全なため、実機検証は Playwright で行う。
   */
  useEffect(() => {
    // document.body の直接の子要素で modal 外の要素に inert を付与する
    const body = document.body;
    const portal = overlayRef.current?.parentElement;
    const toInert: Element[] = [];

    for (const child of Array.from(body.children)) {
      if (child !== portal && child !== overlayRef.current) {
        child.setAttribute("inert", "");
        toInert.push(child);
      }
    }

    return () => {
      for (const el of toInert) {
        el.removeAttribute("inert");
      }
    };
  }, []);

  /**
   * Escape キーで閉じる。
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
   * モーダル open 時に検索入力欄にフォーカスを移動する。
   */
  useEffect(() => {
    const input = modalRef.current?.querySelector<HTMLInputElement>(
      "input[type='search']",
    );
    input?.focus();
  }, []);

  /**
   * オーバーレイ（背景）クリックで閉じる。
   */
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  /**
   * Portal 先の DOM ノード（document.body）。
   * SSR では document が存在しないため、クライアント側でのみ portal を作る。
   * この コンポーネントは "use client" かつ dynamic({ ssr: false }) 経由で読まれるため
   * 実質 SSR は来ないが、型安全のためガードを入れる。
   */
  const modalContent = (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
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

        {/* 候補リスト: <ul><li><button> 構造で WCAG 4.1.2 を満たす（role="listitem" を <button> に付けない）*/}
        <ul
          className={styles.listWrapper}
          aria-label="追加できるツール一覧"
          // VoiceOver / Safari の list-style: none によるリストロール消失を防ぐ
          role="list"
        >
          {filteredCandidates.length === 0 ? (
            <li className={styles.emptyItem}>
              <p className={styles.empty}>
                {searchQuery.trim() !== ""
                  ? "検索結果なし"
                  : "追加できるツールがありません"}
              </p>
            </li>
          ) : (
            filteredCandidates.map((candidate) => (
              <li key={candidate.tileable.slug} className={styles.candidateLi}>
                <button
                  type="button"
                  className={styles.candidateItem}
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
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );

  // Portal: document.body 直下にマウントして z-index / overflow の影響を受けない（AP-I08）
  // typeof document チェックで SSR 安全を保証する
  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}

export default AddTileModal;
