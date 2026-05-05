import type { Tileable } from "./types";
import { toolTileables, playTileables } from "./generated/toolbox-registry";

/**
 * 全コンテンツ（tool / play）を Tileable[] として返す統合 indexer。
 *
 * 内部実装は `generated/toolbox-registry.ts` に委譲する。
 * そのファイルは `scripts/generate-toolbox-registry.ts` によって自動生成される
 * （prebuild / predev フックで実行）。
 *
 * 設計方針（案 H: codegen 集約）:
 * - tools: `src/tools/{slug}/meta.ts` を fast-glob で自動発見し codegen が import を生成する。
 *   手動登録不要（登録忘れを型チェックで検出）。
 * - play: per-slug meta.ts 慣習がないため既存 `src/play/registry.ts` を継続使用。
 *
 * 既知の限界（LIMITATION）:
 * - この統合 indexer が防ぐのは「toolbox 層（ダッシュボード等）への未登録」のみ。
 * - 既存の `src/tools/registry.ts` は依然として手書き管理であり、
 *   ツール一覧ページ・サイトマップ等への掲載漏れバグは残る。
 *   これは後続サイクルで既存 registry を段階的に codegen へ統合することで解決予定。
 * - generated ファイルを手動編集した場合は `npm run generate:toolbox-registry` で復元できる。
 *   git diff で意図しない編集を検出・revert することが運用の基本。
 *
 * 順序: tool → play（生成ファイルの宣言順を保持）。
 * slug 重複の優先順位: Tool > Play（buildTileableMap 内で実装）。
 */
export function getAllTileables(): Tileable[] {
  return [...toolTileables, ...playTileables];
}

/**
 * slug → Tileable の Map を構築する。
 *
 * 重複 slug の優先順位: Tool > Play。
 * 同一 slug が複数種別に存在する場合、優先度の高い種別のエントリが採用される。
 * 実装上は優先度の低い種別（play）を先に登録し、
 * 優先度の高い種別（tool）が後から上書きする方式を取る。
 */
function buildTileableMap(): Map<string, Tileable> {
  const map = new Map<string, Tileable>();

  // 優先度の低い順に登録し、高い順で上書き
  // Play（低優先）→ Tool（最高優先）
  for (const t of playTileables) {
    map.set(t.slug, t);
  }
  for (const t of toolTileables) {
    map.set(t.slug, t);
  }

  return map;
}

/** モジュールロード時に一度だけ構築する slug → Tileable Map */
const tileableMap: Map<string, Tileable> = buildTileableMap();

/**
 * slug → Tileable のルックアップ関数。
 *
 * @param slug - 検索する slug
 * @returns 一致した Tileable、存在しない場合は undefined
 */
export function getTileableBySlug(slug: string): Tileable | undefined {
  return tileableMap.get(slug);
}
