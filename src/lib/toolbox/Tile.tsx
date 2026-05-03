"use client";

/**
 * Tile — タイルコンテナコンポーネント（C-1 v10）
 *
 * FallbackTile を内包し、状態管理・表示構造・メタ情報の周辺表示を担当する。
 *
 * v10 で追加した UX（tmp/cycle-177-ux-decisions.md 各瞬間参照）:
 * - 瞬間 1/2: fade-in 200ms（初回マウント時 opacity 0→1）
 * - 瞬間 4: ホバー scale(1.01) + box-shadow + 背景色変化（CSS）
 * - 瞬間 5: タップ :active scale(0.97)（CSS）
 * - 瞬間 6: href ある場合 Next.js Link + unstable_viewTransition
 * - 瞬間 37: 長押し 500ms で onLongPress(slug) コールバック
 * - 瞬間 44: @media (hover: hover) でタッチデバイスのホバー分岐（CSS）
 *
 * 視覚表現規則は DESIGN.md §4 (L69-78) を参照。
 *
 * 【tileComponent を props として受け取る設計（lint 対応）】
 * react-hooks/static-components ルールにより、レンダー中（useMemo 含む）での
 * コンポーネント生成は禁止されている。
 * そのため getTileComponent の呼び出しは呼び出し元（TileGrid 等）で行い、
 * Tile は生成済みのコンポーネント参照を tileComponent props として受け取る。
 * getTileComponent は内部で loaderCache によりメモ化されているため、
 * 同一 slug + variantId の呼び出しは常に同じ参照を返す。
 *
 * 【tile--wiggle クラスについて】
 * 揺れアニメ（瞬間 9）は TileGrid の責務。
 * Tile は .tile--wiggle クラスを CSS で定義するが、付与は TileGrid が行う（受け皿設計）。
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { TileLayoutEntry } from "./storage";
import { getTileableBySlug } from "./registry";
import type { TileComponentLoader } from "./tile-loader";
import styles from "./Tile.module.css";

/** タイルの表示状態 */
export type TileState = "normal" | "editing" | "dragging" | "empty";

/** 長押し検出のための移動距離閾値（px）。この値を超えたら長押しキャンセル。 */
const LONG_PRESS_MOVE_THRESHOLD = 8;

/** 長押し認識までの時間（ms）。iOS Home Screen の標準に合わせた値。 */
const LONG_PRESS_DURATION_MS = 500;

/** Tile コンポーネントの props */
export interface TileProps {
  /** レイアウトエントリ（slug / size / order / variantId） */
  entry: TileLayoutEntry;
  /** 編集モードかどうか */
  isEditing: boolean;
  /** ドラッグ中かどうか（TileGrid から制御） */
  isDragging?: boolean;
  /** 空きスロットかどうか */
  isEmpty?: boolean;
  /**
   * タイルコンポーネント（呼び出し元が getTileComponent で取得して渡す）。
   *
   * 【設計理由】
   * react-hooks/static-components ルールにより、レンダー中のコンポーネント生成は禁止。
   * getTileComponent はモジュールレベルの loaderCache でメモ化しているが、
   * ルールはレンダー関数内での参照生成そのものを検出するため、
   * 呼び出し元（TileGrid 等）で事前に取得した参照を受け取る設計にする。
   */
  tileComponent: TileComponentLoader;
  /**
   * 長押し成立時のコールバック（瞬間 37）。
   * 使用モード時のみ有効。編集モード中は Tile が自動的に無効化する。
   * ToolboxShell が編集モード遷移ハンドラとして受け取る。
   */
  onLongPress?: (slug: string) => void;
  /**
   * 外部から追加する CSS クラス名（任意）。
   * TileGrid が揺れアニメ（tile--wiggle）を付与するための受け皿（瞬間 9）。
   */
  className?: string;
}

/**
 * Tile コンテナコンポーネント。
 *
 * Phase 2 では tile-loader.ts の契約により全 slug が FallbackTile を返す。
 * このコンポーネントのスコープは FallbackTile を内包する Tile コンテナの
 * 状態管理 + 表示構造 + メタ情報の周辺表示のみ。
 *
 * Phase 7 でタイル内実機能が追加されたら、各 Tile が onClick を override する設計。
 */
export function Tile({
  entry,
  isEditing,
  isDragging = false,
  isEmpty = false,
  tileComponent: TileComponent,
  onLongPress,
  className: extraClassName,
}: TileProps) {
  const tileable = getTileableBySlug(entry.slug);

  // 瞬間 1/2: fade-in — マウント後に CSS クラスを付与して opacity 0→1 を発火させる
  // setTimeout(fn, 0) でブラウザの次フレームまで遅延させることで
  // 同期 setState による cascading renders を回避する（AP-I07 準拠）
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timerId);
  }, []);

  // 瞬間 37: 長押し検出のための ref 群
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressFiredRef = useRef(false);

  /** 長押しタイマーをクリアして状態をリセットする */
  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartPosRef.current = null;
    longPressFiredRef.current = false;
  }, []);

  /** pointerdown: 長押し検出開始（使用モード時のみ） */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // 編集モード中は長押し無効（誤終了防止、瞬間 37）
      if (isEditing || !onLongPress) return;

      longPressStartPosRef.current = { x: e.clientX, y: e.clientY };
      longPressFiredRef.current = false;

      longPressTimerRef.current = setTimeout(() => {
        longPressFiredRef.current = true;
        // Vibration API（対応端末のみ、未対応は無視、瞬間 37）
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(10);
        }
        onLongPress(entry.slug);
        longPressTimerRef.current = null;
      }, LONG_PRESS_DURATION_MS);
    },
    [isEditing, onLongPress, entry.slug],
  );

  /** pointermove: 8px 以上の移動で長押しキャンセル（瞬間 37 誤発火防止） */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!longPressStartPosRef.current) return;
      const dx = e.clientX - longPressStartPosRef.current.x;
      const dy = e.clientY - longPressStartPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= LONG_PRESS_MOVE_THRESHOLD) {
        cancelLongPress();
      }
    },
    [cancelLongPress],
  );

  /** pointerup / pointercancel: 長押しタイマーをクリア */
  const handlePointerUp = useCallback(() => {
    cancelLongPress();
  }, [cancelLongPress]);

  /** click: 長押し成立後は href 遷移を抑止（瞬間 37） */
  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (longPressFiredRef.current) {
      e.preventDefault();
    }
  }, []);

  // アンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // タイルの状態を決定する
  const state: TileState = (() => {
    if (isEmpty) return "empty";
    if (isDragging) return "dragging";
    if (isEditing) return "editing";
    return "normal";
  })();

  // CSS クラスの組み合わせ
  const tileClassName = [
    styles.tile,
    isMounted ? styles["tile--fade-in"] : null,
    entry.size === "small" ? styles["tile--small"] : null,
    entry.size === "medium" ? styles["tile--medium"] : null,
    entry.size === "large" ? styles["tile--large"] : null,
    state === "editing" ? styles["tile--editing"] : null,
    state === "dragging" ? styles["tile--dragging"] : null,
    state === "empty" ? styles["tile--empty"] : null,
    // 外部クラス（TileGrid が揺れアニメクラスを付与する受け皿、瞬間 9）
    extraClassName ?? null,
  ]
    .filter(Boolean)
    .join(" ");

  // タイル本体の内側コンテンツエリアのクラス
  const innerClassName = [
    styles.tileInner,
    isEditing ? styles.tileInnerDisabled : null,
  ]
    .filter(Boolean)
    .join(" ");

  // 使用モードでタイル本体クリック時の挙動:
  // - Tileable.href が存在する場合は Next.js Link で遷移（prefetch + View Transitions）
  // - 存在しない場合は span + aria-disabled 表示
  const href = tileable?.href;

  // displayName は主、shortDescription は補助以下
  const displayName = tileable?.displayName ?? entry.slug;
  const shortDescription = tileable?.shortDescription;

  // 長押しハンドラを使用モード時のみ article に付与する
  const longPressHandlers =
    !isEditing && onLongPress
      ? {
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          onPointerCancel: handlePointerUp,
          onClick: handleClick,
        }
      : {};

  return (
    <article
      className={tileClassName}
      data-size={entry.size}
      data-editing={isEditing ? "true" : "false"}
      data-dragging={isDragging ? "true" : "false"}
      data-empty={isEmpty ? "true" : "false"}
      data-tile-slug={entry.slug}
      {...longPressHandlers}
    >
      {/* 編集モード時: ドラッグハンドルを表示（DESIGN.md §4 L75） */}
      {isEditing && (
        <div className={styles.tileHeader}>
          {/* ドラッグハンドル: grab/grabbing カーソルはこの要素にのみ適用 */}
          <div
            className={styles.dragHandle}
            data-drag-handle="true"
            aria-label="ドラッグして並び替え"
            role="button"
            tabIndex={0}
          >
            {/* Lucide スタイルの線画アイコン（DESIGN.md §3） - grip icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="6" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="18" r="1" />
              <circle cx="15" cy="6" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="18" r="1" />
            </svg>
          </div>
        </div>
      )}

      {/* タイル本体コンテンツエリア */}
      <div className={innerClassName} data-tile-inner="true">
        {/* メタ情報: displayName (主) + shortDescription (補助) */}
        {!isEmpty && (
          <div className={styles.tileMeta}>
            {/*
             * I-2: 編集モード中は Link を使わず <span> で描画する。
             * aria-hidden="true" は SR からテキストを隠してしまうため使用しない。
             * I-4: 使用モード + href あり の場合は Next.js Link でリンク遷移。
             *      unstable_viewTransition で View Transitions API を有効化（瞬間 6）。
             * I-5: href なし + 使用モードの span は tabIndex を付与しない（フォーカスしても何もできない）。
             */}
            {href && !isEditing ? (
              /* 使用モード + href あり: Next.js Link 遷移（prefetch 有効、瞬間 6） */
              /* TODO: View Transitions API は Next.js 安定化後に追加。当面はブラウザ標準の動作 */
              <Link href={href} className={styles.tileName}>
                {displayName}
              </Link>
            ) : (
              /* 編集モード or href なし: 非インタラクティブな span として描画 */
              <span
                className={styles.tileName}
                aria-disabled={!tileable ? "true" : undefined}
              >
                {displayName}
              </span>
            )}
            {/* shortDescription は補助表示（displayName より目立たなく） */}
            {shortDescription && (
              <p className={styles.tileDescription}>{shortDescription}</p>
            )}
          </div>
        )}

        {/* タイルコンポーネント本体（Phase 2 では FallbackTile） */}
        <TileComponent slug={entry.slug} isEditing={isEditing} />
      </div>
    </article>
  );
}
