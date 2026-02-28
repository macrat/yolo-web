import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "dummy-text",
  name: "ダミーテキスト生成",
  nameEn: "Dummy Text Generator",
  description:
    "ダミーテキスト生成ツール。Lorem Ipsum（英語）と日本語のダミーテキストを段落数・文章数を指定して生成。Webデザインのモックアップ作成に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "英語・日本語のダミーテキストを段落数指定で生成",
  keywords: [
    "ダミーテキスト生成",
    "Lorem Ipsum",
    "ダミーテキスト",
    "日本語ダミーテキスト",
    "テスト文章 生成",
  ],
  category: "generator",
  relatedSlugs: ["password-generator", "char-count", "byte-counter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "段落数と文数を指定するだけで日本語・英語のダミー文章を生成できる",
  usageExample: {
    input: "日本語 / 2段落 / 3文ずつ",
    output:
      "吾輩は猫である。名前はまだない。どこで生れたかとんと見当がつかぬ。...",
    description: "日本語のダミーテキストを2段落・各3文で生成する例",
  },
  faq: [
    {
      question: "生成できる段落数や文数に上限はありますか？",
      answer:
        "段落数・段落あたりの文数ともに1〜20の範囲で指定できます。最大で20段落 x 20文の合計400文まで一度に生成可能です。",
    },
    {
      question: "Lorem Ipsumと日本語テキストは切り替えられますか？",
      answer:
        "はい。画面上部のボタンでLorem Ipsum（英語）と日本語を切り替えられます。生成後にワンクリックでクリップボードにコピーすることもできます。",
    },
    {
      question: "生成される日本語テキストの出典は何ですか？",
      answer:
        "夏目漱石の「吾輩は猫である」の冒頭部分と、一般的な日本語の例文を組み合わせたものです。Webデザインのモックアップ用途に適した自然な日本語文になっています。",
    },
  ],
};
