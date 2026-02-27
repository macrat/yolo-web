import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "age-calculator",
  name: "年齢計算",
  nameEn: "Age Calculator",
  description:
    "年齢計算ツール。生年月日から現在の年齢を計算。和暦（令和・平成・昭和・大正・明治）対応。干支・星座も表示。指定日時点の年齢計算にも対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "生年月日から年齢・和暦・干支・星座を計算",
  keywords: [
    "年齢計算",
    "年齢 早見表",
    "和暦 西暦 変換",
    "干支 計算",
    "星座 調べる",
    "生年月日 年齢",
  ],
  category: "generator",
  relatedSlugs: ["date-calculator", "unix-timestamp", "unit-converter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
