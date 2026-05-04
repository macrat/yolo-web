/**
 * InitialDefaultLayout — `/` の初回レンダリング用最小デフォルトプリセット型。
 *
 * This is an interim type for `/` initial render only.
 * B-312 (multiple presets + selector UI) may redesign this entirely.
 * Backwards compatibility is not required for B-312.
 *
 * 用途:
 * - 初回来訪者・SNS シェア訪問者・Googlebot に空でない初期道具箱を見せるための枠組み。
 *
 * 責務範囲:
 * - 本ファイルの責務は型定義と定数のエクスポートのみ。
 * - 永続化 / Hook 実装は Phase 9 で実タイル群の観察に基づき設計・実装される（本サイクル時点では不在）。
 *
 * slug について:
 * - 現時点では実タイルがまだないため、フィクスチャダミースラッグを使用している。
 * - 実タイルへの差し替えは Phase 7（B-314）で各ツールがタイル化されるたびに行う。
 */
export type InitialDefaultLayout = {
  tiles: Array<{
    /** フィクスチャまたは実コンテンツの slug */
    slug: string;
    /**
     * タイルの表示サイズ。CSS Grid の span 値に対応する。
     * small=1col, medium=2col, large=3col。
     */
    size: "small" | "medium" | "large";
    /** タイルの表示順序（0 始まりの連番） */
    order: number;
  }>;
};

/**
 * INITIAL_DEFAULT_LAYOUT — `/` の初回レンダリングで使用するデフォルトプリセット定数。
 *
 * 5 タイル構成（small × 2、medium × 2、large × 1）。
 * 初回来訪者・SNS シェア訪問者・Googlebot に対して
 * SSR HTML に空でない道具箱を提供するためのハードコード値。
 *
 * 現時点ではフィクスチャダミースラッグを使用:
 * - fixture-small-1 / fixture-small-2  → size: small
 * - fixture-medium-1 / fixture-medium-2 → size: medium
 * - fixture-large-1                     → size: large
 *
 * Phase 7（B-314）で各ツールがタイル化されるたびに実タイルの slug へ差し替える。
 * B-312（ペルソナ別プリセット + 選択 UI）実装時にこの定数ごと再設計してよい（後方互換不要）。
 */
export const INITIAL_DEFAULT_LAYOUT: InitialDefaultLayout = {
  tiles: [
    { slug: "fixture-small-1", size: "small", order: 0 },
    { slug: "fixture-small-2", size: "small", order: 1 },
    { slug: "fixture-medium-1", size: "medium", order: 2 },
    { slug: "fixture-medium-2", size: "medium", order: 3 },
    { slug: "fixture-large-1", size: "large", order: 4 },
  ],
};
