"use client";

/**
 * Tile — タイルコンテナコンポーネント（C-1）
 *
 * FallbackTile を内包し、状態管理・表示構造・メタ情報の周辺表示を担当する。
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
 */

import type { TileLayoutEntry } from "./storage";
import { getTileableBySlug } from "./registry";
import type { TileComponentLoader } from "./tile-loader";
import styles from "./Tile.module.css";

/** タイルの表示状態 */
export type TileState = "normal" | "editing" | "dragging" | "empty";

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
}: TileProps) {
  const tileable = getTileableBySlug(entry.slug);

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
    entry.size === "small" ? styles["tile--small"] : null,
    entry.size === "medium" ? styles["tile--medium"] : null,
    entry.size === "large" ? styles["tile--large"] : null,
    state === "editing" ? styles["tile--editing"] : null,
    state === "dragging" ? styles["tile--dragging"] : null,
    state === "empty" ? styles["tile--empty"] : null,
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
  // - Tileable.href が存在する場合は href 遷移
  // - 存在しない場合は currentTarget フォーカス + aria-disabled 表示
  const href = tileable?.href;

  // displayName は主、shortDescription は補助以下（C-1 仕様 8 参照）
  const displayName = tileable?.displayName ?? entry.slug;
  const shortDescription = tileable?.shortDescription;

  return (
    <article
      className={tileClassName}
      data-size={entry.size}
      data-editing={isEditing ? "true" : "false"}
      data-dragging={isDragging ? "true" : "false"}
      data-empty={isEmpty ? "true" : "false"}
      data-tile-slug={entry.slug}
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
             * I-2: 編集モード中は <a> を使わず <span> で描画する。
             * aria-hidden="true" は SR からテキストを隠してしまうため使用しない。
             * I-4: 使用モード + href あり の場合は <a> でリンク遷移（Stretched Link 対応）。
             * I-5: href なし + 使用モードの span は tabIndex を付与しない（フォーカスしても何もできない）。
             */}
            {href && !isEditing ? (
              /* 使用モード + href あり: リンク遷移（DESIGN.md §4 L76 参照） */
              <a href={href} className={styles.tileName}>
                {displayName}
              </a>
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
