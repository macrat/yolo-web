import type { Metadata } from "next";
import { tilesRegistry } from "@/tools/generated/tiles-registry";

/**
 * hidden 検証ルート（Phase 7.3）。
 *
 * registry の件数を文字列として返す最小骨格。
 * 来訪者向けでないため noindex を明示的に設定する。
 *
 * noindex 設定の根拠:
 *   (new)/ 配下は sharedMetadata の robots: index=true を既定で継承するため、
 *   この page.tsx で明示的に上書きする必要がある（原典 L27 / L336）。
 *   robots.ts への追記は行わない（cycle-175 / cycle-195 知見）。
 *
 * 最小骨格の境界条件（Phase 7.3 計画書）:
 *   - HTML 要素は単一の p タグのみ
 *   - CSS Module 新設禁止、インライン style 不可、無装飾 HTML のみ
 *   - 既存共通コンポーネント（Panel / Button / Layout 等）の import 禁止
 *   - 件数 0 件時の説明文や動線説明等の追記禁止
 *   - 表示内容は registry の件数（数値）を文字列として 1 つ返すのみ
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TilesInternalPage() {
  return <p>{tilesRegistry.length}</p>;
}
