"use client";

/**
 * tile-loader — slug ベースの lazy loader（next/dynamic 方式）
 *
 * Tileable のコンポーネント参照経路を slug ベースの lazy loader に再設計する
 * （B-2 タスク）。
 *
 * 【設計意図】
 * メタ型（Tileable）はコンポーネント参照を持たず、
 * コンポーネント本体の取得経路は slug → この loader 経由に分離する。
 * これにより Phase 7（30+ ツールタイル化）での First Load JS 肥大化を防ぐ。
 *
 * 既存パターン（`src/play/quiz/_components/ResultExtraLoader.tsx` および
 * `ResultCard.tsx` の slug → next/dynamic 方式）と同一の方式。
 * ssr: false を使用する（タイルコンポーネントが client-only な機能を持ち得るため。
 * Phase 9 でダッシュボード本体実装時に再判断される可能性がある暫定設定）。
 *
 * 【Phase 7 拡張ポイント】
 * Phase 7（B-314）で各 slug にタイル用コンポーネントが追加されたら、
 * `getTileComponent` 内に `if (slug === "xxx") return dynamic(...)` を
 * 追加して個別の loader を返すように拡張する。
 */

import dynamic from "next/dynamic";
import type React from "react";

/** タイルコンポーネントのローダー型。next/dynamic の戻り値と同一。 */
export type TileComponentLoader = React.ComponentType<TileComponentProps>;

/**
 * タイルコンポーネントが受け取る共通 props。
 *
 * 現時点では最小構成（Phase 2 での枠確保）。
 * Phase 9 でダッシュボード本体実装時に必要な props を追加してよい。
 */
export interface TileComponentProps {
  /** タイルのスラグ（識別子）。Tileable.slug をそのまま渡す。 */
  slug: string;
}

/**
 * メモ化キャッシュ。
 * キー: slug → TileComponentLoader
 *
 * モジュールロード時に一度構築され、同一 slug の呼び出しは
 * 同じコンポーネント参照を返す（不要な再 import を防ぐ）。
 */
const loaderCache = new Map<string, TileComponentLoader>();

/**
 * フォールバックコンポーネント（未知の slug 向け）。
 *
 * Phase 2 では全タイルが汎用フォールバックを使う。
 * Phase 7 以降で個別タイルコンポーネントが実装されたら、
 * slug に応じた動的 import に切り替える。
 *
 * NOTE: この定数は"use client"ファイルのモジュールスコープで 1 回だけ生成される。
 */
const FallbackTileComponent = dynamic(
  () =>
    import("./FallbackTile").then((mod) => ({
      default: mod.FallbackTile,
    })),
  { ssr: false },
);

/**
 * slug → TileComponentLoader を返す slug ベース lazy loader。
 *
 * @param slug - タイルのスラグ（Tileable.slug と同一）
 * @returns next/dynamic でラップされた React コンポーネント
 *
 * @example
 * // タイルコンポーネント呼び出し例
 * const TileComp = getTileComponent(tileable.slug);
 * return <TileComp slug={tileable.slug} />;
 *
 * @example
 * // Phase 7（B-314）で各 slug にタイル用コンポーネントを追加する拡張パターン:
 * // if (slug === "json-formatter") {
 * //   const loader = dynamic(() => import("@/tools/json-formatter/Tile"), { ssr: false });
 * //   loaderCache.set(slug, loader);
 * //   return loader;
 * // }
 */
export function getTileComponent(slug: string): TileComponentLoader {
  const cached = loaderCache.get(slug);
  if (cached) return cached;

  // keigo-reference: 1 軽量版タイル（cycle-193 T-C, tile-and-detail-design.md §4）
  // TileVariant / variantId / loaderCache キー変更なし（cycle-179 サブ判断 3-a 継承）
  if (slug === "keigo-reference") {
    const loader = dynamic(() => import("@/tools/keigo-reference/Tile"), {
      ssr: false,
    }) as TileComponentLoader;
    loaderCache.set(slug, loader);
    return loader;
  }

  /**
   * Phase 2: 全 slug に対してフォールバックコンポーネントを返す。
   * Phase 7（B-314）で各 slug にタイル用コンポーネントが追加されたら、
   * 上記の拡張パターンのように if 分岐を追加して個別の loader を返す。
   *
   * 申し送り（Phase 7 第 2 弾以降）: 現在の cache 設計では「未知 slug →
   * fallback → cache に保存」のため、後から if 分岐を追加した slug でも
   * 一度 fallback が cache に入ると以降は fallback を返し続ける構造になる。
   * Phase 7 第 2 弾以降で slug を追加する際は cache 設計の再評価が必要。
   * （軽微-5 / cycle-193 T-C reviewer 指摘）
   */
  loaderCache.set(slug, FallbackTileComponent);
  return FallbackTileComponent;
}
