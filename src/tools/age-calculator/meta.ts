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
  valueProposition: "生年月日を入力するだけで年齢・和暦・干支・星座がわかる",
  usageExample: {
    input: "2000-05-15（基準日: 2026-02-28）",
    output: "25歳9ヶ月13日 / 平成12年 / 辰 / 牡牛座",
    description: "生年月日から年齢と関連情報を一括計算する例",
  },
  faq: [
    {
      question: "明治より前の生年月日にも対応していますか？",
      answer:
        "年齢・干支・星座の計算は可能ですが、和暦表示は明治（1868年）以降のみ対応しています。明治以前の日付では和暦の表示が省略されます。",
    },
    {
      question: "基準日を変更すると何が変わりますか？",
      answer:
        "基準日を変更すると、その日時点での年齢が計算されます。例えば過去の特定日や未来の日付を指定することで、その時点での年齢を確認できます。デフォルトは今日の日付です。",
    },
    {
      question: "干支はどのように決まりますか？",
      answer:
        "干支は生まれた年の西暦から決まります。十二支（子・丑・寅・卯・辰・巳・午・未・申・酉・戌・亥）が12年周期で繰り返されます。月日は関係なく、生まれ年のみで判定します。",
    },
  ],
};
