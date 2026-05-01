/**
 * Tile コンポーネントの型定義。
 */

/**
 * タイルのサイズ。CSS Grid の span 数に対応する。
 * - "small": 1列分 (span 1) — コンパクトなウィジェット向け
 * - "medium": 2列分 (span 2) — 標準的なツール向け
 * - "large": 3列分 (span 3) — 入出力が多いツール・ゲーム向け
 */
export type TileSize = "small" | "medium" | "large";

/**
 * タイルの操作モード。
 * - "view": 使用モード（デフォルト）。ドラッグハンドル・削除ボタンは非表示。
 * - "edit": 編集モード。ドラッグハンドル・削除ボタンが表示され、タイル内クリックは無効化。
 */
export type TileMode = "view" | "edit";
