import type { Metadata } from "next";
import TilesContent from "./TilesContent";

/**
 * /internal/tiles — タイル単体表示の内部検証ページ
 *
 * 責務（tile-and-detail-design.md §7 / cycle-193.md 屋台骨第 4 項）:
 * - keigo-reference 用 1 軽量版タイルが Panel 内で破綻なく描画できることの単体確認場所
 * - robots: noindex（来訪者には届かない検証専用ページ）
 *
 * スコープ外（Phase 9 / B-336 の責務）:
 * - CSS Grid サイズ規格（large=2×2 等）の検証
 * - ダッシュボード本体グリッドの DnD 検証
 * - 複数タイル並列の DnD 検証
 * - dnd-kit 互換性検証（Phase 9 着手時に本格実施）
 *
 * page.tsx はサーバーコンポーネントとして保ち、
 * インタラクティブな描画は子の TilesContent（client component）に閉じ込める。
 */
export const metadata: Metadata = {
  title: "内部検証: タイル単体表示 | yolos.net",
  description:
    "keigo-reference 軽量版タイルの単体表示を検証するための内部ページ。",
  robots: { index: false, follow: false },
};

export default function TilesPage() {
  return <TilesContent />;
}
