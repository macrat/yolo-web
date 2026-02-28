import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "kana-converter",
  name: "ひらがな・カタカナ変換",
  nameEn: "Hiragana/Katakana Converter",
  description:
    "ひらがな・カタカナ変換ツール。ひらがな→カタカナ、カタカナ→ひらがなの相互変換、全角カタカナ↔半角カタカナ変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "ひらがな・カタカナ・半角カナの相互変換",
  keywords: [
    "ひらがな カタカナ 変換",
    "カタカナ ひらがな 変換",
    "半角カタカナ 変換",
    "全角カタカナ 変換",
    "ひらがな変換",
  ],
  category: "text",
  relatedSlugs: ["fullwidth-converter", "char-count", "text-replace"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "テキストを貼り付けるだけでひらがな・カタカナ・半角カナを相互変換できる",
  usageExample: {
    input: "おはようございます",
    output: "オハヨウゴザイマス",
    description: "ひらがなをカタカナに変換する例",
  },
  faq: [
    {
      question: "漢字やアルファベットが含まれていても変換できますか？",
      answer:
        "はい。ひらがな・カタカナ以外の文字（漢字、アルファベット、数字、記号など）はそのまま変換されずに出力されます。変換対象の文字だけが処理されます。",
    },
    {
      question: "どのような変換モードがありますか？",
      answer:
        "ひらがな→カタカナ、カタカナ→ひらがな、半角カナ→全角カナ、全角カナ→半角カナの4つの変換モードに対応しています。ボタンで切り替えて使えます。",
    },
    {
      question: "半角カタカナの濁点・半濁点は正しく変換されますか？",
      answer:
        "はい。半角カタカナの濁点（ﾞ）や半濁点（ﾟ）は、全角変換時に自動的に結合されます。例えば「ｶﾞ」は「ガ」に正しく変換されます。",
    },
  ],
};
