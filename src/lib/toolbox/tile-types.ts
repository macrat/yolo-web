import type React from "react";

import type { TileComponentProps } from "./tile-loader";

/**
 * tile-types — タイル登録の型契約（Phase 7.1）
 *
 * design-migration-plan.md Phase 7.1「Tileable / TileComponent 等のインタフェースを整備」の
 * TileComponent 部分と、サイズ仕様型（TileSize）を一ファイルに集約する。
 *
 * 【このファイルに含めるもの】
 *   - TileSize: タイルのセル単位サイズを表すインタフェース
 *   - TileComponent: レンダリング可能なタイルコンポーネントの型エイリアス
 *
 * 【このファイルに含めないもの】
 *   - Tileable / toTileable(): src/lib/toolbox/types.ts に定義済み（Phase 2.2 確定済）
 *   - TileComponentProps: src/lib/toolbox/tile-loader.ts に定義済み（既存を流用）
 *   - TileComponentLoader: src/lib/toolbox/tile-loader.ts に定義済み（lazy loader 戻り値型）
 *   - variantId / TileVariant 系: cycle-179 サブ判断 3-a で撤去確定済み
 *
 * 【TileComponent と TileComponentLoader の責務分離（案 a 採用）】
 *   TileComponentLoader（tile-loader.ts）:
 *     - getTileComponent(slug) の返却型。next/dynamic による lazy loader の戻り値型。
 *     - 「どう取得するか（lazy loader）」の型契約。
 *   TileComponent（本ファイル）:
 *     - レンダリング時の「コンポーネントとして使える」型。
 *     - TileSize 等の型契約と同じ層（登録・レンダリング仕様）に属する。
 *     - design-migration-plan.md L101 が「TileComponent」という用語を一級型エイリアスとして
 *       固定することを要求しているため、本ファイルで明示的に定義する。
 */

/**
 * TileSize — タイルのセル単位サイズを表すインタフェース。
 *
 * タイルグリッド上で占有するセル数を colSpan / rowSpan で表す。
 * 実寸への変換は src/lib/toolbox/tile-grid.ts の tileSizeStyle(colSpan, rowSpan) を使用する。
 *
 * @example
 * // 1×1 セル（128px × 128px）
 * const size: TileSize = { colSpan: 1, rowSpan: 1 };
 *
 * @example
 * // 2×1 セル（264px × 128px）
 * const size: TileSize = { colSpan: 2, rowSpan: 1 };
 */
export interface TileSize {
  /** タイルが占有する列数（width 方向のセル数）。1 以上の整数。 */
  colSpan: number;
  /** タイルが占有する行数（height 方向のセル数）。1 以上の整数。 */
  rowSpan: number;
}

/**
 * TileComponent — タイルコンポーネントの型エイリアス。
 *
 * 道具箱のタイルとしてレンダリング可能な React コンポーネントの型。
 * props は既存 TileComponentProps（{ slug: string }）をそのまま流用する（CRIT-1 対応）。
 *
 * design-migration-plan.md L101「TileComponent 等のインタフェースを整備」の
 * TileComponent 部分を一級型エイリアスとして固定する位置づけ。
 *
 * @example
 * // タイル定義ファイル内でのコンポーネント型指定
 * const MyTile: TileComponent = ({ slug }) => <div>{slug}</div>;
 */
export type TileComponent = React.ComponentType<TileComponentProps>;

/**
 * TileDefinition — タイル定義ファイル（tile.ts）の export 形式。
 *
 * Phase 8 で各コンテンツディレクトリの `tile.ts` がこの型を満たす定義を export する。
 * codegen（generate-toolbox-registry.ts）が自動収集し、
 * `src/lib/toolbox/generated/tile-definitions-registry.ts` に集約される。
 *
 * 【最小フィールド設計方針（CRIT-5 対応）】
 * Phase 8 各サイクルが満たすべき最低限のフィールドのみを定義する。
 * 入出力 placeholder（タイル間連携フィールド）は Phase 10.4 で追加される。
 *
 * @example
 * // src/tools/json-formatter/tile.ts
 * import type { TileDefinition } from "@/lib/toolbox/tile-types";
 * export const tileDef: TileDefinition = {
 *   slug: "json-formatter",
 *   displayName: "JSON フォーマッター",
 *   size: { colSpan: 2, rowSpan: 2 },
 * };
 */
export interface TileDefinition {
  /** コンテンツ識別子（meta.ts の slug と一致する値）。 */
  slug: string;
  /** タイル上に表示される名称。 */
  displayName: string;
  /** タイルのセル単位サイズ（colSpan / rowSpan）。 */
  size: TileSize;
}
