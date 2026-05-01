"use client";

/**
 * TileGrid — タイル配置 UI コンポーネント
 *
 * 責務:
 * - config.tiles に従って Tile を CSS Grid で配置する（small=1col / medium=2col / large=3col）
 * - 経路 B（empty strategy + 自前 onDragOver + DragOverlay）でドラッグ&ドロップ並び替え
 * - 編集モードで EmptySlot（「+ ツールを追加」ボタン）を末尾に表示
 * - 編集モードで各タイルの削除（× ボタン）に対応
 * - タイル追加モーダル（AddTileModal）の開閉管理
 *
 * 設計方針:
 * - DndContext は外側 ToolboxShell が編集モード時のみ mount する。
 *   本コンポーネントは SortableContext + DragOverlay + タイル一覧のみを担う。
 * - onDragStart/Over/End は ToolboxShell の render props で受け取る setDndHandlers 経由で
 *   ToolboxShell の DndContext に接続する。
 *   これにより ToolboxShell が sensors を管理し、TileGrid がイベントロジックを管理する
 *   責務分離が実現される（ToolboxShell.tsx のコメント参照）。
 * - config（tiles + tileableMap）は外側から props で受け取り、
 *   変更時は onConfigChange コールバックで通知する。
 *   → 2.2.8（localStorage 永続化フック）と容易に組み合わせられる設計。
 *
 * z-index（AP-I08 準拠）:
 * - DragOverlay は dnd-kit が portal で最前面に描画する（z-index: 1000 デフォルト）。
 * - 各 Tile は globals.css の --z-tile（200）を使用。
 *
 * Hydration mismatch 回避（docs/knowledge/dnd-kit.md 参照）:
 * - 本コンポーネントは ToolboxShell 内で "use client" として動作する。
 * - TileGrid 自体は SSR でも safe（DndContext は ToolboxShell 編集モード時のみ mount）。
 * - DragOverlay は dnd-kit 内部で portal を使うため、ssr: false は ToolboxShell 側で制御。
 *
 * 経路 B 実装詳細（2.2.3 スパイク確立済み）:
 * - SortableContext の strategy に () => null を渡す（標準変換アニメーション無効化）
 * - onDragOver で arrayMove + findIndex -1 ガード（Issue #1450 振動問題も回避）
 * - DragOverlay でドラッグ元サイズ固定のゴーストを描画（サイズ引き伸ばし Issue #117 回避）
 */

import { useState, useCallback, useEffect } from "react";
import {
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import Tile from "@/components/Tile";
import EmptySlot from "@/components/Tile/EmptySlot";
import type { Tileable } from "@/lib/toolbox/types";
import type { TileSize, TileMode } from "@/components/Tile/types";
import type { ToolboxDndHandlers } from "@/components/ToolboxShell";
import AddTileModal from "./AddTileModal";
import styles from "./TileGrid.module.css";

/**
 * TileGrid の設定型。
 * 外側（ページ / useToolboxConfig）から渡す。
 */
export interface TileGridConfig {
  /**
   * 配置するタイルの配列（順序 + サイズを持つ）。
   * order フィールドで並び順を管理する（ドラッグ並び替えで更新）。
   */
  tiles: Array<{
    slug: string;
    variantId?: string;
    size: TileSize;
    order: number;
  }>;
  /**
   * slug → Tileable のルックアップ Map。
   * getAllTileables() から構築するか、フィクスチャを直接渡す。
   */
  tileableMap: Map<string, Tileable>;
}

/** TileGrid コンポーネントの props */
interface TileGridProps {
  /** タイル配置設定 */
  config: TileGridConfig;
  /** 操作モード（"view" | "edit"）。ToolboxShell から render props で受け取る */
  mode: TileMode;
  /**
   * 設定変更コールバック。
   * 並び替え・削除・追加のたびに新しい config を引数に呼ばれる。
   * 2.2.8 の localStorage フックと組み合わせることで永続化できる。
   */
  onConfigChange: (newConfig: TileGridConfig) => void;
  /**
   * ToolboxShell の DndContext にイベントハンドラを接続するための関数。
   * ToolboxShell の render props（setDndHandlers）を直接渡す。
   * 省略した場合、DnD 操作は機能しない（使用モード時は自然に省略される）。
   */
  setDndHandlers?: (handlers: ToolboxDndHandlers) => void;
  /** 追加クラス */
  className?: string;
}

/**
 * TileGrid — タイル配置 UI。
 *
 * ToolboxShell の children として呼ばれる。
 * 編集モード（mode="edit"）時は ToolboxShell が外側に DndContext を mount している。
 * setDndHandlers 経由で onDragStart/Over/End を DndContext に接続する。
 */
function TileGrid({
  config,
  mode,
  onConfigChange,
  setDndHandlers,
  className,
}: TileGridProps) {
  /**
   * ドラッグ中のタイル slug（DragOverlay 描画用）。
   * null のときはオーバーレイを描画しない。
   */
  const [activeDragSlug, setActiveDragSlug] = useState<string | null>(null);

  /** AddTileModal の開閉状態 */
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // DnD イベントハンドラ（経路 B: empty strategy + 自前 onDragOver）
  // ---------------------------------------------------------------------------

  /**
   * ドラッグ開始: activeDragSlug を設定して DragOverlay を描画開始する。
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragSlug(event.active.id as string);
  }, []);

  /**
   * ドラッグ中（onDragOver）: arrayMove で即時並び替えしてプレビューを更新する。
   *
   * findIndex が -1 を返すケース（存在しない ID）は早期リターンでガードする（経路 B 必須実装）。
   * dnd-kit Issue #1450（closestCenter の振動問題）を避けるため、
   * active.id === over.id のときも早期リターンする。
   */
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = config.tiles.findIndex((t) => t.slug === active.id);
      const newIndex = config.tiles.findIndex((t) => t.slug === over.id);

      // -1 ガード（存在しない slug へのドラッグを無視）
      if (oldIndex < 0 || newIndex < 0) return;

      const newTiles = arrayMove(config.tiles, oldIndex, newIndex).map(
        (t, i) => ({ ...t, order: i }),
      );
      onConfigChange({ ...config, tiles: newTiles });
    },
    [config, onConfigChange],
  );

  /**
   * ドラッグ終了: activeDragSlug をリセットして DragOverlay を非表示にする。
   * 並び替えは onDragOver で完了済みなのでここでは state のみリセット。
   */
  const handleDragEnd = useCallback(() => {
    setActiveDragSlug(null);
  }, []);

  /**
   * setDndHandlers 経由で ToolboxShell の DndContext にイベントハンドラを接続する。
   * ハンドラが変わるたびに再登録する（config 変化時も handleDragOver が最新 config を参照する）。
   */
  useEffect(() => {
    if (!setDndHandlers) return;
    setDndHandlers({
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
    });
  }, [setDndHandlers, handleDragStart, handleDragOver, handleDragEnd]);

  // ---------------------------------------------------------------------------
  // タイル削除
  // ---------------------------------------------------------------------------

  /**
   * 指定 slug のタイルを config.tiles から削除し、onConfigChange を呼ぶ。
   */
  const handleDeleteTile = useCallback(
    (slug: string) => {
      const newTiles = config.tiles
        .filter((t) => t.slug !== slug)
        .map((t, i) => ({ ...t, order: i }));
      onConfigChange({ ...config, tiles: newTiles });
    },
    [config, onConfigChange],
  );

  // ---------------------------------------------------------------------------
  // タイル追加
  // ---------------------------------------------------------------------------

  /**
   * AddTileModal から選択されたタイルを末尾に追加し、onConfigChange を呼ぶ。
   */
  const handleAddTile = useCallback(
    (tileable: Tileable, size: TileSize) => {
      // 同じ slug が既に存在する場合は追加しない（重複防止）
      if (config.tiles.some((t) => t.slug === tileable.slug)) return;

      const newTile = {
        slug: tileable.slug,
        size,
        order: config.tiles.length,
      };
      onConfigChange({
        ...config,
        tiles: [...config.tiles, newTile],
        // tileableMap に追加したタイルを登録（フィクスチャ経由の場合は既登録のこともある）
        tileableMap: config.tileableMap.has(tileable.slug)
          ? config.tileableMap
          : new Map([...config.tileableMap, [tileable.slug, tileable]]),
      });
      setIsModalOpen(false);
    },
    [config, onConfigChange],
  );

  // ---------------------------------------------------------------------------
  // 表示用タイルリスト（order 順にソート済み + tileableMap で解決できたもののみ）
  // ---------------------------------------------------------------------------

  const resolvedTiles = [...config.tiles]
    .sort((a, b) => a.order - b.order)
    .flatMap((tileConfig) => {
      const tileable = config.tileableMap.get(tileConfig.slug);
      if (!tileable) return []; // tileableMap に存在しない slug はスキップ
      return [{ tileConfig, tileable }];
    });

  // ドラッグ中タイルの情報（DragOverlay 描画用）
  const activeDragItem = activeDragSlug
    ? resolvedTiles.find((t) => t.tileConfig.slug === activeDragSlug)
    : null;

  // SortableContext に渡す id 配列（order 順）
  const sortableIds = resolvedTiles.map((t) => t.tileConfig.slug);

  // ---------------------------------------------------------------------------
  // レンダリング
  // ---------------------------------------------------------------------------

  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <>
      {/* グリッドコンテナ（CSS Grid: 4 カラム、小=span1/中=span2/大=span3）*/}
      <div className={rootClass} data-testid="tile-grid" data-mode={mode}>
        {/* SortableContext（経路 B: strategy={() => null}）*/}
        <SortableContext items={sortableIds} strategy={() => null}>
          {/* タイル一覧 */}
          {resolvedTiles.map(({ tileConfig, tileable }) => (
            <Tile
              key={tileConfig.slug}
              tileable={tileable}
              variant={tileConfig.variantId}
              size={tileConfig.size}
              mode={mode}
              onDelete={
                mode === "edit"
                  ? () => handleDeleteTile(tileConfig.slug)
                  : undefined
              }
            />
          ))}

          {/* 編集モード: 末尾に「+ ツールを追加」スロットを表示 */}
          {mode === "edit" && (
            <EmptySlot
              size="medium"
              label="ツールを追加"
              onAdd={() => setIsModalOpen(true)}
            />
          )}
        </SortableContext>
      </div>

      {/* DragOverlay — ドラッグ中のゴースト描画（portal 経由で最前面）*/}
      <DragOverlay>
        {activeDragItem ? (
          <Tile
            tileable={activeDragItem.tileable}
            variant={activeDragItem.tileConfig.variantId}
            size={activeDragItem.tileConfig.size}
            mode="edit"
          />
        ) : null}
      </DragOverlay>

      {/* タイル追加モーダル */}
      {isModalOpen && (
        <AddTileModal
          existingSlugs={new Set(config.tiles.map((t) => t.slug))}
          onAdd={handleAddTile}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export { TileGrid as default };
