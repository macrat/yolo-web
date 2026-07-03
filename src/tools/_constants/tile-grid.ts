/**
 * タイルグリッド寸法定数。
 *
 * 原典: docs/archive/design-migration-plan.md Phase 7.2（cycle-277 アーカイブ・規格は現役）
 *   基本セルサイズ: 1 セル 128px × 128px
 *   セル間マージン: 8px
 *   n × m タイルの実ピクセル: (128n + 8(n-1))px × (128m + 8(m-1))px
 *
 * Phase 8 以降の各タイル実装・Phase 10 のダッシュボードは
 * すべて当ファイルの定数を参照する。個別タイル内に数値を直書きしない。
 *
 * CSS Module 側への共有方式: インラインスタイル（方式 iii）。
 * コンポーネントの style prop に calcTilePixels() が返す値を渡すことで、
 * CSS Module 側では width/height を参照するだけでよく、数値直書きが不要になる。
 */

/** 基本セルの幅・高さ（px）。1 セル = 128px × 128px。 */
export const TILE_CELL_PX = 128;

/** セル間マージン（px）。n × m 展開時に (n-1) 個のマージンが入る。 */
export const TILE_GAP_PX = 8;

/**
 * n × m タイルの実ピクセルサイズを計算して返す。
 *
 * 計算式（原典 L109）:
 *   幅 = 128n + 8(n-1) = (128 + 8)n - 8 = 136n - 8
 *   高 = 128m + 8(m-1) = (128 + 8)m - 8 = 136m - 8
 *
 * @param cols タイルの列数（横方向のセル数）
 * @param rows タイルの行数（縦方向のセル数）
 * @returns { width, height } の実ピクセルサイズ（px 数値）
 */
export function calcTilePixels(
  cols: number,
  rows: number,
): { width: number; height: number } {
  const width = TILE_CELL_PX * cols + TILE_GAP_PX * (cols - 1);
  const height = TILE_CELL_PX * rows + TILE_GAP_PX * (rows - 1);
  return { width, height };
}
