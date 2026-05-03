"use client";

/**
 * TileGrid — タイルをグリッド表示し並び替え可能にするコンポーネント（C-2 v10）
 *
 * - @dnd-kit/core + @dnd-kit/sortable でドラッグ&ドロップ並び替えを実装する。
 * - 編集モード時のみ DndContext をマウントする（docs/knowledge/dnd-kit.md §2 参照）。
 * - WCAG SC 2.5.7 単一ポインター代替: 方式 α（「↑」「↓」ボタンを常時表示）を採用。
 * - DndContext の SSR 問題回避のため、このコンポーネントは呼び出し元が
 *   dynamic({ ssr: false }) でインポートする前提（docs/knowledge/dnd-kit.md §1 参照）。
 * - v10 追加: autoScroll 有効化（瞬間 43）/ 揺れアニメクラス付与（瞬間 9）
 *   / onLongPress props（Tile → ToolboxShell への伝搬）
 *
 * 視覚表現規則: DESIGN.md §4 (L69-78) を参照。
 */

import { useState, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Tile } from "./Tile";
import { getTileComponent } from "./tile-loader";
import { getTileableBySlug } from "./registry";
import type { TileLayoutEntry } from "./storage";
import styles from "./TileGrid.module.css";

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

/** TileGrid コンポーネントの props */
export interface TileGridProps {
  /** 表示するタイルの配列（order 順に並んでいる前提） */
  tiles: TileLayoutEntry[];
  /** 編集モードかどうか */
  isEditing: boolean;
  /** タイル順序変更コールバック（並び替え後の全タイル配列を渡す） */
  onChangeTiles: (tiles: TileLayoutEntry[]) => void;
  /** タイル削除コールバック（削除対象 slug を渡す） */
  onRemoveTile: (slug: string) => void;
  /**
   * 長押し成立時のコールバック（瞬間 37）。
   * Tile から伝搬し、ToolboxShell が編集モード突入を制御する。
   */
  onLongPress?: (slug: string) => void;
}

// ---------------------------------------------------------------------------
// ソート可能アイテム（内部コンポーネント）
// ---------------------------------------------------------------------------

interface SortableItemProps {
  entry: TileLayoutEntry;
  index: number;
  total: number;
  isEditing: boolean;
  onMoveUp: (slug: string) => void;
  onMoveDown: (slug: string) => void;
  onRemove: (slug: string) => void;
  /** 揺れアニメ用クラス名（編集モード時に付与、瞬間 9） */
  wiggleClassName?: string;
  /** 長押し成立時のコールバック（瞬間 37、Tile → ToolboxShell への伝搬） */
  onLongPress?: (slug: string) => void;
}

/**
 * SortableItem — useSortable フックを使って各タイルをソート可能にするラッパー。
 *
 * 編集モード時に ↑↓ / 削除ボタンを絶対配置でオーバーレイする。
 * tileComponent は呼び出し元でキャッシュ済み参照を渡す（react-hooks/static-components 対応）。
 */
function SortableItem({
  entry,
  index,
  total,
  isEditing,
  onMoveUp,
  onMoveDown,
  onRemove,
  wiggleClassName,
  onLongPress,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.slug });

  // CSS transform の適用（dnd-kit が提供する CSS.Transform 文字列）
  // ドラッグ開始時に scale(1.03) を付与して「持ち上がる感覚」を表現する（瞬間 12）。
  // ドロップ完了時は transition: 150ms / ease-out で scale を 1.0 に戻す（瞬間 15）。
  const scale = isDragging ? 1.03 : 1;
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${scale})`
      : isDragging
        ? `scale(${scale})`
        : undefined,
    transition: isDragging
      ? (transition ?? undefined)
      : transition
        ? `${transition}, transform 150ms ease-out`
        : "transform 150ms ease-out",
  };

  // getTileComponent は loaderCache でメモ化されているため毎回呼んでも同一参照を返す
  // react-hooks/static-components の警告を避けるため useMemo は使わず、
  // モジュールレベルのキャッシュに依存する（tile-loader.ts の設計による）
  const tileComponent = getTileComponent(entry.slug, {
    variantId: entry.variantId,
  });

  // displayName: ↑↓/削除ボタンの aria-label に使う
  const tileable = getTileableBySlug(entry.slug);
  const displayName = tileable?.displayName ?? entry.slug;

  const itemClassName = [
    styles.sortableItem,
    isDragging ? styles.sortableItemDragging : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={setNodeRef} style={style} className={itemClassName}>
      <Tile
        entry={entry}
        isEditing={isEditing}
        isDragging={isDragging}
        tileComponent={tileComponent}
        onLongPress={onLongPress}
        className={wiggleClassName}
        // ドラッグハンドルに attributes / listeners を渡す設計は
        // Tile が data-drag-handle 要素を持つため、ここでは article ルートに渡す
        // （Tile 内の dragHandle 要素で全体ドラッグが可能になる）
        {...(isEditing ? { ...attributes, ...listeners } : {})}
      />

      {/* 編集モード時のみ操作ボタンを表示（WCAG SC 2.5.7 方式 α） */}
      {isEditing && (
        <div className={styles.controlsOverlay}>
          {/* ↑ ボタン: 先頭タイルには表示しない */}
          {index > 0 && (
            <button
              type="button"
              className={styles.moveButton}
              aria-label={`${displayName}を上に移動`}
              onClick={() => onMoveUp(entry.slug)}
            >
              {/* Lucide スタイル線画 SVG (DESIGN.md §3 参照) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            </button>
          )}

          {/* ↓ ボタン: 末尾タイルには表示しない */}
          {index < total - 1 && (
            <button
              type="button"
              className={styles.moveButton}
              aria-label={`${displayName}を下に移動`}
              onClick={() => onMoveDown(entry.slug)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            </button>
          )}

          {/* 削除ボタン */}
          <button
            type="button"
            className={styles.removeButton}
            aria-label={`${displayName}を削除`}
            onClick={() => onRemove(entry.slug)}
          >
            {/* Lucide スタイル X アイコン */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
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

// ---------------------------------------------------------------------------
// TileGrid（公開コンポーネント）
// ---------------------------------------------------------------------------

/**
 * TileGrid — タイルを並び替え可能なグリッドとして表示するコンポーネント。
 *
 * 状態管理は props で完結し、useToolboxConfig を直接呼ばない（責任分離）。
 * DndContext の SSR 問題は呼び出し元（ToolboxShell）が dynamic({ ssr: false }) で解決する。
 */
export function TileGrid({
  tiles,
  isEditing,
  onChangeTiles,
  onRemoveTile,
  onLongPress,
}: TileGridProps) {
  // ドラッグ完了時の aria-live 通知テキスト
  const [announcement, setAnnouncement] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /** order を 0 始まり連番に振り直してコールバックに渡す */
  const reorder = useCallback(
    (newSlugsOrder: TileLayoutEntry[]) => {
      const reassigned = newSlugsOrder.map((entry, i) => ({
        ...entry,
        order: i,
      }));
      onChangeTiles(reassigned);
    },
    [onChangeTiles],
  );

  /** DnD 完了ハンドラー */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tiles.findIndex((t) => t.slug === active.id);
      const newIndex = tiles.findIndex((t) => t.slug === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const moved = tiles[oldIndex];
      const tileable = getTileableBySlug(moved.slug);
      const displayName = tileable?.displayName ?? moved.slug;

      const newTiles = arrayMove(tiles, oldIndex, newIndex);
      reorder(newTiles);

      // aria-live でドラッグ完了を通知（WCAG SC 4.1.3 対応）
      setAnnouncement(`${displayName} を ${newIndex + 1} 番目に移動しました。`);
    },
    [tiles, reorder],
  );

  /** ↑ ボタン: 1 つ上に移動 */
  const handleMoveUp = useCallback(
    (slug: string) => {
      const index = tiles.findIndex((t) => t.slug === slug);
      if (index <= 0) return;
      reorder(arrayMove(tiles, index, index - 1));
    },
    [tiles, reorder],
  );

  /** ↓ ボタン: 1 つ下に移動 */
  const handleMoveDown = useCallback(
    (slug: string) => {
      const index = tiles.findIndex((t) => t.slug === slug);
      if (index < 0 || index >= tiles.length - 1) return;
      reorder(arrayMove(tiles, index, index + 1));
    },
    [tiles, reorder],
  );

  const itemIds = tiles.map((t) => t.slug);

  // 編集モード時に揺れアニメクラスを付与する（瞬間 9）。
  // 各タイルに位相ずれを与えるためのクラスは CSS Module の wiggle で定義する。
  const wiggleClassName = isEditing ? styles.wiggle : undefined;

  const gridContent = (
    <div className={styles.grid}>
      {tiles.map((entry, index) => (
        <SortableItem
          key={entry.slug}
          entry={entry}
          index={index}
          total={tiles.length}
          isEditing={isEditing}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onRemove={onRemoveTile}
          wiggleClassName={wiggleClassName}
          onLongPress={onLongPress}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* aria-live 通知領域（スクリーンリーダー向け）: DESIGN.md §4 (L69-78) を参照 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.announcer}
      >
        {announcement}
      </div>

      {/* 編集モード時のみ DndContext をマウントする（docs/knowledge/dnd-kit.md §2 参照） */}
      {isEditing ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          autoScroll
        >
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            {gridContent}
          </SortableContext>
        </DndContext>
      ) : (
        gridContent
      )}
    </>
  );
}
