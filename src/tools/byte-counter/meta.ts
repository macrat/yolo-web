import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "byte-counter",
  name: "バイト数計算",
  nameEn: "Byte Counter",
  description:
    "バイト数計算ツール。UTF-8エンコーディングでのバイト数をリアルタイムで計算。文字数・行数・単語数も同時表示。データベースやAPIの文字数制限の確認に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "UTF-8バイト数をリアルタイム計算、文字数・行数も表示",
  keywords: [
    "バイト数計算",
    "UTF-8 バイト数",
    "バイト数 カウント",
    "文字数 バイト数",
    "バイト数計算 オンライン",
  ],
  category: "text",
  relatedSlugs: ["char-count", "dummy-text", "text-replace", "unit-converter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
