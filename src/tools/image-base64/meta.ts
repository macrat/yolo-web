import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "image-base64",
  name: "画像Base64変換",
  nameEn: "Image Base64 Converter",
  description:
    "画像Base64変換ツール。画像ファイルをBase64文字列に変換、またはBase64文字列から画像をプレビュー表示。PNG・JPEG・GIF・WebP・SVGに対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "画像ファイルとBase64文字列を相互変換",
  keywords: [
    "画像 Base64 変換",
    "Base64 画像 変換",
    "画像 データURI",
    "Base64 エンコード 画像",
    "画像 文字列 変換",
  ],
  category: "encoding",
  relatedSlugs: ["base64", "url-encode", "hash-generator", "image-resizer"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
