import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "csv-converter",
  name: "CSV/TSV変換",
  nameEn: "CSV/TSV Converter",
  description:
    "CSV/TSV変換ツール。CSV・TSV・JSON・Markdown表の相互変換に対応。ダブルクォートや改行を含むフィールドも正しく処理。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "CSV・TSV・JSON・Markdown表を相互変換",
  keywords: [
    "CSV変換",
    "TSV変換",
    "CSV JSON 変換",
    "CSV Markdown 変換",
    "CSV TSV 変換 オンライン",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "markdown-preview", "text-replace"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
