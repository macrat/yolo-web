import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "text-replace",
  name: "テキスト置換",
  nameEn: "Text Replace",
  description:
    "テキスト置換ツール。文字列の一括置換、正規表現による高度な置換に対応。置換件数の表示機能つき。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "テキストの一括置換・正規表現置換",
  keywords: [
    "テキスト置換",
    "テキスト置換 オンライン",
    "文字列置換",
    "一括置換",
    "正規表現置換",
  ],
  category: "text",
  relatedSlugs: [
    "char-count",
    "fullwidth-converter",
    "regex-tester",
    "text-diff",
    "kana-converter",
  ],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
