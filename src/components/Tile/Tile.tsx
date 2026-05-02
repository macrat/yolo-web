"use client";

/**
 * Tile コンポーネント
 *
 * ダッシュボードの基本単位となるタイル。
 * useSortable（@dnd-kit/sortable）で DnD 対応済み。
 *
 * 設計原則:
 * - mode="view"（使用モード）: ドラッグハンドル・削除ボタン非表示、タイル内クリック有効
 * - mode="edit"（編集モード）: ドラッグハンドル・削除ボタン・移動ボタン表示。
 *   タイル内クリックは CSS pointer-events: none で無効化。DESIGN.md §4 参照。
 * - mode 状態の管理は外側ラッパー（#4 EditModeWrapper 等）の責務。Tile は受け取るだけ
 * - DndContext / SortableContext の mount は外側ラッパー / 配置 UI（#6）の責務。Tile は useSortable を内部で使う（経路 B 採用前提）
 * - DragOverlay は親コンポーネント（#6）側で扱うため、Tile は通常レンダリングのみ実装
 * - カーソル: ドラッグハンドルのみ grab。タイル本体は default。DESIGN.md §4 参照。
 *
 * CSS Grid span:
 * - gridColumn のインラインスタイルを廃止。span 値は TileGrid.module.css の data-size セレクタで制御。
 * - インラインスタイルで gridColumn を設定すると CSS が上書きできず、ブレークポイントで暗黙トラックが発生する（致命バグ）。
 *
 * z-index 階層（AP-I08 / globals.css の CSS 変数参照）
 */

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Tileable } from "@/lib/toolbox/types";
import type { TileSize, TileMode } from "./types";
import TileMoveButtons from "./TileMoveButtons";
import styles from "./Tile.module.css";

/** Tile コンポーネントの props */
interface TileProps {
  /** タイルとして表示するコンテンツのメタ情報 */
  tileable: Tileable;
  /**
   * バリエーション ID（1 対多サポート時の選択用）。
   * TileDefinition.id と対応する。単一タイルのみの場合は省略可。
   */
  variant?: string;
  /** タイルの表示サイズ */
  size: TileSize;
  /** 操作モード: "view"（使用モード）| "edit"（編集モード） */
  mode: TileMode;
  /**
   * 削除コールバック（編集モード時のみ呼ばれる）。
   * 未指定でも削除ボタンは表示される（mode="edit" のとき）。
   */
  onDelete?: () => void;
  /**
   * コンテンツエリアクリックコールバック。
   * mode="view" のときのみ呼ばれる。
   * mode="edit" 時の click ブロックは CSS pointer-events: none（DESIGN.md §4）。
   */
  onContentClick?: () => void;
  /** このタイルがリスト先頭か（移動ボタンの disabled 判定に使用）。省略時は false */
  isFirst?: boolean;
  /** このタイルがリスト末尾か（移動ボタンの disabled 判定に使用）。省略時は false */
  isLast?: boolean;
  /** 先頭へ移動コールバック（編集モードのみ） */
  onMoveFirst?: () => void;
  /** 1 つ前へ移動コールバック（編集モードのみ） */
  onMovePrev?: () => void;
  /** 1 つ後へ移動コールバック（編集モードのみ） */
  onMoveNext?: () => void;
  /** 末尾へ移動コールバック（編集モードのみ） */
  onMoveLast?: () => void;
}

/**
 * Tile — ダッシュボードの基本タイル単位。
 *
 * useSortable を内部で使用して DnD 対応済み。
 * DndContext / SortableContext は外側ラッパーで提供する必要がある。
 */
function Tile({
  tileable,
  variant,
  size,
  mode,
  onDelete,
  onContentClick,
  isFirst = false,
  isLast = false,
  onMoveFirst,
  onMovePrev,
  onMoveNext,
  onMoveLast,
}: TileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tileable.slug });

  const style: React.CSSProperties = {
    // transform は useSortable から得た値を適用（DnD 中の位置移動）
    transform: CSS.Transform.toString(transform),
    transition,
    // gridColumn はインラインスタイルで設定しない。
    // TileGrid.module.css の data-size セレクタで制御することでブレークポイント別 span が正しく動作する。
    // インラインスタイルは CSS より優先度が高いため、ここに gridColumn を書くと CSS が上書きできない。
    // DragOverlay 内（グリッド外）では grid-column が無視されるため問題なし。
  };

  /**
   * variant を考慮した TileDefinition の解決。
   * - tile が配列: variant と id が一致するものを優先。一致なければ tile[0] にフォールバック。
   * - tile が単一: variant の値に関係なくその定義を使用。
   * - tile が未定義: null（TileFallback を描画する）。
   */
  const resolvedTileDef = (() => {
    if (!tileable.tile) return null;
    if (Array.isArray(tileable.tile)) {
      return (
        tileable.tile.find((t) => t.id === variant) ?? tileable.tile[0] ?? null
      );
    }
    return tileable.tile;
  })();

  /**
   * タイトルリンクの URL。
   * tileable.href が指定されていればそれを使用。
   * 未指定時は contentKind に応じたデフォルト URL を生成。
   *
   * default 句: ContentKind に新しい値が追加されたとき TypeScript が型エラーで検出できるよう
   * never 型チェックを行う（exhaustive check）。また実行時フォールバックとして汎用 URL を返す。
   */
  const titleHref =
    tileable.href ??
    (() => {
      switch (tileable.contentKind) {
        case "tool":
          return `/tools/${tileable.slug}`;
        case "play":
          return `/play/${tileable.slug}`;
        case "cheatsheet":
          return `/cheatsheets/${tileable.slug}`;
        default: {
          // ContentKind が網羅されているかを TypeScript コンパイル時に検証する。
          // 新しい ContentKind が追加されてここに到達した場合、型エラーとして検出される。
          const _exhaustiveCheck: never = tileable.contentKind;
          // 実行時フォールバック（TypeScript では到達不能だが、型キャストされた場合の安全網）
          return `/${String(_exhaustiveCheck)}/${tileable.slug}`;
        }
      }
    })();

  /**
   * コンテンツエリアのクリックハンドラ。
   * edit モード時の click ブロックは CSS `pointer-events: none`（Tile.module.css）に集約。
   * ここでは view モード時に onContentClick を呼ぶのみ。
   */
  function handleContentClick(): void {
    onContentClick?.();
  }

  /**
   * 削除ボタンのクリックハンドラ。
   * イベントの伝播を止めて親要素の onClick が発火しないようにする。
   */
  function handleDeleteClick(e: React.MouseEvent<HTMLButtonElement>): void {
    e.stopPropagation();
    onDelete?.();
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={styles.tile}
      data-size={size}
      data-mode={mode}
      // ドラッグ中のみ属性を付与（false 時は DOM ノイズを避けるため undefined）
      data-is-dragging={isDragging ? "true" : undefined}
      data-testid={`tile-${tileable.slug}`}
      aria-label={tileable.displayName}
      // DnD アクセシビリティ属性（useSortable から）
      {...attributes}
    >
      {/* === タイルヘッダー（small サイズ × 編集モード時は 2 段組） === */}
      <header className={styles.header} data-size={size}>
        {mode === "edit" && (
          <>
            {/* 編集モード 1 段目: ハンドル / (medium以上)タイトル / 移動ボタン / 削除 */}
            <div className={styles.headerControls}>
              {/* ドラッグハンドル（DESIGN.md §4: grab カーソルはハンドルのみ） */}
              <button
                type="button"
                className={styles.dragHandle}
                aria-label="ドラッグして移動"
                {...listeners}
              >
                <svg
                  className={styles.dragIcon}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="5" cy="4" r="1.5" />
                  <circle cx="11" cy="4" r="1.5" />
                  <circle cx="5" cy="8" r="1.5" />
                  <circle cx="11" cy="8" r="1.5" />
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="11" cy="12" r="1.5" />
                </svg>
              </button>

              {/* タイルタイトル（small 以外はここに配置、small は 2 段目） */}
              {size !== "small" && (
                <span className={styles.title}>{tileable.displayName}</span>
              )}

              {/* 移動ボタン（4 種: 先頭 / 前 / 後 / 末尾）— small は折りたたみ展開
                  4 つのコールバックがすべて揃っている時のみ描画する（N5: no-op fallback 防止）。
                  一部でも未渡しなら描画しない。コールバック未渡し時に静かに何も起きない
                  状態を避け、バグの早期検出を助ける。 */}
              {onMoveFirst && onMovePrev && onMoveNext && onMoveLast && (
                <TileMoveButtons
                  size={size}
                  isFirst={isFirst}
                  isLast={isLast}
                  onMoveFirst={onMoveFirst}
                  onMovePrev={onMovePrev}
                  onMoveNext={onMoveNext}
                  onMoveLast={onMoveLast}
                />
              )}

              {/* 削除ボタン */}
              <button
                type="button"
                className={styles.deleteButton}
                aria-label="削除"
                onClick={handleDeleteClick}
              >
                <svg
                  className={styles.deleteIcon}
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="2" y1="2" x2="12" y2="12" />
                  <line x1="12" y1="2" x2="2" y2="12" />
                </svg>
              </button>
            </div>

            {/* small サイズ 2 段目: タイトル（省略防止、line-clamp 2） */}
            {size === "small" && (
              <span className={styles.titleRow}>{tileable.displayName}</span>
            )}
          </>
        )}

        {/* 使用モード（view）: タイトルをリンク化して詳細ページへ遷移可能にする */}
        {mode === "view" && (
          <Link href={titleHref} className={styles.titleLink}>
            {tileable.displayName}
          </Link>
        )}
      </header>

      {/* === コンテンツエリア === */}
      {/* edit 時の click ブロックは CSS pointer-events: none に集約（Tile.module.css 参照） */}
      <div
        className={styles.content}
        data-testid={`tile-content-${tileable.slug}`}
        onClick={handleContentClick}
      >
        {/* variant 解決済みのコンポーネントを描画。未定義時は link-card フォールバック */}
        {resolvedTileDef ? (
          <resolvedTileDef.component tileable={tileable} />
        ) : (
          <TileFallback tileable={tileable} />
        )}
      </div>
    </article>
  );
}

/**
 * TileFallback — タイル化コンポーネントが定義されていない場合のフォールバック表示。
 * shortDescription を表示するシンプルなカード。
 */
function TileFallback({ tileable }: { tileable: Tileable }) {
  return <p className={styles.description}>{tileable.shortDescription}</p>;
}

export default Tile;
