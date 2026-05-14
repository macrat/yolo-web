/**
 * tile-variant-types — タイルバリアント型定義。
 *
 * T-C-型契約（cycle-191）で新設した型。
 * 既存の Tileable 型（1コンテンツ = 1エントリ）とは独立した
 * バリアント単位（1コンテンツ = N バリアント）の型契約。
 *
 * ## 設計判断: 新型新設（判断 B）
 *
 * 現行 Tileable 型はコンテンツのメタデータを表す（slug / displayName / publishedAt 等）。
 * TileVariant はバリアントの表示仕様を表す（どのサイズで、どの機能で、どのコンポーネントを使うか）。
 * 両者は意味的に別概念であるため、既存 Tileable を拡張せず新型として並存させる。
 *
 * ## コンポーネント参照: D-3 案（loaderId）採用
 *
 * tile-loader.ts が slug ベースの lazy loader 方式（next/dynamic）を実装済み。
 * 同方式に倣い、TileVariant でもコンポーネントを直接保持せず loaderId で識別する。
 * loaderId を受け取った tile-loader が next/dynamic で lazy load する。
 * これにより First Load JS 肥大化を防ぐ（tile-loader.ts 設計意図と整合）。
 *
 * ## 参照ドキュメント
 *
 * - docs/tool-detail-page-design.md「## タイルシステム整備（T-C-事例発散）」
 * - docs/tool-detail-page-design.md「## タイル型契約（T-C-型契約）」
 * - docs/cycles/cycle-191.md L45（Done 条件）
 */

/**
 * タイルのグリッドスパン（推奨サイズ）。
 * CSS Grid の span 値に対応する。
 *
 * 想定値:
 * - small: { cols: 1, rows: 1 }
 * - medium: { cols: 2, rows: 1 }
 * - large: { cols: 2, rows: 2 }
 *
 * NOTE: 具体的な cols / rows の値は将来の道具箱グリッド実装（Phase 9）で確定する。
 * 現時点はこの型で値の意図を記録しておく。
 */
export interface TileGridSpan {
  /** 占有する列数（CSS Grid: grid-column: span N） */
  cols: number;
  /** 占有する行数（CSS Grid: grid-row: span N） */
  rows: number;
}

/**
 * TileVariant — タイルバリアントの型契約。
 *
 * T-C-事例発散（cycle-191）で帰納した共通要素 5 個（A〜E）を型化。
 *
 * ### 各フィールドと共通要素の対応
 *
 * | フィールド        | 共通要素 | 説明                                             |
 * |------------------|----------|--------------------------------------------------|
 * | variantId        | A        | バリアント識別子（各ツール × 各バリアントで一意）|
 * | gridSpan         | B        | 推奨サイズ（グリッドスパン情報）                 |
 * | tileDescription  | C        | 提供機能の説明テキスト（visitor 向け）           |
 * | loaderId         | D        | コンポーネント参照（tile-loader が解決する）      |
 * | isDefaultVariant | E        | デフォルトバリアントフラグ                       |
 *
 * ### 意図的に除外したフィールド
 *
 * - F（道具箱側バリアント選択機構）: 道具箱 UI の責務として分離（Phase 9 配線実装）
 * - ツール固有フィールド（カテゴリフィルター / 変換オプション 等）:
 *   3 件で共通化できなかったため除外（T-C-事例発散 共通しない要素リスト参照）
 */
export interface TileVariant {
  /**
   * バリアント識別子。タイルバリアントを一意に識別する文字列。
   * 命名規則: `{slug}-{size}-{feature}`
   * 例: "keigo-reference-medium-search", "sql-formatter-medium-format"
   *
   * slug 全体で一意であること（同一ツール内でも異なるバリアントは異なる ID）。
   * tile-loader.ts の拡張時に loaderId と同じ値を使うことで参照が簡潔になる。
   *
   * 対応: 共通要素 A（バリアント識別子）
   */
  variantId: string;

  /**
   * 推奨グリッドスパン（道具箱グリッド上の推奨セルサイズ）。
   * 「推奨」であり、道具箱 UI 側が必ずしもこの値を使う必要はない。
   * Phase 9 配線実装時に道具箱 UI が参照する。
   *
   * 対応: 共通要素 B（推奨サイズ）
   */
  gridSpan: TileGridSpan;

  /**
   * タイル固有の提供機能の説明テキスト。
   * visitor が「このタイルで何ができるか」を理解できる短い文（~30〜60 文字程度）。
   *
   * Tileable.shortDescription とは異なるフィールド:
   * - Tileable.shortDescription: ツール全体の説明（カード・タイル一覧表示用）
   * - tileDescription: このバリアントで提供する機能の説明（道具箱追加 UI 等で表示）
   *
   * 例: "検索と候補一覧のみ。詳細例文は詳細ページで確認できます"
   *
   * 対応: 共通要素 C（提供機能の説明テキスト）
   */
  tileDescription: string;

  /**
   * タイルコンポーネントのローダー識別子。
   * tile-loader.ts が受け取り、対応する React コンポーネントを next/dynamic で lazy load する。
   *
   * 採用した案: D-3（loaderId による間接参照）
   * 理由: tile-loader.ts が既に slug ベースの lazy loader 方式を実装済みのため整合性を保つ。
   *       コンポーネントを直接保持（D-1: React.ComponentType）すると、
   *       タイル一覧取得時に全コンポーネントが bundle に含まれ First Load JS が肥大化する。
   *       パス文字列（D-2）は dynamic import の動的パス問題（Next.js の static analysis 要件）がある。
   *
   * 現時点は variantId と同じ値を使う（Phase 7 拡張時に tile-loader.ts 側で分岐追加）。
   * Phase 9 配線実装時に tile-loader.ts を variantId ベースに拡張する。
   *
   * 対応: 共通要素 D（コンポーネント参照）
   */
  loaderId: string;

  /**
   * デフォルトバリアントフラグ。
   * true のバリアントが INITIAL_DEFAULT_LAYOUT への投入時に選ばれる。
   *
   * 各ツールのバリアント群に必ず 1 件だけ true を設定する。
   * 複数 true はシステム上のエラーではないが、設計上は 1 件のみ推奨。
   * （複数 true の場合、呼び出し側は最初の true を採用する慣例にする）
   *
   * 対応: 共通要素 E（デフォルトバリアント）
   */
  isDefaultVariant: boolean;
}
