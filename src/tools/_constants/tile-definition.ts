/**
 * タイルグリッド型契約 (Phase 7.1)
 *
 * 原典: docs/design-migration-plan.md L49 / L101-104 / L117
 *
 * 4 系統（tools / cheatsheets / play / dictionary-humor-dict）共通のタイル定義型。
 * 道具箱内に並ぶ「タイル」は、来訪者が道具箱内で完結して機能を使えるコンパクトな UI 単位。
 *
 * ## 3 形態 (a)/(b)/(c) と形態識別子の対応
 *
 *   (a) 1 対 1     → kind: "single"  — 詳細ページ本体をそのままタイル化
 *   (b) 1 対多     → kind: "widget"  — タイル用の簡素な別 UI（スマートフォンのウィジェット相当）
 *   (c) 複数バリエーション → kind: "multi"   — 用途別に複数タイル種類を持つ
 *
 * ## AP-I02 回避方針
 *
 * optional フィールド（?:）による形態間制約の緩和は禁止。
 * 形態固有フィールドはそれぞれの interface に required として定義する。
 * 形態の並立は Discriminated Union の discriminant (kind) で型レベルで強制する。
 *
 * ## 推奨サイズ
 *
 * Phase 7.2 サイズ枠規格（TILE_CELL_PX = 128px, TILE_GAP_PX = 8px）を参照。
 * cols / rows は正の整数。実ピクセルは calcTilePixels(cols, rows) で取得できる。
 */

/**
 * タイルの推奨サイズ（グリッドセル数）。
 * 1 × 1 が最小。cols / rows とも正の整数を期待する。
 * 実ピクセルへの変換は calcTilePixels(cols, rows) を使用（tile-grid.ts 参照）。
 * 定数値は tile-grid.ts の TILE_CELL_PX (128px) / TILE_GAP_PX (8px) を参照。
 */
export interface TileSize {
  /** 横方向のセル数（正の整数、TILE_CELL_PX = 128px 基準） */
  cols: number;
  /** 縦方向のセル数（正の整数、TILE_CELL_PX = 128px 基準） */
  rows: number;
}

/**
 * 共通メタ情報: 3 形態すべてに共通するフィールド群。
 * TileDefinitionSingle / TileDefinitionWidget / TileDefinitionMulti の
 * intersection として構成される（interface で extends する形で使用）。
 *
 * - tileComponent: タイル用 React コンポーネントへの参照（型は unknown、
 *   実際には React.ComponentType 相当。型引数は Phase 8 で確定する）
 * - recommendedSize: 推奨表示サイズ（TILE_CELL_PX / TILE_GAP_PX ベース）
 * - inputPlaceholder: 入力欄のプレースホルダ文字列（入力なしの場合は空文字）
 * - outputPlaceholder: 出力欄のプレースホルダ文字列（出力なしの場合は空文字）
 */
interface TileDefinitionBase {
  /**
   * タイルとして表示する React コンポーネント参照。
   * Phase 8 で各タイル実装時に具体的な props 型を持つコンポーネントを渡す。
   * any は Phase 8 確定までの型引数プレースホルダ。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tileComponent: React.ComponentType<Record<string, any>>;
  /**
   * 推奨表示サイズ（グリッドセル単位）。
   * TILE_CELL_PX = 128px, TILE_GAP_PX = 8px を基準とし、
   * 実ピクセルは calcTilePixels(cols, rows) で算出。
   */
  recommendedSize: TileSize;
  /**
   * 入力欄プレースホルダ。入力 UI を持たないタイルでは空文字列を指定。
   * 原典 L104「入出力 placeholder」相当。
   */
  inputPlaceholder: string;
  /**
   * 出力欄プレースホルダ。出力 UI を持たないタイルでは空文字列を指定。
   * 原典 L104「入出力 placeholder」相当。
   */
  outputPlaceholder: string;
}

/**
 * 形態 A: single（原典 (a) 1 対 1）
 *
 * 詳細ページ本体をそのままタイルとして流用する形態。
 * タイル専用コンポーネントは不要で、詳細ページコンポーネントを
 * tileComponent に指定する。
 */
export interface TileDefinitionSingle extends TileDefinitionBase {
  /** 形態識別子: 1 対 1（詳細ページ本体と同一 UI） */
  kind: "single";
  /**
   * 詳細ページへの正規 URL パス（来訪者がタイルから詳細ページへ遷移する際に使用）。
   * 形態 A では詳細ページ本体をタイル化するため、URL の明示が必要。
   */
  detailPath: string;
}

/**
 * 形態 B: widget（原典 (b) 1 対多）
 *
 * タイル専用の簡素な別 UI（ウィジェット）を新設する形態。
 * スマートフォンの「アプリ本体（詳細ページ）」と
 * 「ホーム画面ウィジェット（タイル）」の関係性に相当。
 */
export interface TileDefinitionWidget extends TileDefinitionBase {
  /** 形態識別子: 1 対多（タイル専用の別 UI） */
  kind: "widget";
  /**
   * 詳細ページへの正規 URL パス（詳細ページへの遷移動線として使用）。
   * タイル UI は簡素に絞り、詳細は detailPath 先で提供する設計。
   */
  detailPath: string;
  /**
   * タイル UI のサマリー説明（来訪者に「このタイルで何ができるか」を伝える文字列）。
   * 詳細ページの description より短く（30 字以内推奨）、タイル内に収まる粒度。
   */
  widgetSummary: string;
}

/**
 * 形態 C: multi（原典 (c) 複数バリエーション）
 *
 * 1 つのコンテンツに対して用途別の複数タイル種類を提供する形態。
 * variantLabel で各バリエーションを区別する。
 */
export interface TileDefinitionMulti extends TileDefinitionBase {
  /** 形態識別子: 複数バリエーション */
  kind: "multi";
  /**
   * バリエーション識別ラベル（同一コンテンツの複数タイル種類を区別するための文字列）。
   * 例: "compact" / "full" / "input-only" など。
   */
  variantLabel: string;
  /**
   * 詳細ページへの正規 URL パス（オプション的に見えるが、形態 C は必須）。
   * 複数バリエーションが存在しても詳細ページへの動線は 1 つであるため
   * このフィールドは各バリエーション定義で共通の URL を指定する。
   */
  detailPath: string;
}

/**
 * 4 系統共通タイル定義型（Discriminated Union 親型）。
 *
 * kind フィールドを discriminant として形態 A / B / C を型レベルで区別する。
 * kind 以外の形態固有フィールドは各形態の interface に required として定義し、
 * optional による形態間制約の緩和（AP-I02）を回避している。
 *
 * tools / cheatsheets / play / dictionary-humor-dict の 4 系統すべてに共通して使用する。
 */
export type TileDefinition =
  | TileDefinitionSingle
  | TileDefinitionWidget
  | TileDefinitionMulti;

/**
 * 系統識別子。4 系統それぞれを区別するための literal type。
 * Phase 7.3 レジストリのエントリで使用する。
 */
export type TileSystemKind = "tools" | "cheatsheets" | "play" | "dictionary";
