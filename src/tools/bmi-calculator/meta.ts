import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "bmi-calculator",
  name: "BMI計算",
  nameEn: "BMI Calculator",
  description:
    "BMI計算ツール。身長・体重からBMI値を算出し、日本肥満学会基準で判定。適正体重・目標体重も表示。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "身長・体重からBMI値と肥満度を計算",
  keywords: [
    "BMI 計算",
    "BMI 計算機",
    "肥満度 チェック",
    "適正体重",
    "BMI 判定",
    "体重 計算",
  ],
  category: "generator",
  relatedSlugs: ["unit-converter", "age-calculator", "number-base-converter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
