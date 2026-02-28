import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "number-base-converter",
  name: "進数変換",
  nameEn: "Number Base Converter",
  description:
    "進数変換ツール。2進数・8進数・10進数・16進数の相互変換に対応。BigIntによる大きな数値もリアルタイム変換。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "2進数・8進数・10進数・16進数を相互変換",
  keywords: [
    "進数変換",
    "2進数 変換",
    "16進数 変換",
    "8進数 変換",
    "基数変換 オンライン",
  ],
  category: "developer",
  relatedSlugs: [
    "color-converter",
    "unix-timestamp",
    "csv-converter",
    "unit-converter",
  ],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition: "数値を入力するだけで2進・8進・10進・16進を一括変換できる",
  usageExample: {
    input: "255",
    output: "BIN: 11111111 / OCT: 377 / DEC: 255 / HEX: ff",
    description: "10進数255を他の進数に変換する例",
  },
  faq: [
    {
      question: "非常に大きな数値も変換できますか？",
      answer:
        "はい。内部でBigIntを使用しているため、JavaScriptの通常の数値範囲を超える大きな数値も正確に変換できます。",
    },
    {
      question: "負の数の変換にも対応していますか？",
      answer:
        "はい。入力の先頭にマイナス記号を付けることで負の数を変換できます。結果も各進数でマイナス付きの値として表示されます。",
    },
    {
      question: "2進数や16進数の表示は読みやすく整形されますか？",
      answer:
        "はい。2進数は4桁ごと、16進数は2桁ごとにスペースで区切って表示されるため、長い数値でも視認しやすくなっています。",
    },
  ],
};
