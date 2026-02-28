import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "keigo-reference",
  name: "敬語早見表",
  nameEn: "Keigo Reference Table",
  description:
    "敬語早見表ツール。よく使う動詞の尊敬語・謙譲語・丁寧語の変換一覧を検索・フィルター付きで確認できます。よくある敬語の間違いも掲載。登録不要・無料のオンライン敬語リファレンスです。",
  shortDescription: "尊敬語・謙譲語・丁寧語の変換早見表",
  keywords: [
    "敬語 一覧",
    "敬語 変換表",
    "尊敬語 謙譲語 一覧",
    "敬語 早見表",
    "ビジネス 敬語",
    "よく使う敬語",
  ],
  category: "text",
  relatedSlugs: ["business-email", "kana-converter", "char-count"],
  publishedAt: "2026-02-21",
  structuredDataType: "WebApplication",
  trustLevel: "curated",
  valueProposition:
    "動詞を検索するだけで尊敬語・謙譲語・丁寧語を一覧で確認できる",
  usageExample: {
    input: "言う",
    output: "尊敬語: おっしゃる / 謙譲語: 申す・申し上げる / 丁寧語: 言います",
    description: "動詞「言う」の敬語変換を検索する例",
  },
  faq: [
    {
      question: "掲載されている動詞は何件ですか？",
      answer:
        "基本動詞・ビジネス頻出・接客サービスの3カテゴリで合計40件以上の動詞を掲載しています。カテゴリフィルターやキーワード検索で絞り込むことができます。",
    },
    {
      question: "用例や使い方の例文も確認できますか？",
      answer:
        "はい。各動詞の行をクリックすると、具体的な場面での使用例が展開表示されます。普通語・尊敬語・謙譲語それぞれの例文と補足説明を確認できます。",
    },
    {
      question: "よくある敬語の間違いも確認できますか？",
      answer:
        "はい。「よくある間違い」タブに切り替えると、二重敬語・尊敬語と謙譲語の混同・バイト敬語など、ビジネスシーンで注意すべき誤用パターンと正しい表現を確認できます。",
    },
  ],
};
