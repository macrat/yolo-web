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
 * 【Phase 7 の 1 対多サポート（variant 拡張ポイント）】
 * design-migration-plan.md Phase 7 では 1 つの slug に複数の表示 variant
 * （例: "compact"/"expanded"）を対応させる予定がある。
 * Phase 2（本サイクル）では DEFAULT_VARIANT_ID のみ使用するが、
 * `TileLoaderOptions.variantId` フィールドで拡張ポイントを確保する。
 * Phase 7（B-314）では variantId に応じた別コンポーネントをロードするように
 * このファイルを拡張する。
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
 * getTileComponent のオプション。
 *
 * 【Phase 7 拡張ポイント】
 * variantId フィールドは Phase 7（B-314）で「1 slug に複数 variant」を
 * 実現するための拡張フィールド。Phase 2 では DEFAULT_VARIANT_ID のみ使用。
 */
export interface TileLoaderOptions {
  /**
   * タイル表示バリアント ID（任意）。
   * Phase 2 では指定しない / DEFAULT_VARIANT_ID を指定するのと同等。
   * Phase 7（B-314）で "compact" / "expanded" 等の具体的 variant を実装する。
   *
   * 呼び出し元はレイアウトエントリの variantId をそのままここに渡すことを想定:
   *   getTileComponent(entry.slug, { variantId: entry.variantId })
   * entry.variantId が undefined の場合は省略でよい（DEFAULT_VARIANT_ID にフォールバック）。
   */
  variantId?: string;
}

/**
 * デフォルト variant ID。
 * Phase 2 の現在は全タイルがこの variant のみを持つ。
 * Phase 7 で複数 variant を追加する際の基準値として使用する。
 */
export const DEFAULT_VARIANT_ID = "default";

/**
 * メモ化キャッシュ。
 * キー: `${slug}:${variantId}` → TileComponentLoader
 *
 * モジュールロード時に一度構築され、同一 slug + variantId の呼び出しは
 * 同じコンポーネント参照を返す（不要な再 import を防ぐ）。
 */
const loaderCache = new Map<string, TileComponentLoader>();

/**
 * テスト専用ヘルパー: キャッシュエントリ数を返す。
 *
 * 本番コードからは使用しないこと。
 * テストで「異なる variantId で別キャッシュエントリが積まれること」および
 * 「同一キーで 2 回目呼び出しがキャッシュヒットすること（メモ化）」を
 * 内部観測するために使用する（重要 2・3 対応）。
 *
 * @internal テスト専用
 */
export function _getCacheSize(): number {
  return loaderCache.size;
}

/**
 * フォールバックコンポーネント（未知の slug / 未実装の variant）。
 *
 * Phase 2 では全タイルが汎用フォールバックを使う。
 * Phase 3 以降で個別タイルコンポーネントが実装されたら、
 * slug / contentKind に応じた動的 import に切り替える。
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
 * @param options - オプション（variantId など）
 * @returns next/dynamic でラップされた React コンポーネント
 *
 * @example
 * // タイルコンポーネント呼び出し例
 * const TileComp = getTileComponent(tileable.slug);
 * return <TileComp slug={tileable.slug} />;
 *
 * @example
 * // レイアウトエントリからの variant 指定例
 * // entry: { slug: "json-formatter", variantId: "compact", order: 0, size: "medium" }
 * const TileComp = getTileComponent(entry.slug, { variantId: entry.variantId });
 * return <TileComp slug={entry.slug} />;
 *
 * @example
 * // Phase 7 以降での variant 指定
 * const TileComp = getTileComponent(tileable.slug, { variantId: "compact" });
 */
export function getTileComponent(
  slug: string,
  options?: TileLoaderOptions,
): TileComponentLoader {
  const variantId = options?.variantId ?? DEFAULT_VARIANT_ID;
  const cacheKey = `${slug}:${variantId}`;

  const cached = loaderCache.get(cacheKey);
  if (cached) return cached;

  /**
   * Phase 2: 全 slug に対してフォールバックコンポーネントを返す。
   * Phase 3 以降で slug / variantId に応じた動的 import に切り替える。
   *
   * 将来の拡張パターン（Phase 7）:
   * if (slug === "json-formatter" && variantId === "compact") {
   *   const loader = dynamic(() => import("@/tools/json-formatter/TileCompact"), { ssr: false });
   *   loaderCache.set(cacheKey, loader);
   *   return loader;
   * }
   */
  loaderCache.set(cacheKey, FallbackTileComponent);
  return FallbackTileComponent;
}
