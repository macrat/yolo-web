"use client";

/**
 * dnd-kit グリッドサイズ可変スパイク
 *
 * 経路 A（rectSortingStrategy）の検証結果：
 *   - Issue #117 ゴースト引き伸ばし問題が顕著（DragOverlay が全幅に引き伸ばされる）
 *   - グリッドレイアウト崩壊が確認された → 経路 A 不採用
 *
 * 現在の検証：経路 B
 *   - empty strategy（() => null）を渡して dnd-kit の標準並び替えを無効化
 *   - 並び替えロジックは onDragOver で自前実装
 *   - DragOverlay でドラッグ元と同サイズの固定ゴーストを描画
 *
 * 検証タイル構成: small × 2、medium × 2、large × 1（計 5 タイル）
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

type TileSize = "small" | "medium" | "large";

interface TileItem {
  id: string;
  label: string;
  size: TileSize;
}

// span 値のマップ
const SIZE_SPAN: Record<TileSize, number> = {
  small: 1,
  medium: 2,
  large: 3,
};

// サイズ別の背景色（視覚的に識別しやすく）
const SIZE_COLOR: Record<TileSize, string> = {
  small: "#a8d8ea",
  medium: "#aa96da",
  large: "#fcbad3",
};

const INITIAL_TILES: TileItem[] = [
  { id: "s1", label: "Small 1", size: "small" },
  { id: "m1", label: "Medium 1", size: "medium" },
  { id: "s2", label: "Small 2", size: "small" },
  { id: "m2", label: "Medium 2", size: "medium" },
  { id: "l1", label: "Large 1", size: "large" },
];

/** 個別タイルコンポーネント（useSortable を使用） */
function SortableTile({
  tile,
  isOverlay = false,
}: {
  tile: TileItem;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${SIZE_SPAN[tile.size]}`,
    backgroundColor: SIZE_COLOR[tile.size],
    border: "2px solid #333",
    borderRadius: "8px",
    padding: "16px",
    cursor: "grab",
    opacity: isDragging ? 0.4 : 1,
    minHeight: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
    boxSizing: "border-box",
    ...(isOverlay && { boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {tile.label} ({tile.size})
    </div>
  );
}

/**
 * 経路 B: empty strategy + 自前 onDragOver で並び替え + DragOverlay でゴースト描画
 *
 * empty strategy（() => null）を渡すことで、dnd-kit の標準並び替えアニメーションを
 * 完全に無効化する。これにより Issue #117（ゴースト引き伸ばし）と
 * Issue #720（index 誤推定）を回避できる。
 *
 * 並び替えは onDragOver でリアルタイムに行い、ドラッグ中もプレビューが更新される。
 * DragOverlay はドラッグ元のサイズを固定して描画するため、引き伸ばしは起きない。
 */
function RouteBGrid() {
  const [tiles, setTiles] = useState<TileItem[]>(INITIAL_TILES);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  /** onDragOver で即時並び替え（プレビュー更新）
   *
   * findIndex が -1 を返す場合（存在しないID）はガードして早期リターン。
   * dnd-kit Issue #1450: closestCenter はサイズ可変 grid で振動することがある。
   * 2.2.6 で closestCorners の方が安定するか再評価する。
   */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTiles((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      // findIndex が -1 を返した場合はガード（存在しない ID へのドラッグを無視）
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function handleDragEnd() {
    // onDragOver で既に並び替え済みなので、ここでは activeId をリセットするだけ
    setActiveId(null);
  }

  const activeItem = activeId ? tiles.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* strategy に () => null を渡すことで dnd-kit の標準変換アニメーションを無効化 */}
      <SortableContext items={tiles.map((t) => t.id)} strategy={() => null}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            padding: "16px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          {tiles.map((tile) => (
            <SortableTile key={tile.id} tile={tile} />
          ))}
        </div>
      </SortableContext>
      {/* DragOverlay でドラッグ元サイズを固定したゴーストを描画 */}
      <DragOverlay>
        {activeItem ? <SortableTile tile={activeItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default function DndSpikeContent() {
  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "20px", marginBottom: "8px" }}>
        dnd-kit グリッドサイズ可変スパイク
      </h1>
      <p style={{ marginBottom: "8px", color: "#666", fontSize: "14px" }}>
        検証中の経路:{" "}
        <strong>
          経路 B（empty strategy + 自前 onDragOver + DragOverlay）
        </strong>
        <br />
        タイル構成: small × 2、medium × 2、large × 1（合計 5 タイル）
        <br />
        グリッド: 4カラム。small = span 1、medium = span 2、large = span 3
      </p>
      <div
        style={{
          marginBottom: "16px",
          padding: "8px 12px",
          background: "#f8d7da",
          borderRadius: "4px",
          fontSize: "13px",
        }}
      >
        <strong>経路 A 不採用理由:</strong> Issue #117
        ゴースト引き伸ばし問題が顕著（DragOverlay
        が全幅に引き伸ばされグリッド崩壊）
      </div>

      <div style={{ marginBottom: "16px" }}>
        <strong>経路 B 判定チェック:</strong>
        <ul style={{ fontSize: "14px", lineHeight: "1.8" }}>
          <li>DragOverlay がドラッグ元サイズを固定で維持するか</li>
          <li>onDragOver でリアルタイムプレビューが自然か</li>
          <li>ドロップ後の並び順が正確か</li>
        </ul>
      </div>

      <RouteBGrid />

      <div
        style={{
          marginTop: "24px",
          padding: "12px",
          background: "#fff3cd",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        <strong>観察メモ:</strong> ドラッグして並び替え動作を確認。
        <br />
        ゴースト引き伸ばし・index 誤推定がないことを確認する。
      </div>
    </div>
  );
}
