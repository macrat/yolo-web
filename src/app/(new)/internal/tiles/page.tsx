import type { Metadata } from "next";
import TilesPreviewContent from "./TilesPreviewContent";

/** /internal/tiles はタイルバリアント単独レンダリング検証用の開発者向けページ。
 *
 * 設計判断（T-C-検証場所 / cycle-191）:
 * - `/storybook` は共通コンポーネント専用（design-migration-plan.md L308）のため、
 *   コンテンツ固有のタイルは `/storybook` に置かない。
 * - `/internal/tiles` を独立ルートとして新設（配置案 3 採用）。
 * - `/internal/` プレフィックスで開発者向けページであることを明示。
 * - noindex で visitor に意図せず公開されない。
 */
export const metadata: Metadata = {
  title: "タイル検証（開発者向け） | yolos.net",
  description:
    "タイルバリアント単独レンダリング検証ページ。TileVariant の各バリアントを独立表示して動作確認する。",
  robots: { index: false, follow: false },
};

export default function TilesPreviewPage() {
  return <TilesPreviewContent />;
}
