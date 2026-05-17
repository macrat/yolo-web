/**
 * keigo-reference ツール用 localStorage キー定数
 *
 * 命名規約: yolos-tool-<slug>-<purpose>
 * （use-tool-storage.ts / CLAUDE.md 準拠）
 *
 * これらの定数を Tile.tsx / Component.tsx の両方で import することで、
 * タイル⇄詳細ページ間の localStorage 状態共有を保証する（M1b likes 1 / likes 3）。
 *
 * 設計書: docs/tile-and-detail-design.md §4 案 19-A
 * - STORAGE_KEY_CATEGORY: "yolos-tool-keigo-reference-category-filter" を正として指定
 */

export const STORAGE_KEY_SEARCH = "yolos-tool-keigo-reference-search";
export const STORAGE_KEY_CATEGORY =
  "yolos-tool-keigo-reference-category-filter";
