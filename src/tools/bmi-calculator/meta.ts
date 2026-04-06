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
  publishedAt: "2026-02-14T22:39:14+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "BMI値は「体重(kg) ÷ 身長(m)²」の計算式で算出します。判定は日本肥満学会の基準（BMI 18.5未満：低体重、18.5以上25未満：普通体重、25以上：肥満）を採用しています。適正体重はBMI 22に相当する体重を身長から逆算して表示します。計算はすべてブラウザ上で完結します。",
  faq: [
    {
      question: "BMIの判定基準は何を使っていますか？",
      answer:
        "日本肥満学会の基準を採用しています。BMI 18.5未満が低体重、18.5以上25未満が普通体重、25以上が肥満（1度〜4度）に分類されます。",
    },
    {
      question: "適正体重とは何ですか？",
      answer:
        "BMI 22に相当する体重のことです。統計的に最も病気にかかりにくいとされる数値で、身長から自動的に計算されます。",
    },
    {
      question: "子どもや高齢者のBMI判定にも使えますか？",
      answer:
        "このツールは成人向けの基準で判定しています。子どもや高齢者は異なる基準が用いられるため、医療専門家にご相談ください。",
    },
  ],
};
