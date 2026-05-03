"use client";

/**
 * ToolboxShell — ダッシュボード道具箱の外殻コンポーネント。
 *
 * 責務:
 * - Edit / Done モード分離（Edit ボタン 1 タップで即遷移、cycle-175 の 4 ステップ儀式を採用しない）
 * - 編集状態の視覚的シグナル（DESIGN.md §4 規約遵守: box-shadow のみ、opacity/揺れアニメ不採用）
 * - タイル削除時の Undo バナー管理（前提 B-Undo: 数秒程度の Undo 期間 → 期間経過後にデータ確定）
 * - TileGrid を render props（children as function）で受け取る
 *
 * ⚠️ **SSR 禁止 / dynamic ssr:false 必須**
 *
 * このコンポーネントは内部で `useToolboxConfig()` を呼んでいます。
 * `useToolboxConfig()` は `getServerSnapshot` で固定値を返すため、
 * このコンポーネントを使うページ / 親コンポーネントは必ず
 * `dynamic({ ssr: false })` で動的インポートしてください。
 *
 * refs: docs/knowledge/dnd-kit.md（hydration mismatch + dynamic ssr:false の知見）
 * refs: B-4 契約（useToolboxConfig の暗黙契約の明示化）
 *
 * 正しい使用例:
 * ```tsx
 * // page.tsx または親コンポーネント
 * const ToolboxClient = dynamic(() => import("./ToolboxClient"), { ssr: false });
 * // ToolboxClient.tsx 内で <ToolboxShell> を使う
 * ```
 *
 * @example
 * ```tsx
 * <ToolboxShell>
 *   {({ isEditing, tiles, onDelete }) => (
 *     <TileGrid tiles={tiles} isEditing={isEditing} onDelete={onDelete} />
 *   )}
 * </ToolboxShell>
 * ```
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useToolboxConfig } from "./useToolboxConfig";
import type { TileLayoutEntry } from "./storage";
import styles from "./ToolboxShell.module.css";

// ---------------------------------------------------------------------------
// 定数
// ---------------------------------------------------------------------------

/**
 * UNDO_DURATION_MS — Undo 期間（ミリ秒）。
 *
 * 前提 B-Undo: 数秒程度の Undo 期間。
 * docs/research/2026-05-03-dashboard-toolbox-individual-ux-deep-dive.md より、
 * Trello / iOS 27 等の事例を踏まえ 5 秒を採用。
 * 長すぎず短すぎず、誤操作に気づいて Undo を押せる余裕がある期間。
 */
const UNDO_DURATION_MS = 5000;

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

/**
 * ToolboxShellRenderProps — children 関数に渡される props。
 *
 * ToolboxShell は render props パターンで TileGrid を受け取る。
 * TileGrid は ToolboxShell から isEditing / tiles / onDelete を受け取り、
 * 独自の DnD ロジックを実装する（ToolboxShell は DnD を直接扱わない）。
 */
export interface ToolboxShellRenderProps {
  /** 現在の編集モード状態 */
  isEditing: boolean;
  /** Undo 期間中の表示用タイル配列（削除済みタイルを除いた中間状態） */
  tiles: TileLayoutEntry[];
  /**
   * タイル削除コールバック。
   * slug を指定して削除する（単一削除のみ、前提 B-単一削除）。
   * 削除は即座に tiles から除外されるが、localStorage への書き込みは
   * Undo 期間経過後まで遅延される（前提 B-Undo）。
   */
  onDelete: (slug: string) => void;
}

/**
 * ToolboxShell の props。
 */
export interface ToolboxShellProps {
  /**
   * render props として TileGrid（または任意の子コンポーネント）を受け取る。
   * ToolboxShell は DnD を直接扱わず、TileGrid に isEditing / tiles / onDelete を渡す。
   */
  children: (props: ToolboxShellRenderProps) => React.ReactNode;
  /** 追加 CSS クラス */
  className?: string;
}

// ---------------------------------------------------------------------------
// Undo 状態の型定義
// ---------------------------------------------------------------------------

/**
 * PendingDeletion — Undo 期間中の削除保留状態。
 *
 * 削除直後から期間経過まで、削除前の tiles を保持する。
 * Undo を押すとこの状態に戻る。
 * 期間経過後は setTiles を呼んで localStorage に書き込む（確定）。
 */
interface PendingDeletion {
  /** 削除前の tiles（Undo 時にこれを使用する） */
  tilesBeforeDeletion: TileLayoutEntry[];
  /** 削除後の tiles（確定時に setTiles に渡す） */
  tilesAfterDeletion: TileLayoutEntry[];
  /** 削除された slug（バナーに表示するために保持） */
  deletedSlug: string;
}

// ---------------------------------------------------------------------------
// ToolboxShell コンポーネント本体
// ---------------------------------------------------------------------------

/**
 * ToolboxShell — 道具箱外殻コンポーネント。
 *
 * Edit / Done モード分離・Undo バナー・TileGrid の render props 受け取りを担う。
 * ToolboxShell 自身は DnD を直接扱わず、children に isEditing / tiles / onDelete を渡す。
 *
 * ⚠️ SSR 禁止: このコンポーネントを使う親は `dynamic({ ssr: false })` でインポートすること。
 * refs: B-4 契約（useToolboxConfig の暗黙契約の明示化 / docs/knowledge/dnd-kit.md）
 */
export function ToolboxShell({ children, className }: ToolboxShellProps) {
  // ---------------------------------------------------------------------------
  // ストア（useToolboxConfig）
  // ---------------------------------------------------------------------------

  // useToolboxConfig は SSR 環境で throw する（B-4 契約）。
  // このコンポーネントを使う親が dynamic({ ssr: false }) でインポートしていれば
  // SSR 環境では呼ばれないため、ここでは追加ガードを設けない。
  const { tiles, setTiles } = useToolboxConfig();

  // ---------------------------------------------------------------------------
  // 編集モード状態
  // ---------------------------------------------------------------------------

  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleDoneClick = useCallback(() => {
    setIsEditing(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Undo 状態
  // ---------------------------------------------------------------------------

  /** Undo 期間中の削除保留状態。null のときはバナー非表示。 */
  const [pendingDeletion, setPendingDeletion] =
    useState<PendingDeletion | null>(null);

  /** Undo タイマーの参照（クリア用） */
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Undo タイマーをクリアするヘルパー。
   * 新しい削除が来たとき / Undo が押されたときに前のタイマーを破棄する。
   */
  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current !== null) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  /**
   * コンポーネントのアンマウント時に確定タイマーをクリアする。
   * 期間中にアンマウントされた場合でもメモリリークを防ぐ。
   */
  useEffect(() => {
    return () => {
      clearUndoTimer();
    };
  }, [clearUndoTimer]);

  // ---------------------------------------------------------------------------
  // 削除ハンドラ
  // ---------------------------------------------------------------------------

  /**
   * onDelete — タイルを削除する。
   *
   * 1. 削除前の tiles を保持して pendingDeletion を設定する
   * 2. tiles から削除済みタイルを除外（UI に即時反映）
   * 3. UNDO_DURATION_MS 後に setTiles を呼んで localStorage に書き込む（確定）
   *
   * 前提 B-単一削除: 単一削除のみ対応。
   * 前提 B-Undo: 確認ダイアログなし、Undo バナー方式。
   */
  const onDelete = useCallback(
    (slug: string) => {
      // 現在の tiles を参照（useToolboxConfig の tiles は Undo 期間中でも「確定前」の値）
      // 削除前の状態（Undo 用）
      const tilesBeforeDeletion = tiles;
      // 削除後の状態（表示 + 確定時保存用）
      const tilesAfterDeletion = tiles.filter((t) => t.slug !== slug);

      // 前の Undo タイマーがあればクリア（複数削除の保護）
      clearUndoTimer();

      // Undo 保留状態を設定（バナー表示）
      setPendingDeletion({
        tilesBeforeDeletion,
        tilesAfterDeletion,
        deletedSlug: slug,
      });

      // UNDO_DURATION_MS 後に確定（localStorage への書き込み）
      undoTimerRef.current = setTimeout(() => {
        setTiles(tilesAfterDeletion);
        setPendingDeletion(null);
        undoTimerRef.current = null;
      }, UNDO_DURATION_MS);
    },
    [tiles, setTiles, clearUndoTimer],
  );

  // ---------------------------------------------------------------------------
  // Undo ハンドラ
  // ---------------------------------------------------------------------------

  /**
   * handleUndo — Undo を実行する。
   *
   * 1. 確定タイマーをクリア（localStorage への書き込みをキャンセル）
   * 2. pendingDeletion を null に戻す（バナー消去、tiles を削除前に戻す）
   *
   * setTiles は呼ばない（localStorage 書き込みなし）。
   */
  const handleUndo = useCallback(() => {
    clearUndoTimer();
    setPendingDeletion(null);
  }, [clearUndoTimer]);

  // ---------------------------------------------------------------------------
  // render props に渡す tiles の計算
  // ---------------------------------------------------------------------------

  /**
   * 表示用 tiles。
   * Undo 期間中は pendingDeletion.tilesAfterDeletion を使う（削除済みタイルを除外）。
   * 確定後 / 非削除中は useToolboxConfig の tiles をそのまま使う。
   */
  const displayTiles =
    pendingDeletion !== null ? pendingDeletion.tilesAfterDeletion : tiles;

  // ---------------------------------------------------------------------------
  // レンダリング
  // ---------------------------------------------------------------------------

  const containerClassName = [
    styles.container,
    isEditing ? styles.containerEditing : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName} data-editing={String(isEditing)}>
      {/* ツールバー: Edit / Done ボタン */}
      <div className={styles.toolbar}>
        {isEditing ? (
          <button
            className={styles.doneButton}
            onClick={handleDoneClick}
            type="button"
          >
            Done
          </button>
        ) : (
          <button
            className={styles.editButton}
            onClick={handleEditClick}
            type="button"
          >
            Edit
          </button>
        )}
      </div>

      {/* Undo バナー */}
      {pendingDeletion !== null && (
        <div
          className={styles.undoBanner}
          data-testid="undo-banner"
          role="status"
          aria-live="polite"
        >
          <span className={styles.undoBannerMessage}>タイルを削除しました</span>
          <button
            className={styles.undoButton}
            onClick={handleUndo}
            type="button"
          >
            Undo
          </button>
        </div>
      )}

      {/* TileGrid（render props）*/}
      <div className={styles.content}>
        {/* eslint-disable-next-line react-hooks/refs -- onDelete は useCallback でメモ化済み。
            ref アクセスは clearUndoTimer (useCallback) 内のみで render 中の直接アクセスではない。
            ESLint の react-hooks/refs が children 関数呼び出しを render として扱う false positive。 */}
        {children({
          isEditing,
          tiles: displayTiles,
          onDelete,
        })}
      </div>
    </div>
  );
}
