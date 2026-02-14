import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "number-base-converter",
  name: "進数変換",
  nameEn: "Number Base Converter",
  description:
    "進数変換ツール。2進数・8進数・10進数・16進数の相互変換に対応。BigIntによる大きな数値もリアルタイム変換。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "2進数・8進数・10進数・16進数を相互変換",
  keywords: [
    "進数変換",
    "2進数 変換",
    "16進数 変換",
    "8進数 変換",
    "基数変換 オンライン",
  ],
  category: "developer",
  relatedSlugs: [
    "color-converter",
    "unix-timestamp",
    "csv-converter",
    "unit-converter",
  ],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
