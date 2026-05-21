import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TILE_DECLARATIONS } from "@/tools/_constants/tile-declarations";
import { calcTilePixels } from "@/tools/_constants/tile-grid";

/**
 * 単独レンダリング検証ルート（Phase 8.1）。
 *
 * TILE_DECLARATIONS に登録済みの任意のタイルを単独で描画し、
 * 推奨サイズ（recommendedSize）での表示を検証するための hidden ルート。
 *
 * 4 系統（tools / cheatsheets / play / dictionary）対応の汎用ルート。
 * domain / slug で TILE_DECLARATIONS を検索し、エントリが存在しない場合は
 * Next.js 標準の 404 を返す。
 *
 * noindex 設定の根拠:
 *   (new)/ 配下は sharedMetadata の robots: index=true を既定で継承するため、
 *   この page.tsx で明示的に上書きする必要がある（原典 L27 / L336）。
 *   shallow merge により子の値が親 sharedMetadata.robots を上書きし、
 *   noindex,nofollow が出力される（T-1 baseline 確認済）。
 *
 * sitemap 除外:
 *   sitemap.ts は allow-list 方式のため /internal/* は明示追加しない限り含まれない
 *   （T-1 で確認済）。
 *
 * Phase 8.1 cycle-200 T-3
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ domain: string; slug: string }>;
}

export default async function TilePreviewPage({ params }: Props) {
  const { domain, slug } = await params;

  // TILE_DECLARATIONS から (domain, slug) 一致のエントリを検索
  const entry = TILE_DECLARATIONS.find(
    (e) => e.domain === domain && e.slug === slug,
  );

  // エントリが存在しない場合は Next.js 標準 404 を返す
  if (!entry) {
    notFound();
  }

  const { tileComponent: TileComponent, recommendedSize } = entry;
  const { cols, rows } = recommendedSize;
  const { width, height } = calcTilePixels(cols, rows);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <TileComponent />
    </div>
  );
}
