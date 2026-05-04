"use client";

/**
 * FallbackTile — タイルコンポーネントが未実装の slug 向けフォールバック。
 *
 * Phase 2 では全タイルがこのフォールバックを使用する。
 * Phase 7（B-314）以降で各 slug の個別タイルコンポーネントが実装されたら、
 * tile-loader.ts が slug に応じた動的 import に切り替える。
 *
 * Phase 9 でダッシュボード本体実装時に本タイル実装に委譲される。
 * このコンポーネントはフォールバックとして残す。
 *
 * `opacity: 0.5` は「未実装コンテンツの仮置き表示」を示す実装上の都合。
 * Phase 7（B-314）で個別タイルが実装されたら本コンポーネントは表示されなくなる。
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
