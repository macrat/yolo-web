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
  trustLevel: "verified",
  valueProposition:
    "数値を入力するだけで長さ・重さ・温度など全単位に一括変換できる",
  usageExample: {
    input: "1 マイル",
    output: "1.609344 km（キロメートル）",
    description: "マイルからキロメートルへの長さ変換の例",
  },
  faq: [
    {
      question: "対応している単位のカテゴリは何ですか？",
      answer:
        "長さ・重さ・温度・面積・速度の5カテゴリに対応しています。各カテゴリにはメートル法、ヤードポンド法に加え、尺・坪・貫などの日本の伝統単位も含まれています。",
    },
    {
      question: "変換元と変換先の単位を入れ替えることはできますか？",
      answer:
        "はい。変換パネルの中央にある入れ替えボタンを押すと、変換元と変換先の単位を瞬時に切り替えられます。値を再入力する必要はありません。",
    },
    {
      question: "温度の変換はどのような計算式を使っていますか？",
      answer:
        "摂氏を基準に変換しています。華氏への変換は摂氏×9/5+32、ケルビンへの変換は摂氏+273.15の計算式を使用します。逆方向も同様に正確に計算されます。",
    },
  ],
};
