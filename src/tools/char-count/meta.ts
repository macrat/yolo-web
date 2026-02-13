import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "char-count",
  name: "文字数カウント",
  nameEn: "Character Counter",
  description:
    "文字数カウントツール。テキストの文字数、バイト数、単語数、行数をリアルタイムでカウント。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "テキストの文字数・バイト数・行数をカウント",
  keywords: ["文字数カウント", "文字数", "バイト数", "単語数", "行数カウント"],
  category: "text",
  relatedSlugs: ["json-formatter", "text-diff"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
};
