"use client";

/**
 * TileMoveButtons — 編集モード時の移動操作 UI。
 *
 * medium / large サイズ: 4 ボタンを常時表示。
 * small サイズ: 展開トリガーを表示し、クリックでインライン展開。
 *   ヘッダー行が狭いため折りたたみ UI を採用（品質要件: 視覚破綻なし、44px タップ）。
 *
 * アイコンは Lucide スタイル線画 SVG（DESIGN.md §3 準拠）。
 * 絵文字・Unicode 記号は不使用。
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { TileSize } from "./types";
import styles from "./TileMoveButtons.module.css";

export interface TileMoveButtonsProps {
  /** タイルのサイズ（small のみ折りたたみ展開 UI） */
  size: TileSize;
  /** このタイルがリスト先頭か（true のとき「先頭へ」「前へ」が disabled） */
  isFirst: boolean;
  /** このタイルがリスト末尾か（true のとき「後へ」「末尾へ」が disabled） */
  isLast: boolean;
  /** 先頭へ移動 */
  onMoveFirst: () => void;
  /** 1 つ前へ移動 */
  onMovePrev: () => void;
  /** 1 つ後へ移動 */
  onMoveNext: () => void;
  /** 末尾へ移動 */
  onMoveLast: () => void;
  /**
   * 他の overlay（AddTileModal など）が開いているかどうか（O1: 排他制御）。
   * true のとき small サイズの展開を抑制し、展開中なら強制的に閉じる。
   * 省略時は false として扱う。
   */
  isOverlayOpen?: boolean;
  /**
   * small サイズ展開パネルの開閉状態変化コールバック（O1: 排他制御）。
   * 展開時に true、閉じるときに false を渡す。
   * 親（Tile → TileGrid）がこれを受け取り setOpenOverlay を呼ぶことで
   * 双方向の overlay 排他制御を実現する。
   */
  onExpandChange?: (expanded: boolean) => void;
}

/** isFirst / isLast のどちらの条件で disabled を判定するかを表す型 */
type DisableCondition = "isFirst" | "isLast";

/** 移動ボタン 4 種の定義 */
const MOVE_ACTIONS: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
  disableOn: DisableCondition;
  handlerKey: "onMoveFirst" | "onMovePrev" | "onMoveNext" | "onMoveLast";
}> = [
  {
    key: "first",
    label: "先頭へ移動",
    /** Lucide chevrons-up 相当の SVG パス */
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="17 11 12 6 7 11" />
        <polyline points="17 18 12 13 7 18" />
      </svg>
    ),
    disableOn: "isFirst" as DisableCondition,
    handlerKey: "onMoveFirst" as const,
  },
  {
    key: "prev",
    label: "前へ移動",
    /** Lucide chevron-up 相当の SVG パス */
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    ),
    disableOn: "isFirst" as DisableCondition,
    handlerKey: "onMovePrev" as const,
  },
  {
    key: "next",
    label: "後へ移動",
    /** Lucide chevron-down 相当の SVG パス */
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    disableOn: "isLast" as DisableCondition,
    handlerKey: "onMoveNext" as const,
  },
  {
    key: "last",
    label: "末尾へ移動",
    /** Lucide chevrons-down 相当の SVG パス */
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="7 6 12 11 17 6" />
        <polyline points="7 13 12 18 17 13" />
      </svg>
    ),
    disableOn: "isLast" as DisableCondition,
    handlerKey: "onMoveLast" as const,
  },
];

/** 4 つの移動ボタンを横並びで表示するサブコンポーネント */
function MoveButtonList({
  isFirst,
  isLast,
  onMoveFirst,
  onMovePrev,
  onMoveNext,
  onMoveLast,
  firstButtonRef,
}: Omit<TileMoveButtonsProps, "size"> & {
  /** 先頭ボタンへの ref（small サイズ展開時のフォーカス自動移動に使用） */
  firstButtonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const handlers = { onMoveFirst, onMovePrev, onMoveNext, onMoveLast };

  return (
    <div className={styles.buttonList} role="group" aria-label="タイルの移動">
      {MOVE_ACTIONS.map((action, index) => (
        <button
          key={action.key}
          ref={index === 0 ? firstButtonRef : undefined}
          type="button"
          className={styles.moveButton}
          aria-label={action.label}
          disabled={action.disableOn === "isFirst" ? isFirst : isLast}
          onClick={handlers[action.handlerKey]}
        >
          <span className={styles.icon}>{action.icon}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * TileMoveButtons — 編集モード移動操作 UI。
 * size="small" 時のみ展開トリガー経由のインライン展開、それ以外は常時表示。
 *
 * a11y 対応（small サイズ展開パネル）:
 * - 展開時に先頭ボタン（「先頭へ移動」）へ自動フォーカス
 * - ESC キーで展開パネルを閉じる（O3: expanded=true の時のみ listener 登録）
 * - 閉じた時、展開トリガーにフォーカスを戻す（O2: WAI-ARIA disclosure パターン）
 *
 * 排他制御（O1）:
 * - isOverlayOpen=true の時は展開を抑制し、展開中なら強制的に閉じる
 * - onExpandChange で親に開閉状態を通知し、双方向排他を実現する
 */
export default function TileMoveButtons({
  size,
  isFirst,
  isLast,
  onMoveFirst,
  onMovePrev,
  onMoveNext,
  onMoveLast,
  isOverlayOpen = false,
  onExpandChange,
}: TileMoveButtonsProps) {
  const [expanded, setExpanded] = useState(false);
  /** 展開パネル内の先頭ボタンへの ref（フォーカス自動移動に使用） */
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  /** 展開トリガーへの ref（閉じた後のフォーカス戻しに使用 O2） */
  const triggerRef = useRef<HTMLButtonElement>(null);

  /**
   * 展開状態を変更するヘルパー。
   * setExpanded + onExpandChange を一括して呼び出す。
   */
  const changeExpanded = useCallback(
    (next: boolean) => {
      setExpanded(next);
      onExpandChange?.(next);
    },
    [onExpandChange],
  );

  /**
   * 閉じる処理（O2: 閉じた後は展開トリガーにフォーカスを戻す）。
   * WAI-ARIA disclosure パターン: 閉じた時はトリガーに focus を戻す。
   * 同期的に focus() を呼ぶ（React の state 更新より先に DOM focus を確保）。
   */
  const closePanel = useCallback(() => {
    changeExpanded(false);
    triggerRef.current?.focus();
  }, [changeExpanded]);

  /**
   * ESC キーで展開パネルを閉じる（O3: expanded=true の時のみ listener を登録）。
   */
  useEffect(() => {
    if (!expanded) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closePanel();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded, closePanel]);

  /**
   * O1: 他の overlay が開いたとき（isOverlayOpen=true）の展開パネル抑制。
   * expanded state はそのまま保持し、実際の表示を `isVisible` で制御する。
   * isOverlayOpen が false に戻っても expanded は false のまま（ユーザーが再展開する必要がある）。
   * これにより useEffect での setState（cascading renders lint エラー）を回避できる。
   */
  const isVisible = expanded && !isOverlayOpen;

  /**
   * 展開時に先頭ボタンへフォーカスを移動する（N2）。
   * isVisible（= expanded && !isOverlayOpen）が true の時のみ発火。
   */
  useEffect(() => {
    if (isVisible && firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, [isVisible]);

  if (size !== "small") {
    // medium / large: 4 ボタンを常時表示
    return (
      <MoveButtonList
        isFirst={isFirst}
        isLast={isLast}
        onMoveFirst={onMoveFirst}
        onMovePrev={onMovePrev}
        onMoveNext={onMoveNext}
        onMoveLast={onMoveLast}
      />
    );
  }

  // small: 展開トリガー + インライン展開
  return (
    <div className={styles.smallWrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.expandButton}
        aria-label="移動操作を展開"
        aria-expanded={isVisible}
        onClick={() => {
          // O1: 他の overlay が開いている場合は展開しない
          if (isOverlayOpen) return;
          if (expanded) {
            closePanel();
          } else {
            changeExpanded(true);
          }
        }}
      >
        {/* Lucide more-horizontal 相当 */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
          className={styles.icon}
        >
          <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {isVisible && (
        <div className={styles.expandedPanel}>
          <MoveButtonList
            isFirst={isFirst}
            isLast={isLast}
            onMoveFirst={onMoveFirst}
            onMovePrev={onMovePrev}
            onMoveNext={onMoveNext}
            onMoveLast={onMoveLast}
            firstButtonRef={firstButtonRef}
          />
          {/* 閉じるボタン（aria-label で区別） */}
          <button
            type="button"
            className={styles.closeButton}
            aria-label="移動操作を閉じる"
            onClick={closePanel}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
              className={styles.icon}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
