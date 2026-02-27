import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "char-count",
  name: "文字数カウント",
  nameEn: "Character Counter",
  description:
    "文字数カウントツール。テキストの文字数、バイト数、単語数、行数をリアルタイムでカウント。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "テキストの文字数・バイト数・行数をカウント",
  keywords: ["文字数カウント", "文字数", "バイト数", "単語数", "行数カウント"],
  category: "text",
  relatedSlugs: ["json-formatter", "text-diff", "kana-converter"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "テキストをペーストするだけで文字数・バイト数・行数を即座に確認",
  usageExample: {
    input: "ありがとうございます",
    output: "文字数: 10文字, バイト数: 30バイト, 行数: 1行",
  },
  faq: [
    {
      question: "ひらがな1文字は何バイトですか？",
      answer:
        "UTF-8では3バイトです。ASCII文字（英数字・半角記号）は1バイト、絵文字は4バイトです。",
    },
    {
      question: "Wordの文字数と結果が違うのはなぜですか？",
      answer:
        "Wordはスペースや改行の扱いが設定により異なります。このツールは入力テキストの全文字をそのままカウントします。",
    },
    {
      question: "改行コードは文字数に含まれますか？",
      answer:
        "はい。改行コードもカウントされます。LFは1文字、CRLFはCRとLFそれぞれが1文字で合計2文字としてカウントされます。行数は改行の数 + 1 で計算しています。",
    },
  ],
};
