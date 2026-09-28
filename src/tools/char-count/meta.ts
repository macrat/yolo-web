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
  relatedSlugs: [
    "json-formatter",
    "text-diff",
    "kana-converter",
    "line-break-remover",
  ],
  publishedAt: "2026-02-13T18:57:05+09:00",
  updatedAt: "2026-09-28T09:29:54+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "入力テキストをリアルタイムで解析し、文字数・バイト数（UTF-8）・単語数・行数を同時にカウントします。文字数は画面で1文字に見えるまとまりを1文字として数えます。組み合わせた絵文字（👨‍👩‍👧）・国旗（🇯🇵）・肌の色つきの絵文字（👍🏽）・濁点を分けて書いた「が」も1文字です。空白と改行も1文字ずつ数えます。すべての処理はブラウザ上で完結し、入力データはサーバーに送信されません。",
  faq: [
    {
      question: "ひらがな1文字は何バイトですか？",
      answer:
        "UTF-8では3バイトです。ASCII文字（英数字・半角記号）は1バイト、😀 のような絵文字は4バイトです。組み合わせた絵文字は、1文字に見えてもバイト数が多くなります（👨‍👩‍👧 は18バイト）。",
    },
    {
      question: "Wordの文字数と結果が違うのはなぜですか？",
      answer:
        "Wordはスペースや改行の扱いが設定により異なります。このツールの「文字数」は空白と改行も含めて数え、「空白と改行を除いた文字数」はどちらも除いて数えます。",
    },
    {
      question: "改行は文字数に含まれますか？",
      answer:
        "はい。改行は1つを1文字として数えます。Windowsで書いた文（改行がCRLF）を貼り付けても、入力欄が改行を1つにそろえるので、改行1つは1文字です。行数は改行の数 + 1 です。",
    },
  ],
};
