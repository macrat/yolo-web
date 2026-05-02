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
 * - 移動ボタン（前へ / 後へ / 先頭 / 末尾）を Tile に渡す
 *
 * 永続化経路（#7 統一）:
 * - DnD 中は localTiles state のみ更新（UIプレビュー）。localStorage 書き込みは発生しない。
 * - DnD 確定時（onDragEnd）にのみ onConfigChange を呼んで永続化する（1 回のみ書き込み）。
 * - 移動ボタン・削除・追加も同様に onConfigChange 経由で永続化する。
 * - これにより DnD 中の連続 setState → useToolboxConfig → localStorage 書き込み連鎖が発生しない。
 *
 * 再レンダー連鎖解消（#4）:
 * - DnD 中の中間状態は localTiles（ローカル state）のみで管理する。
 * - configRef で最新 config を useRef で保持し、DnD 中に config prop が変化しても
 *   handleDragOver が古い参照でクロージャを形成しないようにする。
 * - handleDragEnd で onConfigChange（永続化）を 1 回呼ぶ設計。
 *
 * DESIGN.md 準拠:
 * - DESIGN.md §4 参照（ドラッグ規定、cursor 整合、半透明禁止）
 *
 * 経路 B 実装詳細（2.2.3 スパイク確立済み）:
 * - SortableContext の strategy に () => null を渡す（標準変換アニメーション無効化）
 * - onDragOver で arrayMove + findIndex -1 ガード（Issue #1450 振動問題も回避）
 * - DragOverlay でドラッグ元サイズ固定のゴーストを描画（サイズ引き伸ばし Issue #117 回避）
 */

import { useState, useCallback, useEffect, useRef } from "react";
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
   * 設定変更コールバック（永続化経路）。
   * DnD 確定・移動ボタン・削除・追加のたびに呼ばれる。
   * 省略した場合はローカル state のみで管理する（テスト / Storybook 用）。
   */
  onConfigChange?: (newConfig: TileGridConfig) => void;
  /**
   * ToolboxShell の DndContext にイベントハンドラを接続するための関数。
   * ToolboxShell の render props（setDndHandlers）を直接渡す。
   * 省略した場合、DnD 操作は機能しない（使用モード時は自然に省略される）。
   */
  setDndHandlers?: (handlers: ToolboxDndHandlers) => void;
  /**
   * 現在 open 中の overlay の ID。ToolboxShell から render props で受け取る。
   * AddTileModal を開く前にこの値を参照して、他の overlay が開いていれば同時 open を防ぐ（#9）。
   */
  openOverlayId?: string | null;
  /**
   * overlay の open/close を通知する関数。ToolboxShell から render props で受け取る。
   * AddTileModal open 時に "add-tile-modal" を渡し、close 時に null を渡す（#9）。
   */
  setOpenOverlay?: (id: string | null) => void;
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
  openOverlayId,
  setOpenOverlay,
  className,
}: TileGridProps) {
  /**
   * ドラッグ中のタイル slug（DragOverlay 描画用）。
   * null のときはオーバーレイを描画しない。
   */
  const [activeDragSlug, setActiveDragSlug] = useState<string | null>(null);

  /**
   * DnD 中間状態用ローカルタイル配列（#4 再レンダー連鎖解消）。
   * DnD 開始時（handleDragStart）に config.tiles で初期化され、
   * onDragOver で位置プレビュー更新のみに使われる。
   * onDragEnd で onConfigChange を 1 回呼び、その後 activeDragSlug が null になると
   * tilesSource が config.tiles に自動的に切り替わるため同期 useEffect は不要。
   */
  const [localTiles, setLocalTiles] = useState(config.tiles);

  /**
   * 最新 config を ref で保持（DnD 中のクロージャ stale 防止）。
   * handleDragEnd で確定時の onConfigChange に localTiles を渡す際に参照する。
   * useEffect でレンダリング外から更新することで lint エラーを回避する。
   */
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  /** AddTileModal の開閉状態 */
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // DnD イベントハンドラ（経路 B: empty strategy + 自前 onDragOver）
  // ---------------------------------------------------------------------------

  /**
   * ドラッグ開始: activeDragSlug を設定して DragOverlay を描画開始し、
   * localTiles を現在の config.tiles で初期化する（プレビューの開始点を揃える）。
   * configRef 経由で最新の config.tiles を参照することで、
   * 依存配列を空にしたまま stale closure を回避できる。
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragSlug(event.active.id as string);
    setLocalTiles(configRef.current.tiles);
  }, []);

  /**
   * ドラッグ中（onDragOver）: localTiles のみを更新してプレビューを更新する。
   *
   * localTiles は UI プレビュー専用。永続化（onConfigChange）は onDragEnd で行う。
   * これにより DnD 中の setState → localStorage 書き込み連鎖を回避できる（#4 #7）。
   *
   * findIndex が -1 を返すケース（存在しない ID）は早期リターンでガードする（経路 B 必須）。
   * dnd-kit Issue #1450（closestCenter の振動問題）を避けるため、
   * active.id === over.id のときも早期リターンする。
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalTiles((prev) => {
      const oldIndex = prev.findIndex((t) => t.slug === active.id);
      const newIndex = prev.findIndex((t) => t.slug === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((t, i) => ({
        ...t,
        order: i,
      }));
    });
  }, []);

  /**
   * ドラッグ確定（onDragEnd）: activeDragSlug をリセットし、永続化を 1 回実行する（#7）。
   *
   * onDragEnd の時点で localTiles には最終的な並び順が入っている。
   * この localTiles で onConfigChange を呼ぶことで localStorage への書き込みが 1 回だけ行われる。
   */
  const handleDragEnd = useCallback(() => {
    setActiveDragSlug(null);
    // localTiles をキャプチャするためにステートリフトを使う
    setLocalTiles((finalTiles) => {
      onConfigChange?.({
        ...configRef.current,
        tiles: finalTiles,
      });
      return finalTiles; // state は変えない
    });
  }, [onConfigChange]);

  /**
   * setDndHandlers 経由で ToolboxShell の DndContext にイベントハンドラを接続する。
   * handleDragOver は useCallback + setLocalTiles（関数形式）で依存配列が空になり、
   * config 変化に伴う handleDragOver 再生成が発生しない（#4 再レンダー連鎖解消）。
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
  // タイル移動（移動ボタン経由 / #7 永続化経路統一）
  // ---------------------------------------------------------------------------

  /**
   * 指定インデックスのタイルを移動し、onConfigChange（永続化）を呼ぶ。
   * 移動ボタン経由と DnD 経由で同一の onConfigChange を通る（#7 永続化経路統一）。
   */
  const handleMoveTile = useCallback(
    (fromIndex: number, toIndex: number) => {
      const sorted = [...config.tiles].sort((a, b) => a.order - b.order);
      const newTiles = arrayMove(sorted, fromIndex, toIndex).map((t, i) => ({
        ...t,
        order: i,
      }));
      onConfigChange?.({ ...config, tiles: newTiles });
    },
    [config, onConfigChange],
  );

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
      onConfigChange?.({ ...config, tiles: newTiles });
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
      onConfigChange?.({
        ...config,
        tiles: [...config.tiles, newTile],
        // tileableMap に追加したタイルを登録（フィクスチャ経由の場合は既登録のこともある）
        tileableMap: config.tileableMap.has(tileable.slug)
          ? config.tileableMap
          : new Map([...config.tileableMap, [tileable.slug, tileable]]),
      });
      setIsModalOpen(false);
      setOpenOverlay?.(null);
    },
    [config, onConfigChange, setOpenOverlay],
  );

  // ---------------------------------------------------------------------------
  // 表示用タイルリスト（DnD 中は localTiles, それ以外は config.tiles を使用）
  // ---------------------------------------------------------------------------

  /**
   * DnD 中は localTiles（UI プレビュー）を、それ以外は config.tiles を使う。
   * order 順にソートして tileableMap で解決できたものだけを表示する。
   */
  const tilesSource = activeDragSlug ? localTiles : config.tiles;

  const resolvedTiles = [...tilesSource]
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
      {/* グリッドコンテナ（CSS Grid: 4 カラム、小=span1/中=span2/大=span3）
          ブレークポイント別 span は TileGrid.module.css の data-size セレクタが制御 */}
      <div className={rootClass} data-testid="tile-grid" data-mode={mode}>
        {/* SortableContext（経路 B: strategy={() => null}）*/}
        <SortableContext items={sortableIds} strategy={() => null}>
          {/* タイル一覧 */}
          {resolvedTiles.map(({ tileConfig, tileable }, index) => (
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
              isFirst={index === 0}
              isLast={index === resolvedTiles.length - 1}
              onMoveFirst={
                mode === "edit" ? () => handleMoveTile(index, 0) : undefined
              }
              onMovePrev={
                mode === "edit"
                  ? () => handleMoveTile(index, index - 1)
                  : undefined
              }
              onMoveNext={
                mode === "edit"
                  ? () => handleMoveTile(index, index + 1)
                  : undefined
              }
              onMoveLast={
                mode === "edit"
                  ? () => handleMoveTile(index, resolvedTiles.length - 1)
                  : undefined
              }
            />
          ))}

          {/* 編集モード: 末尾に「+ ツールを追加」スロットを表示 */}
          {mode === "edit" && (
            <EmptySlot
              size="medium"
              label="ツールを追加"
              onAdd={() => {
                // 他の overlay が開いている場合は排他制御で開かない（#9）
                if (openOverlayId != null) return;
                setIsModalOpen(true);
                setOpenOverlay?.("add-tile-modal");
              }}
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

      {/* タイル追加モーダル（Portal で document.body 直下に mount、AP-I08）*/}
      {isModalOpen && (
        <AddTileModal
          existingSlugs={new Set(config.tiles.map((t) => t.slug))}
          onAdd={handleAddTile}
          onClose={() => {
            setIsModalOpen(false);
            setOpenOverlay?.(null);
          }}
        />
      )}
    </>
  );
}

export { TileGrid as default };
