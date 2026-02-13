import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "unix-timestamp",
  name: "UNIXタイムスタンプ変換",
  nameEn: "Unix Timestamp Converter",
  description:
    "UNIXタイムスタンプと日時の相互変換ツール。現在時刻の取得、タイムゾーン表示に対応。エポック秒・ミリ秒の両方をサポート。登録不要・無料。",
  shortDescription: "UNIXタイムスタンプと日時を相互変換",
  keywords: [
    "UNIXタイムスタンプ",
    "タイムスタンプ変換",
    "エポック秒",
    "日時変換",
    "Unix time",
  ],
  category: "developer",
  relatedSlugs: ["hash-generator", "base64"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
};
