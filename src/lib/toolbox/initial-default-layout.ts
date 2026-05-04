/**
 * InitialDefaultLayout — `/` の初回レンダリング用最小デフォルトプリセット型。
 *
 * This is an interim type for `/` initial render only.
 * B-312 (multiple presets + selector UI) may redesign this entirely.
 * Backwards compatibility is not required for B-312.
 *
 * 用途:
 * - 初回来訪者・SNS シェア訪問者・Googlebot に空でない初期道具箱を見せるための枠組み。
 * - localStorage 未設定 / 不正時のフォールバック値として使用される。
 * - `useSyncExternalStore` の `getServerSnapshot` はこの定数を固定値として返す設計。
 *
 * 責務範囲:
 * - 本ファイルの責務は型定義と定数のエクスポートのみ。
 * - localStorage 連携と Hook 実装は Phase 9 で実タイル群の観察に基づき設計・実装される。
 * - Tile コンポーネントの実装は 2.2.5 の責務。
 *
 * slug について:
 * - 現サイクル（cycle-175 Phase 2）では実タイルがまだないため、
 *   フィクスチャダミースラッグ（2.2.5 で `src/components/Tile/fixtures/` に置かれる予定）を参照。
 * - 実タイルへの差し替えは Phase 7（B-314）で各ツールがタイル化されるたびに行う。
 * - 並列実装（#5 Tile builder と #7 本タスク）のために PM が固定した slug を使用。
 */
export type InitialDefaultLayout = {
  tiles: Array<{
    /** フィクスチャまたは実コンテンツの slug */
    slug: string;
    /**
     * タイルバリアント識別子（任意）。複数バリエーションがある場合に使用する。
     * 未指定の場合はデフォルトバリアントが使用される。
     */
    variantId?: string;
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
 * slug は 2.2.5（Tile builder）と 2.2.7（本タスク）の並列実装のために PM が固定：
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
