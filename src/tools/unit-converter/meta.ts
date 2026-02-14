import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "unit-converter",
  name: "単位変換",
  nameEn: "Unit Converter",
  description:
    "単位変換ツール。長さ・重さ・温度・面積・速度の単位を相互変換。メートル法・ヤードポンド法・日本の伝統単位にも対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "長さ・重さ・温度・面積・速度の単位変換",
  keywords: [
    "単位変換",
    "長さ 変換",
    "重さ 変換",
    "温度 変換",
    "面積 変換",
    "速度 変換",
  ],
  category: "generator",
  relatedSlugs: [
    "number-base-converter",
    "date-calculator",
    "byte-counter",
    "bmi-calculator",
  ],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
