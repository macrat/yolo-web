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
  publishedAt: "2026-02-14T07:55:07+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "Lorem Ipsum（英語）と日本語の2種類のダミーテキストを、指定した段落数・段落あたりの文数で生成します。日本語テキストは夏目漱石の「吾輩は猫である」冒頭と一般的な例文を組み合わせています。最大20段落×20文まで対応し、生成はブラウザ上で完結します。",
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
