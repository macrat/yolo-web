import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "color-converter",
  name: "カラーコード変換",
  nameEn: "Color Code Converter",
  description:
    "カラーコード変換ツール。HEX・RGB・HSLの相互変換とカラーピッカーに対応。Webデザインや開発に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "HEX・RGB・HSLのカラーコードを相互変換",
  keywords: [
    "カラーコード変換",
    "RGB HEX 変換",
    "HSL変換",
    "カラーピッカー",
    "色コード変換",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "regex-tester", "markdown-preview"],
  publishedAt: "2026-02-14T07:34:58+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "HEX・RGB・HSLのいずれかの形式でカラーコードを入力すると、他の2形式への変換を即座に計算してブラウザ上に表示します。カラーピッカーからも色を選択できます。3桁のHEX短縮形式（#RGB）は自動的に6桁に展開して変換されます。",
  faq: [
    {
      question: "3桁の短縮HEXコードにも対応していますか？",
      answer:
        "はい。#RGBの3桁形式と#RRGGBBの6桁形式の両方に対応しています。3桁形式は自動的に6桁に展開して変換されます。",
    },
    {
      question: "カラーピッカーから色を選んで変換できますか？",
      answer:
        "はい。テキスト入力のほかにカラーピッカーも用意しています。カラーピッカーで色を選ぶと、自動的にHEX・RGB・HSLの各値が表示されます。",
    },
    {
      question: "RGBとHSLの値の範囲はどのくらいですか？",
      answer:
        "RGBは各チャンネルが0から255の整数値です。HSLはH（色相）が0から360度、S（彩度）とL（明度）がそれぞれ0から100%の範囲です。",
    },
  ],
};
