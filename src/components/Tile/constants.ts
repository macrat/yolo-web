/**
 * Tile コンポーネントの定数定義。
 *
 * スパイク（dnd-spike/DndSpikeContent.tsx）で検証済みの定数を本番品質に昇格させたもの。
 * SIZE_SPAN: CSS Grid の grid-column: span N に使用する値のマッピング。
 */

import type { TileSize } from "./types";

/**
 * タイルサイズ → CSS Grid の span 値のマッピング。
 * スパイクで検証済み（dnd-kit の DragOverlay 経由でも正しく機能する）。
 *
 * small  = 1列分 (span 1)
 * medium = 2列分 (span 2)
 * large  = 3列分 (span 3)
 *
 * グリッドは 4 カラム想定（TileGrid コンポーネント側で grid-template-columns: repeat(4, 1fr) を指定）。
 */
export const SIZE_SPAN: Record<TileSize, number> = {
  small: 1,
  medium: 2,
  large: 3,
};
