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
  publishedAt: "2026-02-13T18:57:05+09:00",
  updatedAt: "2026-02-28T08:10:50+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "入力テキストをリアルタイムで解析し、文字数・バイト数（UTF-8）・単語数・行数を同時にカウントします。文字数はUnicodeコードポイント単位でカウントし、改行コードも含まれます。すべての処理はブラウザ上で完結し、入力データはサーバーに送信されません。",
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
