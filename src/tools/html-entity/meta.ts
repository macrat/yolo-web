import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "html-entity",
  name: "HTMLエンティティ変換",
  nameEn: "HTML Entity Encoder/Decoder",
  description:
    "HTMLエンティティ変換ツール。HTML特殊文字のエスケープ・アンエスケープに対応。XSS対策やHTMLソースの確認に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "HTML特殊文字のエスケープ・アンエスケープ",
  keywords: [
    "HTMLエンティティ変換",
    "HTML特殊文字 エスケープ",
    "HTMLエスケープ",
    "HTMLアンエスケープ",
    "HTML文字参照",
  ],
  category: "encoding",
  relatedSlugs: ["url-encode", "base64", "markdown-preview"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
