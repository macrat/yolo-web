"use client";

/**
 * FallbackTile — タイルコンポーネントが未実装の slug / variant 向けフォールバック。
 *
 * Phase 2 では全タイルがこのフォールバックを使用する。
 * Phase 3 以降で各 slug の個別タイルコンポーネントが実装されたら、
 * tile-loader.ts が slug に応じた動的 import に切り替える。
 *
 * C 群（C-1 Tile）が実装された後はそちらに委譲される。
 * このコンポーネントはフォールバックとして残す。
 *
 * 【DESIGN.md §4 との関係（軽微 1 対応）】
 * DESIGN.md §4 はドラッグ・編集操作の視覚表現規約（操作状態のフィードバック表現）。
 * 本フォールバックは「Phase 3 以前の未実装タイル向け臨時表現」であり §4 の対象外。
 * `opacity: 0.5` は「未実装コンテンツの仮置き表示」を示す実装上の都合であり、
 * DESIGN.md で定義されたデザイントークンとは別の用途（AP-I10 の適用範囲外）。
 * Phase 3 で個別タイルが実装されたら本コンポーネントは表示されなくなるため、
 * DESIGN.md への追記は不要。
 */

import type { TileComponentProps } from "./tile-loader";

/**
 * 未実装タイルのフォールバック表示。
 *
 * Phase 3 以降で個別タイルコンポーネントが実装されるまでの仮置き。
 * Tile コンテナ（Tile.tsx）が displayName / shortDescription を表示するため、
 * このフォールバックは slug テキストを表示しない（二重表示の防止）。
 * タイルの存在を示す最小限の視覚的プレースホルダーとして機能する。
 */
export function FallbackTile({ slug: _slug }: TileComponentProps) {
  return (
    /* data-tile-slug は親の article（Tile.tsx）にのみ付与する。重複付与を防ぐため削除（CRIT-4）。 */
    <div data-tile-fallback="true" aria-hidden="true" />
  );
}
