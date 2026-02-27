import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "image-resizer",
  name: "画像リサイズ",
  nameEn: "Image Resizer",
  description:
    "画像リサイズツール。ブラウザ上で画像のサイズを変更。アスペクト比ロック、幅・高さ指定、パーセント指定に対応。PNG・JPEG・WebP出力対応。サーバー送信なしで安全。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "ブラウザ上で画像をリサイズ・変換",
  keywords: [
    "画像 リサイズ オンライン",
    "画像 サイズ変更",
    "画像 縮小",
    "画像 拡大",
    "画像 変換",
  ],
  category: "generator",
  relatedSlugs: ["image-base64", "base64", "qr-code"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
