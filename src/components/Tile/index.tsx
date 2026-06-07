import type { ComponentPropsWithoutRef } from "react";
import Panel from "@/components/Panel";

type PanelTag = "section" | "div" | "article" | "aside";

/**
 * `mode` プロパティで Tile の動作モードを指定する。
 *
 * - `"page"`: 完全実装。children を Panel でラップして描画する（Panel 同等）。
 *   DnD / リサイズ等の道具箱 UI は描画しない。今サイクルで実際に使うのはこのモード。
 *
 * - `"toolbox-view"` / `"toolbox-edit"`: 型として宣言済みの予約 stub。
 *   DnD・リサイズ・編集モード UI は未実装（消費者である道具箱ダッシュボード B-312
 *   が未着工・仕様未確定のため、今は投機実装しない）。
 *   現時点では page と同様に Panel ラップを返す（壊れないこと優先）。
 *   将来 B-312 着工時にこの分岐内に DnD / リサイズのロジックを追記する拡張口。
 *   寸法規格は将来 `src/tools/_constants/tile-grid.ts` を参照する想定（今は使わない）。
 */
type TileMode = "page" | "toolbox-view" | "toolbox-edit";

interface TileOwnProps<T extends PanelTag = "section"> {
  /** レンダリングする HTML タグ。Panel の `as` prop に透過される（デフォルト: "section"） */
  as?: T;
  /** 子要素 */
  children: React.ReactNode;
  /** 追加クラス。Panel の `className` prop に透過され結合される */
  className?: string;
  /**
   * padding バリアント。Panel の `padding` prop に透過される。
   * - "normal" (デフォルト): 1.5rem
   * - "comfortable": 2rem — 長文読み物用の広めのパディング
   */
  padding?: "normal" | "comfortable";
  /**
   * Tile の動作モード。
   * - `"page"` (デフォルト): Panel 同等。ツールページの本体を包む器として使う。
   * - `"toolbox-view"` / `"toolbox-edit"`: 将来の道具箱ダッシュボード（B-312）用の
   *   予約 stub。現在は Panel ラップのみ（DnD / リサイズ UI は未実装）。
   */
  mode?: TileMode;
}

type TileProps<T extends PanelTag = "section"> = TileOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TileOwnProps<T>>;

/**
 * Tile — ツールページの本体を包む器。内部で必ず `<Panel>` をラップする。
 *
 * ## 目的
 *
 * `<Tile mode="page">` を使えば、ルート要素が必ず Panel（background: var(--bg)・
 * border-radius: var(--r-normal)・box-shadow: none・border: 1px）になることを
 * 機構として保証する。
 *
 * DESIGN.md §1「すべてのコンテンツはパネルに収まった形で提供される」を、
 * 規律ではなくコンポーネント設計で強制する（cycle-220/225 の二連敗教訓）。
 *
 * ## ツールページでの使い方
 *
 * ツールページの本体は `<Tile mode="page">` で包む（= Panel に収める器）。
 * 今後追加されるツールページもすべてこれを使うこと。
 *
 * ```tsx
 * // ToolPageLayout 内部 or 各ツールの本体
 * <Tile mode="page" as="section" aria-label="ツール名">
 *   <MyToolContent />
 * </Tile>
 * ```
 *
 * ## Panel との関係
 *
 * Tile は Panel の上位概念。パネルが「矩形のデザイン要素」だけを担うのに対し、
 * Tile は加えて道具箱の DnD・リサイズ・編集モード機能を持つ（将来実装）。
 * `mode="page"` のときは Panel 同等として動作する。
 *
 * ## 道具箱モード（将来）
 *
 * `mode="toolbox-view" | "toolbox-edit"` は B-312（道具箱ダッシュボード）着工時に
 * DnD / リサイズの実装を追記する拡張口として予約済み。
 */
function Tile<T extends PanelTag = "section">({
  as,
  children,
  className,
  padding,
  // mode は Panel に渡さない（Panel に未知 prop を流すのを防ぐ）ため rest から抜く。
  // 現時点ではすべてのモードで Panel ラップを返す（壊れないこと優先）。
  // 将来 B-312 着工時にここで mode を参照して DnD / リサイズ UI を分岐させる。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode = "page",
  ...rest
}: TileProps<T>) {
  // 現時点では page / toolbox-view / toolbox-edit すべてで Panel ラップを返す。
  // B-312（道具箱ダッシュボード）着工時に mode に応じた分岐を追記すること。
  const panelProps = {
    as,
    className,
    ...(padding !== undefined ? { padding } : {}),
    ...rest,
  } as Parameters<typeof Panel<T>>[0];

  return <Panel {...panelProps}>{children}</Panel>;
}

export default Tile;
