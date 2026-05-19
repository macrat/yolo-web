/**
 * タイルグリッドのサイズ枠規格定数とユーティリティ。
 *
 * 道具箱のタイルグリッドは 128px セル × 8px マージンの規格で統一する。
 * Phase 8 で実装する各タイルコンポーネント、Phase 10 で実装するダッシュボード本体は
 * すべてこのファイルの定数を参照すること。タイル内部に 128 / 8 を直書きしない。
 *
 * CSS 側からは globals.css の CSS Custom Properties を参照する:
 *   var(--tile-cell-px) / var(--tile-gap-px)
 * ※ CSS 側の定義場所: src/app/globals.css
 *
 * Turbopack では CSS Module の `:export` / `@value` / Sass 変数 export が未サポートのため、
 * TS 定数と CSS Custom Properties の二重管理が現状唯一の解。
 * (参考: docs/research/2026-05-19-phase7-tile-foundation-best-practices.md §2)
 */

/** 1 セルの基本サイズ（px）。グリッドの最小単位。 */
export const TILE_CELL_PX = 128;

/** セル間マージン（px）。隣接セル間の gap。 */
export const TILE_GAP_PX = 8;

/**
 * タイルの w 列 × h 行セルの実寸を px 文字列のオブジェクトで返す。
 *
 * 計算式:
 *   width  = TILE_CELL_PX * w + TILE_GAP_PX * (w - 1)  = (128n + 8(n-1))px
 *   height = TILE_CELL_PX * h + TILE_GAP_PX * (h - 1)  = (128m + 8(m-1))px
 *
 * @param w - 横方向のセル数（1 以上の整数）
 * @param h - 縦方向のセル数（1 以上の整数）
 * @returns { width: string; height: string } — インラインスタイルや CSS Custom Property 注入に使える形式
 *
 * @example
 * // 1×1 セル: 128px × 128px
 * tileSizeStyle(1, 1) // → { width: "128px", height: "128px" }
 *
 * @example
 * // 2×1 セル: 264px × 128px
 * tileSizeStyle(2, 1) // → { width: "264px", height: "128px" }
 */
export function tileSizeStyle(
  w: number,
  h: number,
): { width: string; height: string } {
  const width = TILE_CELL_PX * w + TILE_GAP_PX * (w - 1);
  const height = TILE_CELL_PX * h + TILE_GAP_PX * (h - 1);
  return {
    width: `${width}px`,
    height: `${height}px`,
  };
}
