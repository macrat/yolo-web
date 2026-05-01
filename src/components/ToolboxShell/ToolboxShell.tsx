"use client";

/**
 * ToolboxShell — 編集モード / 使用モードの 2 モード分離ラッパー
 *
 * 責務:
 *   - mode 状態（"view" | "edit"）を useState で保持
 *   - 「編集」ボタン（使用モード時）/ 「完了」ボタン（編集モード時）の表示切替
 *   - 編集モードへの遷移時に DndContext（PointerSensor + KeyboardSensor）を mount
 *   - 編集モード時のスクロールロック（scroll-lock.ts カウンタ式、AP-I07 準拠）
 *   - children に mode を render props で渡す（Tile コンポーネント #5 が props で受け取る）
 *   - children に DnD イベントハンドラ（dndHandlers）を render props で渡す
 *     → TileGrid（2.2.6）が DndContext の onDragStart/Over/End に接続するために使用する
 *   - focus management（編集/完了ボタンへの自動フォーカス移動）
 *
 * z-index レイヤ（AP-I08 準拠）:
 *   globals.css の --z-tile-overlay / --z-tile / --z-tile-dragging / --z-tile-toolbar を参照。
 *   オーバーレイは position: absolute（.root 基準）でパネル内部限定暗転。
 *   Header / Footer は暗転対象外（NN/g 推奨の「道具箱だけ強調」デザイン）。
 *
 * DndContext の DragOverlay、SortableContext などは外部（2.2.6 の配置 UI）が
 * children 内に持つ。ToolboxShell は DndContext の境界と sensors のみを担う。
 * onDragStart / onDragOver / onDragEnd は dndHandlers render props 経由で children が設定する。
 *
 * 将来 Context 化を検討: mode 以外（drag state / dispatch）が必要になった場合、
 * render props から React.Context に移行する。
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Button from "@/components/Button";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import styles from "./ToolboxShell.module.css";

/** 2 モードの型 */
export type ToolboxMode = "view" | "edit";

/**
 * DnD イベントハンドラの型。
 * children が DndContext の onDrag* に接続するために使用する。
 * 未指定の場合は何も起こらない（省略可能）。
 */
export interface ToolboxDndHandlers {
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

/** children への render props */
export interface ToolboxModeRenderProps {
  mode: ToolboxMode;
  /**
   * DnD イベントハンドラの設定関数。
   * children（TileGrid 等）が DndContext に接続したいイベントハンドラを
   * この関数で登録する。
   * 例:
   *   useEffect(() => {
   *     setDndHandlers({ onDragStart, onDragOver, onDragEnd });
   *   }, [setDndHandlers, onDragStart, onDragOver, onDragEnd]);
   */
  setDndHandlers: (handlers: ToolboxDndHandlers) => void;
}

interface ToolboxShellProps {
  /**
   * render prop パターン。
   * children は関数として mode と setDndHandlers を受け取り、タイル一覧 UI を返す。
   * 例:
   *   <ToolboxShell>
   *     {({ mode, setDndHandlers }) => (
   *       <TileGrid mode={mode} setDndHandlers={setDndHandlers} />
   *     )}
   *   </ToolboxShell>
   */
  children: (props: ToolboxModeRenderProps) => React.ReactNode;
  /** 追加クラス（外側コンテナに適用） */
  className?: string;
}

/**
 * ToolboxShell
 *
 * 編集モード / 使用モードの 2 モード分離ラッパー。
 * 編集モード時のみ DndContext（PointerSensor + KeyboardSensor）を mount し、
 * スクロールをカウンタ式でロックする。
 *
 * children（TileGrid 等）は setDndHandlers で onDragStart/Over/End を登録できる。
 * 登録されたハンドラは DndContext の対応する props に接続される。
 */
function ToolboxShell({ children, className }: ToolboxShellProps) {
  const [mode, setMode] = useState<ToolboxMode>("view");

  /**
   * children が登録する DnD イベントハンドラ。
   * TileGrid（2.2.6）が setDndHandlers 経由でここに登録する。
   * 初期値は空のハンドラ（何もしない）。
   */
  const [dndHandlers, setDndHandlersState] = useState<ToolboxDndHandlers>({});

  /**
   * children に渡す setDndHandlers 関数。
   * useCallback で安定させ、children の不要な再レンダーを防ぐ。
   */
  const setDndHandlers = useCallback((handlers: ToolboxDndHandlers) => {
    setDndHandlersState(handlers);
  }, []);

  /**
   * focus management 用 ref。
   * Button コンポーネントが forwardRef 未対応のため、ツールバーの div に ref を当て、
   * その中の button 要素を querySelector で取得してフォーカスする。
   */
  const toolbarRef = useRef<HTMLDivElement>(null);

  /**
   * dnd-kit sensors:
   * - PointerSensor: マウス / タッチ操作
   * - KeyboardSensor: キーボード操作（Space でドラッグ開始 → 矢印で移動 → Space で確定）
   *
   * 使用モードでは DndContext ごと unmount されるため sensors は発火しない。
   */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /** 編集モード遷移 */
  const enterEditMode = useCallback(() => {
    setMode("edit");
  }, []);

  /** 使用モードへ戻る */
  const exitEditMode = useCallback(() => {
    setMode("view");
  }, []);

  /**
   * 編集モード時のスクロールロック（AP-I07 準拠）。
   * scroll-lock.ts の参照カウンタ式ヘルパを使用。
   * Header のモバイルメニューと同居しても scroll-locked クラスを奪い合わない。
   */
  useEffect(() => {
    if (mode === "edit") {
      acquireScrollLock();
    }
    return () => {
      // mode が "edit" から変化したとき、またはアンマウント時に解放する
      if (mode === "edit") {
        releaseScrollLock();
      }
    };
  }, [mode]);

  /**
   * focus management:
   * - 編集モード遷移後 → ツールバー内の「完了」ボタンにフォーカス
   * - 使用モード復帰後 → ツールバー内の「編集」ボタンにフォーカス
   *
   * isFirstRender ガード: useEffect([mode]) は依存配列が変化しなくても初回マウント時に
   * 必ず一度発火する。ガードなしだとページ訪問直後に「編集」ボタンへフォーカスが移動し、
   * スクロールジャンプ・スクリーンリーダー読み上げ順序破壊・Tab 順序破壊が発生する。
   * ref を使うことで再レンダー時にリセットされない（state は再レンダーを誘発するため不適）。
   *
   * Button が forwardRef 未対応のため querySelector でツールバー内の button を取得する。
   */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const btn = toolbarRef.current?.querySelector<HTMLButtonElement>("button");
    btn?.focus();
  }, [mode]);

  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass} data-testid="toolbox-shell" data-mode={mode}>
      {/* ツールバー: 編集/完了ボタン（z-index: --z-tile-toolbar で最前面）
          ref はフォーカス管理のために div に付ける（Button は forwardRef 未対応） */}
      <div ref={toolbarRef} className={styles.toolbar}>
        {/* aria-live 領域: 常に DOM に存在させることで一部スクリーンリーダーによる
            初回挿入アナウンスの欠落を防ぐ。テキストの変化でアナウンスを誘発する。 */}
        <span
          className={styles.editingLabel}
          aria-live="polite"
          role="status"
          aria-atomic="true"
        >
          {mode === "edit" ? "編集中" : ""}
        </span>
        {mode === "view" ? (
          <Button
            variant="default"
            onClick={enterEditMode}
            aria-label="道具箱を編集モードにする"
          >
            編集
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={exitEditMode}
            aria-label="編集を完了して使用モードに戻る"
          >
            完了
          </Button>
        )}
      </div>

      {/* 編集モードオーバーレイ（position: absolute、パネル内部限定暗転、AP-I08 準拠） */}
      {mode === "edit" && <div className={styles.overlay} aria-hidden="true" />}

      {/*
       * 編集モード時のみ DndContext を mount する。
       * 使用モードでは DndContext ごと unmount することで dnd-kit の keyboard sensor が
       * 発火しなくなり、タイル内の通常クリック操作も阻害されない。
       *
       * sensors には PointerSensor + KeyboardSensor を登録済み。
       * DragOverlay / SortableContext は children 内（2.2.6 の配置 UI）が持つ。
       */}
      {mode === "edit" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={dndHandlers.onDragStart}
          onDragOver={dndHandlers.onDragOver}
          onDragEnd={dndHandlers.onDragEnd}
        >
          <div className={styles.tilesContainer}>
            {children({ mode, setDndHandlers })}
          </div>
        </DndContext>
      ) : (
        <div className={styles.tilesContainer}>
          {children({ mode, setDndHandlers })}
        </div>
      )}
    </div>
  );
}

export default ToolboxShell;
