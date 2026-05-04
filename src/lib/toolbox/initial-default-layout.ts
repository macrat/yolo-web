/**
 * InitialDefaultLayout — `/` の初回レンダリング用最小デフォルトプリセット型。
 *
 * This is an interim type for `/` initial render only.
 * B-312 (multiple presets + selector UI) may redesign this entirely.
 * Backwards compatibility is not required for B-312.
 *
 * 用途:
 * - 初回来訪者・SNS シェア訪問者・Googlebot に空でない初期道具箱を見せるための枠組み。
 * - localStorage 未設定 / 不正時のフォールバック値を `useToolboxConfig` フック（2.2.8）が
 *   この定数 `INITIAL_DEFAULT_LAYOUT` を参照して返す。
 * - `useSyncExternalStore` の `getServerSnapshot` はこの定数を固定値として返す設計。
 *
 * 責務範囲:
 * - 本ファイルの責務は型定義と定数のエクスポートのみ。
 * - localStorage 読込フックの実装は `useToolboxConfig` フック（2.2.8）の責務。
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
 * 5 タイル構成（small × 3、medium × 2）。
 * 初回来訪者・SNS シェア訪問者・Googlebot に対して
 * SSR HTML に空でない道具箱を提供するためのハードコード値。
 *
 * 採用 slug 選定基準（cycle-177 CRIT-1 対応）:
 * - 機能種別が被らず来訪者が「何ができるか」を一目で把握できる多様な構成にする
 * - 利用頻度が高いジャンルから幅広く選択する
 * - char-count: テキスト計量（テキスト系で最も汎用的）
 * - password-generator: セキュリティ（日常的な需要が高い）
 * - unix-timestamp: 時刻変換（開発者・一般ユーザー問わず活用される）
 * - qr-code: QR コード生成（視覚的に分かりやすく幅広い用途）
 * - unit-converter: 単位変換（調理・工業・旅行など幅広い場面で活用）
 *
 * B-312（ペルソナ別プリセット + 選択 UI）実装時にこの定数ごと再設計してよい（後方互換不要）。
 */
export const INITIAL_DEFAULT_LAYOUT: InitialDefaultLayout = {
  tiles: [
    { slug: "char-count", size: "small", order: 0 },
    { slug: "password-generator", size: "medium", order: 1 },
    { slug: "unix-timestamp", size: "small", order: 2 },
    { slug: "qr-code", size: "medium", order: 3 },
    { slug: "unit-converter", size: "small", order: 4 },
  ],
};
