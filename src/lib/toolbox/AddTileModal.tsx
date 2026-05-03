"use client";

/**
 * AddTileModal — 道具箱にタイルを追加するためのモーダルコンポーネント。
 *
 * 仕様:
 * - isOpen=true のときモーダルを表示する。
 * - getAllTileables() で全タイル候補を取得し、currentTileSlugs に含まれるものを除外して表示する。
 * - テキスト検索ボックスで displayName / shortDescription をフィルタできる。
 * - 候補タップで onAdd(slug) を呼び出してモーダルを閉じる（閉じるは親が制御）。
 * - Esc キー / 背景クリック / 閉じるボタンで onClose を呼び出す。
 * - スクロールロックは acquireScrollLock / releaseScrollLock で管理（AP-I07 準拠）。
 * - フォーカストラップ（Tab で内部循環、Esc で閉じる）を実装する。
 *
 * 視覚表現規則は DESIGN.md §3 / §4 (L69-78) を参照。
 * a11y: WCAG SC 2.5.8（タップターゲット 44px 以上）/ SC 2.1.2（フォーカストラップ）/ SC 2.4.3（フォーカス順序）。
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useId,
  useMemo,
} from "react";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import { getAllTileables } from "@/lib/toolbox/registry";
import { TRUST_LEVEL_META } from "@/lib/trust-levels";
import type { Tileable } from "./types";
import styles from "./AddTileModal.module.css";

/** contentKind の表示名マッピング */
const CONTENT_KIND_LABELS: Record<Tileable["contentKind"], string> = {
  tool: "ツール",
  play: "あそび",
  cheatsheet: "チートシート",
};

/** AddTileModal の Props */
interface AddTileModalProps {
  /** モーダルの開閉状態 */
  isOpen: boolean;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
  /**
   * タイルを追加するコールバック。
   * @param slug - 追加するタイルの slug
   */
  onAdd: (slug: string) => void;
  /** 既に道具箱に含まれている slug の一覧（候補から除外するために使用） */
  currentTileSlugs: string[];
}

export default function AddTileModal({
  isOpen,
  onClose,
  onAdd,
  currentTileSlugs,
}: AddTileModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // スクロールロック管理（AP-I07 準拠: body.style.overflow 直書き禁止）
  useEffect(() => {
    if (isOpen) {
      acquireScrollLock();
    }
    return () => {
      if (isOpen) {
        releaseScrollLock();
      }
    };
  }, [isOpen]);

  // モーダルが開いたときに検索欄にフォーカスを当て、クエリをリセットする
  useEffect(() => {
    if (!isOpen) return;
    // モーダルが開くたびに検索クエリをリセットし、入力欄にフォーカスを当てる
    // setSearchQuery はここで副作用として呼んでも React の useEffect の lint ルールに反しないが、
    // 同期 setState が「cascading renders」警告を引き起こすため requestAnimationFrame に包む。
    requestAnimationFrame(() => {
      setSearchQuery("");
      searchInputRef.current?.focus();
    });
  }, [isOpen]);

  // Esc キーで閉じる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // フォーカストラップ: Tab キーでモーダル内部を循環させる
  const handlePanelKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusableSelectors =
        'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])';
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelectors),
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: 最初の要素にいたら最後に戻る
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: 最後の要素にいたら最初に戻る
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [],
  );

  // I-3: モーダルを開いた起点要素を保存し、close 時にフォーカスを戻す（WCAG SC 2.1.2）
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => {
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  // I-8: getAllTileables / Set / filter を useMemo でメモ化してレンダーごとの再計算を避ける
  const allTileables = useMemo(() => getAllTileables(), []);
  const currentSlugSet = useMemo(
    () => new Set(currentTileSlugs),
    [currentTileSlugs],
  );
  const availableTileables = useMemo(
    () => allTileables.filter((t) => !currentSlugSet.has(t.slug)),
    [allTileables, currentSlugSet],
  );

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const filteredTileables = useMemo(
    () =>
      normalizedQuery === ""
        ? availableTileables
        : availableTileables.filter(
            (t) =>
              t.displayName.toLowerCase().includes(normalizedQuery) ||
              t.shortDescription.toLowerCase().includes(normalizedQuery),
          ),
    [availableTileables, normalizedQuery],
  );

  // isOpen=false のとき何も描画しない
  if (!isOpen) {
    return null;
  }

  return (
    /* オーバーレイ: クリックで閉じる */
    <div
      className={styles.overlay}
      data-overlay=""
      onClick={onClose}
      aria-hidden="false"
    >
      {/* パネル: クリックの伝播をオーバーレイに止める */}
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handlePanelKeyDown}
      >
        {/* ヘッダー */}
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            タイルを追加
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="閉じる"
            onClick={onClose}
          >
            &#x2715;{/* × 記号 (U+2715 MULTIPLICATION X) */}
          </button>
        </div>

        {/* 検索欄 */}
        <div className={styles.searchArea}>
          <input
            ref={searchInputRef}
            type="search"
            role="searchbox"
            className={styles.searchInput}
            placeholder="タイルを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="タイルを検索"
          />
        </div>

        {/* 候補リスト */}
        {filteredTileables.length === 0 ? (
          <div className={styles.emptyState} aria-live="polite">
            {availableTileables.length === 0
              ? "追加できるタイルはありません"
              : "該当するタイルはありません"}
          </div>
        ) : (
          <ul
            className={styles.candidateList}
            aria-label="追加可能なタイル一覧"
          >
            {filteredTileables.map((tileable) => {
              const trustMeta = TRUST_LEVEL_META[tileable.trustLevel];
              const kindLabel = CONTENT_KIND_LABELS[tileable.contentKind];
              return (
                <li key={tileable.slug} className={styles.candidateItem}>
                  <div className={styles.candidateInfo}>
                    <div className={styles.candidateName}>
                      {tileable.displayName}
                    </div>
                    <div className={styles.candidateDescription}>
                      {tileable.shortDescription}
                    </div>
                    <div className={styles.candidateMeta}>
                      <span className={styles.contentKindLabel}>
                        {kindLabel}
                      </span>
                      <span
                        className={styles.trustLabel}
                        aria-label={`信頼レベル: ${trustMeta.label}`}
                      >
                        {trustMeta.label}
                      </span>
                    </div>
                  </div>
                  {/* WCAG SC 2.5.8: タップターゲット 44px 以上 */}
                  <button
                    type="button"
                    className={styles.addButton}
                    aria-label={`${tileable.displayName}を追加`}
                    data-wcag-target="44"
                    onClick={() => onAdd(tileable.slug)}
                  >
                    追加
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
