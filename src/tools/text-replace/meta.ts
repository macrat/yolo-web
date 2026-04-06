import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "text-replace",
  name: "テキスト置換",
  nameEn: "Text Replace",
  description:
    "テキスト置換ツール。文字列の一括置換、正規表現による高度な置換に対応。置換件数の表示機能つき。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "テキストの一括置換・正規表現置換",
  keywords: [
    "テキスト置換",
    "テキスト置換 オンライン",
    "文字列置換",
    "一括置換",
    "正規表現置換",
  ],
  category: "text",
  relatedSlugs: [
    "char-count",
    "fullwidth-converter",
    "regex-tester",
    "text-diff",
    "kana-converter",
  ],
  publishedAt: "2026-02-14T07:35:49+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "入力テキスト内の検索文字列を置換文字列に一括置換します。正規表現モードではJavaScriptの正規表現エンジンによる高度な置換が可能で、キャプチャグループ参照（$1など）も使用できます。大文字小文字の区別と全件/先頭のみの置換をオプションで切り替えられます。最大10万文字まで対応します。",
  faq: [
    {
      question: "入力テキストの文字数に制限はありますか？",
      answer:
        "入力テキストは最大10万文字まで対応しています。通常の文書やコードであれば問題なく処理できますが、極端に長いテキストの場合はブラウザの動作が重くなることがあります。",
    },
    {
      question: "正規表現による置換はできますか？",
      answer:
        "はい。正規表現チェックボックスをオンにすると、正規表現パターンによる高度な置換が可能です。大文字小文字の区別やすべて置換の切り替えオプションも用意しています。",
    },
    {
      question: "正規表現でよく使うパターンにはどんなものがありますか？",
      answer:
        "たとえば\\d+で数字の連続、\\s+で空白文字の連続、[A-Za-z]+で英字の連続にマッチします。置換文字列では$1のようにキャプチャグループを参照することもできます。",
    },
  ],
};
