import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "date-calculator",
  name: "日付計算",
  nameEn: "Date Calculator",
  description:
    "日付計算ツール。2つの日付の日数差分、日付に日数を加算・減算、和暦・西暦変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "日付の差分計算・加減算・和暦変換",
  keywords: [
    "日付計算",
    "日数計算",
    "日付 差分",
    "和暦 西暦 変換",
    "日付 加算 減算",
  ],
  category: "developer",
  relatedSlugs: [
    "unix-timestamp",
    "number-base-converter",
    "char-count",
    "unit-converter",
    "age-calculator",
    "cron-parser",
  ],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
