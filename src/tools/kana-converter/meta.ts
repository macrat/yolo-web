import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "kana-converter",
  name: "ひらがな・カタカナ変換",
  nameEn: "Hiragana/Katakana Converter",
  description:
    "ひらがな・カタカナ変換ツール。ひらがな→カタカナ、カタカナ→ひらがなの相互変換、全角カタカナ↔半角カタカナ変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "ひらがな・カタカナ・半角カナの相互変換",
  keywords: [
    "ひらがな カタカナ 変換",
    "カタカナ ひらがな 変換",
    "半角カタカナ 変換",
    "全角カタカナ 変換",
    "ひらがな変換",
  ],
  category: "text",
  relatedSlugs: ["fullwidth-converter", "char-count", "text-replace"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
