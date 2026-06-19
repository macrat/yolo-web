import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "percent-calculator",
  name: "パーセント計算",
  nameEn: "Percent Calculator",
  description:
    "パーセント計算ツール。「XのY%」「AはBの何%」「増減率」「変化率」の4パターンをすぐに計算できます。割引計算やテスト得点率、前年比の算出などに。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "割合・増減率・変化率をすぐ計算",
  keywords: [
    "パーセント計算",
    "パーセント計算機",
    "割合 計算",
    "百分率 計算",
    "何パーセント",
    "増減率 計算",
    "変化率 計算",
    "割引 計算",
  ],
  category: "generator",
  relatedSlugs: ["bmi-calculator", "unit-converter", "number-base-converter"],
  publishedAt: "2026-06-19T13:08:48+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "4つの計算パターンを用意しています。「XのY%」は X × Y ÷ 100、「AはBの何%」は A ÷ B × 100、「増減率」は X × (1 ± Y/100)、「変化率」は (B − A) ÷ A × 100 で計算します。すべてブラウザ上で完結し、入力値がサーバーに送信されることはありません。",
  faq: [
    {
      question: "「XのY%はいくつ？」はどういう計算ですか？",
      answer:
        "ある数値Xに対して、その何割にあたるかを求めます。たとえば「2500の15%」は 2500 × 15 ÷ 100 = 375 です。割引額の計算やチップの金額を出すときに使います。",
    },
    {
      question: "「AはBの何%？」はどういう計算ですか？",
      answer:
        "全体Bに対してAがどれくらいの割合かを求めます。たとえば「80は200の何%？」は 80 ÷ 200 × 100 = 40% です。テストの正答率や達成率の計算に使います。",
    },
    {
      question: "増減率と変化率の違いは何ですか？",
      answer:
        "増減率は「もとの値をY%増やす/減らすといくつになるか」を求めます。変化率は「AからBに変わったとき何%変化したか」を求めます。増減率は結果の値を、変化率は変化の割合を知りたいときに使います。",
    },
    {
      question: "小数やマイナスの数値も計算できますか？",
      answer:
        "はい。小数やマイナスの数値にも対応しています。ただし「AはBの何%？」でBが0の場合や、「変化率」でAが0の場合は0で割ることになるため計算できません。",
    },
  ],
};
