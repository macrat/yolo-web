"use client";

/**
 * EmptySlot コンポーネント。
 *
 * 編集モードで「+ ツールを追加」スロットとして表示する。
 * クリックでツール追加 UI（モーダル等）を開くトリガー。
 *
 * 使用するサイズ（span 数）は親コンポーネントが style で直接指定する。
 */

import type { TileSize } from "./types";
import { SIZE_SPAN } from "./constants";
import styles from "./EmptySlot.module.css";

interface EmptySlotProps {
  /** スロットのグリッドサイズ（span 数の決定に使用） */
  size?: TileSize;
  /** 「+ 追加」クリック時のコールバック */
  onAdd?: () => void;
  /** ボタン内に表示するラベルテキスト（省略時は「ツールを追加」） */
  label?: string;
  /**
   * スロットの 0-based インデックス。
   * 指定時は aria-label が「N 番目のスロットにツールを追加」となり、
   * スクリーンリーダーが複数スロットを区別できるようになる。
   */
  index?: number;
}

/**
 * EmptySlot — 編集モードで「+ ツールを追加」を表示するスロット。
 * DndContext 外で使用するため useSortable は使わない。
 *
 * 複数並べる場合は index を渡すと aria-label が一意になる。
 */
function EmptySlot({
  size = "medium",
  onAdd,
  label = "ツールを追加",
  index,
}: EmptySlotProps) {
  const style: React.CSSProperties = {
    gridColumn: `span ${SIZE_SPAN[size]}`,
  };

  // 複数 EmptySlot が並ぶ場合、スクリーンリーダーが区別できるよう aria-label を一意にする。
  // 可視ラベルと異なる説明のため aria-label を使用（visible text は省略情報のみ）。
  const ariaLabel =
    index !== undefined ? `${index + 1} 番目のスロットに${label}` : label;

  return (
    <button
      type="button"
      className={styles.slot}
      style={style}
      aria-label={ariaLabel}
      onClick={onAdd}
    >
      <span className={styles.inner}>
        {/* + アイコン */}
        <svg
          className={styles.plusIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className={styles.label} aria-hidden="true">
          {label}
        </span>
      </span>
    </button>
  );
}

export default EmptySlot;
