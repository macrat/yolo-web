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
 * 最小限の表示のみ（スラグ名）を提供する。
 */
export function FallbackTile({ slug }: TileComponentProps) {
  return (
    <div
      data-tile-slug={slug}
      data-tile-fallback="true"
      style={{
        padding: "8px",
        border: "1px solid currentColor",
        borderRadius: "4px",
        opacity: 0.5,
      }}
    >
      {slug}
    </div>
  );
}
