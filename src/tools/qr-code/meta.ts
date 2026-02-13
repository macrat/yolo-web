import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "qr-code",
  name: "QRコード生成",
  nameEn: "QR Code Generator",
  description:
    "テキストやURLからQRコードを生成するツール。SVG形式で高品質なQRコードを作成。エラー訂正レベルの設定に対応。登録不要・無料。",
  shortDescription: "テキストやURLからQRコードを生成",
  keywords: [
    "QRコード生成",
    "QRコード作成",
    "QRコードジェネレーター",
    "URL QRコード",
    "QRコード無料",
  ],
  category: "generator",
  relatedSlugs: ["password-generator", "url-encode"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
};
