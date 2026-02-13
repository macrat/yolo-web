import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "url-encode",
  name: "URLエンコード・デコード",
  nameEn: "URL Encoder/Decoder",
  description:
    "URLエンコード・デコードツール。日本語やマルチバイト文字を含むURLの変換に対応。パラメータ単位・URL全体の両方に対応。登録不要・無料で使えます。",
  shortDescription: "URLのエンコード・デコード変換",
  keywords: [
    "URLエンコード",
    "URLデコード",
    "パーセントエンコーディング",
    "URL変換",
    "日本語URL",
  ],
  category: "encoding",
  relatedSlugs: ["base64", "json-formatter"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
};
