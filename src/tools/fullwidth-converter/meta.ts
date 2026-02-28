import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "fullwidth-converter",
  name: "全角半角変換",
  nameEn: "Fullwidth/Halfwidth Converter",
  description:
    "全角半角変換ツール。英数字やカタカナの全角・半角を相互変換。テキストの一括変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "英数字・カタカナの全角半角を相互変換",
  keywords: [
    "全角半角変換",
    "全角 半角 変換",
    "カタカナ 半角変換",
    "半角カタカナ変換",
    "全角英数字変換",
  ],
  category: "text",
  relatedSlugs: ["char-count", "text-replace", "text-diff", "kana-converter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition: "テキストを貼り付けるだけで全角半角を一括変換できる",
  usageExample: {
    input: "Ｈｅｌｌｏ１２３カタカナ",
    output: "Hello123ｶﾀｶﾅ",
    description: "全角英数字・全角カタカナを半角に一括変換する例",
  },
  faq: [
    {
      question: "変換対象の文字種を個別に選択できますか？",
      answer:
        "はい。英数字・カタカナ・記号とスペースの3種類を個別にオン・オフできます。たとえば英数字だけ半角に変換し、カタカナはそのまま残すといった使い方が可能です。",
    },
    {
      question: "半角カタカナの濁点・半濁点は正しく変換されますか？",
      answer:
        "はい。半角カタカナの濁点（ﾞ）・半濁点（ﾟ）付き文字も正しく全角カタカナに変換されます。たとえば「ｶﾞ」は「ガ」に、「ﾊﾟ」は「パ」に変換されます。",
    },
    {
      question: "全角と半角の違いは何ですか？",
      answer:
        "全角は日本語環境で標準的に使われる文字幅で、1文字が漢字と同じ幅を占めます。半角はその半分の幅で、英数字やカタカナに半角と全角の両方の表記があります。データの統一や表示の整合性のために変換が必要になることがあります。",
    },
  ],
};
