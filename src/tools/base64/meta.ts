import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "base64",
  name: "Base64エンコード・デコード",
  nameEn: "Base64 Encoder/Decoder",
  description:
    "Base64エンコード・デコードツール。テキストをBase64に変換、またはBase64からテキストに復元。UTF-8対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "テキストとBase64の相互変換",
  keywords: ["Base64", "エンコード", "デコード", "Base64変換", "UTF-8"],
  category: "encoding",
  relatedSlugs: ["url-encode", "hash-generator", "image-base64"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
