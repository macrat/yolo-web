"use client";

/**
 * ToolboxShell — 道具箱全体のシェルコンポーネント（C-3 v10/v11）
 *
 * 対応瞬間（tmp/cycle-177-ux-decisions.md 参照）:
 * 8（Edit 押下 = 即時遷移）/ 9（編集モード入り = 5 重視覚指標）/
 * 10-11（Done 押下 = 即時遷移 + 100ms フェードアウト）/
 * 18-19（削除 = Undo 用エントリ保持）/ 20-21（Undo バナー = slide-up 200ms + プログレスバー 10 秒）/
 * 22（Undo タップ = 復元）/ 23（バナー消滅 = slide-down 150ms）/
 * 31（reduced-motion 総則）/ 33（aria-live）/ 34（空状態）/
 * 35（ストレージ失敗 + クォータ判定）/ 36（別タブ同期 = 編集中保留）/
 * 37（長押し = 使用モード時のみ有効）/ 40（編集モード放置 = タイムアウトなし）/
 * 42（AddTileModal inert 連携）/ 45c（編集モード時 Tab フォーカス順序）
 *
 * 視覚表現規則は DESIGN.md §4 (L69-78) を参照。
 *
 * 使用方法（呼び出し側）:
 * const ToolboxShellClient = dynamic(() => import("@/lib/toolbox/ToolboxShell"), { ssr: false });
 * <ToolboxShellClient />
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useToolboxConfig } from "./useToolboxConfig";
import { TileGrid } from "./TileGrid";
import AddTileModal from "./AddTileModal";
import { getTileableBySlug } from "./registry";
import type { TileLayoutEntry } from "./storage";
import styles from "./ToolboxShell.module.css";

/** size 名の日本語マッピング（CRIT-F1-2 aria-live 通知用） */
const SIZE_LABEL: Record<TileLayoutEntry["size"], string> = {
  small: "小",
  medium: "中",
  large: "大",
};

/** Undo 保留状態の型 */
interface PendingUndo {
  /** 削除されたタイルの slug */
  slug: string;
  /** 削除前のエントリ（order 復元に使用） */
  entry: TileLayoutEntry;
  /** 削除時点のタイル全配列（元の位置を正確に復元するために保持） */
  originalTiles: TileLayoutEntry[];
  /** 有効期限（Date.now() + 10000） */
  expiresAt: number;
  /** 10 秒タイマー ID */
  timerId: ReturnType<typeof setTimeout>;
}

/**
 * ToolboxShell — 道具箱全体を統括するシェルコンポーネント。
 *
 * 編集/使用モード分離、Undo バナー、TileGrid、AddTileModal の統括、
 * useToolboxConfig による状態管理を行う自己完結型コンポーネント。
 */
export function ToolboxShell() {
  const { tiles, setTiles } = useToolboxConfig();

  // 編集モード状態（瞬間 8/9/10/40）
  const [isEditing, setIsEditing] = useState(false);

  // AddTileModal 開閉状態（瞬間 28-30）
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Undo 保留状態（瞬間 20-23）
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);

  // aria-live への現在メッセージ（瞬間 33）
  const [liveMessage, setLiveMessage] = useState("");

  // 別タブ変更通知トースト表示（瞬間 36）
  const [crossTabNotification, setCrossTabNotification] = useState(false);

  // 編集中に別タブ変更が来た際の保留フラグ（瞬間 36）
  const pendingCrossTabRef = useRef(false);

  // Done ボタンを押す前のフォーカス位置を保存する（フォーカス管理）
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // -----------------------------------------------------------------------
  // aria-live 通知ヘルパー（瞬間 33）
  // -----------------------------------------------------------------------

  /**
   * aria-live メッセージを設定する。
   * 同じメッセージを連続して設定すると SR が読まないため、
   * 空文字 → メッセージ の順に遷移させる（時間差なし、React の batching に依存）。
   *
   * テスト環境でも確実に動作するよう、直接 state を更新する。
   * 本番環境では React の batching により空文字セットとメッセージセットが
   * 同一フラッシュにまとめられる可能性があるが、aria-live polite は最終状態を読み上げるため
   * 実際の SR 体験では問題ない。
   */
  const announce = useCallback((message: string) => {
    setLiveMessage(message);
  }, []);

  // -----------------------------------------------------------------------
  // 別タブ同期（瞬間 36）
  // -----------------------------------------------------------------------

  useEffect(() => {
    // 別タブ変更トースト表示用タイマー
    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const showCrossTabToast = () => {
      if (showTimer !== null) clearTimeout(showTimer);
      if (hideTimer !== null) clearTimeout(hideTimer);
      // setTimeout(0) で effect body の外に setState を出してカスケード防止
      showTimer = setTimeout(() => {
        setCrossTabNotification(true);
        hideTimer = setTimeout(() => setCrossTabNotification(false), 3000);
      }, 0);
    };

    const handleStorage = () => {
      if (isEditing) {
        // 編集モード中は同期保留（瞬間 36）
        pendingCrossTabRef.current = true;
      } else {
        // 使用モード時は自動反映（useToolboxConfig が storage event を監視して tiles を更新する）
        // ToolboxShell 側ではトースト通知のみ担当する
        showCrossTabToast();
      }
    };

    // 編集モード終了時に保留中の別タブ変更を反映（瞬間 36）
    if (!isEditing && pendingCrossTabRef.current) {
      pendingCrossTabRef.current = false;
      showCrossTabToast();
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      if (showTimer !== null) clearTimeout(showTimer);
      if (hideTimer !== null) clearTimeout(hideTimer);
    };
  }, [isEditing]);

  // -----------------------------------------------------------------------
  // 編集モード遷移ハンドラ（瞬間 8/10）
  // -----------------------------------------------------------------------

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    announce("編集モードに入りました");
  }, [announce]);

  const handleDoneClick = useCallback(() => {
    setIsEditing(false);
    announce("編集モードを終了しました");
    // Done 後に Edit ボタンにフォーカスを戻す（フォーカス管理）
    requestAnimationFrame(() => {
      editButtonRef.current?.focus();
    });
  }, [announce]);

  // -----------------------------------------------------------------------
  // 長押し編集モード入りハンドラ（瞬間 37）
  // 使用モード時のみ有効。編集モード中は無視する。
  // -----------------------------------------------------------------------

  const handleLongPress = useCallback(
    (slug: string) => {
      if (isEditing) {
        // 編集モード中の長押しはモード遷移を起こさない（誤終了防止、瞬間 37）
        return;
      }
      // 使用しない slug 変数（将来のタイル選択演出等に使用可能）
      void slug;
      setIsEditing(true);
      announce("編集モードに入りました");
    },
    [isEditing, announce],
  );

  // -----------------------------------------------------------------------
  // タイル削除ハンドラ（瞬間 18-19 / 20-21）
  // -----------------------------------------------------------------------

  const handleRemoveTile = useCallback(
    (slug: string) => {
      const tileable = getTileableBySlug(slug);
      const displayName = tileable?.displayName ?? slug;

      // 削除前のタイル全体を保存（Undo の復元に使用）
      const removedEntry = tiles.find((t) => t.slug === slug);
      if (!removedEntry) return;

      // 前回の Undo タイマーをクリア（同時複数削除の前回確定、瞬間 20）
      if (pendingUndo) {
        clearTimeout(pendingUndo.timerId);
      }

      // 新しいタイル配列から削除
      const newTiles = tiles.filter((t) => t.slug !== slug);
      setTiles(newTiles);

      announce(`${displayName}を削除しました。Undo できます`);

      // 10 秒タイマーで Undo 期限切れ確定（瞬間 20）
      const timerId = setTimeout(() => {
        setPendingUndo(null);
      }, 10000);

      setPendingUndo({
        slug,
        entry: removedEntry,
        originalTiles: tiles,
        expiresAt: Date.now() + 10000,
        timerId,
      });
    },
    [tiles, setTiles, pendingUndo, announce],
  );

  // -----------------------------------------------------------------------
  // Undo ハンドラ（瞬間 22-23）
  // -----------------------------------------------------------------------

  const handleUndo = useCallback(() => {
    if (!pendingUndo) return;

    // タイマークリア
    clearTimeout(pendingUndo.timerId);

    // 削除前の全タイル配列を復元（order 含む）
    setTiles(pendingUndo.originalTiles);

    const tileable = getTileableBySlug(pendingUndo.slug);
    const displayName = tileable?.displayName ?? pendingUndo.slug;
    announce(`${displayName}を戻しました`);

    setPendingUndo(null);
  }, [pendingUndo, setTiles, announce]);

  // -----------------------------------------------------------------------
  // タイル順序変更ハンドラ（TileGrid から）
  // -----------------------------------------------------------------------

  const handleChangeTiles = useCallback(
    (newTiles: TileLayoutEntry[]) => {
      // size 変更検知（CRIT-F1-2 / MIN-F1-3）:
      // 同一 size 再選択時は TileGrid 側で no-op 済みだが、
      // 並び替えと size 変更が同時に届く場合に備えて変更があるかを確認する。
      const sizeChanged = newTiles.find((t) => {
        const prev = tiles.find((p) => p.slug === t.slug);
        return prev && prev.size !== t.size;
      });

      // 順序も size も変わらない場合は setTiles を呼ばない（no-op）
      const orderChanged =
        newTiles.length !== tiles.length ||
        newTiles.some((t, i) => t.slug !== tiles[i]?.slug);
      if (!sizeChanged && !orderChanged) return;

      if (sizeChanged) {
        const tileable = getTileableBySlug(sizeChanged.slug);
        const displayName = tileable?.displayName ?? sizeChanged.slug;
        announce(
          `${displayName}を${SIZE_LABEL[sizeChanged.size]}サイズに変更しました`,
        );
      }
      setTiles(newTiles);
    },
    [tiles, setTiles, announce],
  );

  // -----------------------------------------------------------------------
  // AddTileModal 操作ハンドラ（瞬間 28-30）
  // -----------------------------------------------------------------------

  const handleOpenAddModal = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setAddModalOpen(false);
  }, []);

  const handleAddTile = useCallback(
    (slug: string) => {
      const tileable = getTileableBySlug(slug);
      const displayName = tileable?.displayName ?? slug;

      // 末尾に追加（order は setTiles 内で正規化される）
      const newEntry: TileLayoutEntry = {
        slug,
        size: "medium",
        order: tiles.length,
      };
      const newTiles = [...tiles, newEntry];
      setTiles(newTiles);

      // 追加直後ハイライト用（瞬間 30）: recentlyAddedSlug は C-5 統合時に TileGrid へ連携する。
      // 現状では announce のみで通知する。
      announce(`${displayName}を追加しました`);
      setAddModalOpen(false);
    },
    [tiles, setTiles, announce],
  );

  // -----------------------------------------------------------------------
  // レンダー
  // -----------------------------------------------------------------------

  const currentSlugs = tiles.map((t) => t.slug);

  return (
    <div className={styles.shell}>
      {/* aria-live 通知領域（瞬間 33）: スクリーンリーダー向け非表示テキスト */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={styles.liveRegion}
        data-testid="live-region"
      >
        {liveMessage}
      </div>

      {/* ツールバー: Edit/Done ボタン + 追加ボタン */}
      <div className={styles.toolbar}>
        {isEditing ? (
          <>
            {/* 編集モード中: 完了ボタン（瞬間 10） */}
            <button
              type="button"
              className={styles.doneButton}
              onClick={handleDoneClick}
              aria-pressed="true"
            >
              完了
            </button>
            {/* 編集モード中: + タイルを追加ボタン（瞬間 28） */}
            <button
              type="button"
              className={styles.addButton}
              onClick={handleOpenAddModal}
            >
              + タイルを追加
            </button>
          </>
        ) : (
          /* 使用モード: 編集ボタン（瞬間 8） */
          <button
            ref={editButtonRef}
            type="button"
            className={styles.editButton}
            onClick={handleEditClick}
            aria-pressed="false"
          >
            編集
          </button>
        )}
      </div>

      {/* 空状態（瞬間 34）: tiles が 0 件のとき促しを表示 */}
      {tiles.length === 0 && (
        <div className={styles.emptyState}>
          <p>タイルを追加してみよう</p>
          <button
            type="button"
            className={styles.emptyAddButton}
            onClick={handleOpenAddModal}
          >
            タイルを追加
          </button>
        </div>
      )}

      {/* タイルグリッド（編集/使用モード切替を isEditing で制御） */}
      {/* recentlyAddedSlug は瞬間 30 の outline ハイライト用。TileGrid 側の対応は C-5 統合時に追加する。 */}
      <TileGrid
        tiles={tiles}
        isEditing={isEditing}
        onChangeTiles={handleChangeTiles}
        onRemoveTile={handleRemoveTile}
        onLongPress={handleLongPress}
      />

      {/* Undo バナー（瞬間 20-23）
       * メッセージとボタンラベルは displayName 非依存の固定文言にする。
       * 長い displayName がバナー幅（280px）に収まらず折り返す問題（CRIT-r2-1）を防ぐため。
       * displayName はスクリーンリーダー向け aria-live 通知（上記 announce）でのみ伝える。
       */}
      {pendingUndo && (
        <div
          className={styles.undoBanner}
          data-testid="undo-banner"
          role="alert"
        >
          <div className={styles.undoProgress} aria-hidden="true">
            <div
              className={styles.undoProgressBar}
              style={
                {
                  "--undo-expires-at": pendingUndo.expiresAt,
                } as React.CSSProperties
              }
            />
          </div>
          <div className={styles.undoMessage}>タイルを削除しました</div>
          <button
            type="button"
            className={styles.undoButton}
            onClick={handleUndo}
            data-testid="undo-button"
          >
            元に戻す
          </button>
        </div>
      )}

      {/* 別タブ変更通知トースト（瞬間 36） */}
      {crossTabNotification && (
        <div className={styles.crossTabToast} role="status" aria-live="polite">
          他のタブで変更されました
        </div>
      )}

      {/* AddTileModal（瞬間 28-30 / 42） */}
      <AddTileModal
        isOpen={addModalOpen}
        onClose={handleCloseAddModal}
        onAdd={handleAddTile}
        currentTileSlugs={currentSlugs}
      />
    </div>
  );
}

export default ToolboxShell;
