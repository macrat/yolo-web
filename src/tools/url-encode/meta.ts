import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "url-encode",
  name: "URLエンコード・デコード",
  nameEn: "URL Encoder/Decoder",
  description:
    "URLエンコード・デコードツール。日本語やマルチバイト文字を含むURLの変換に対応。パラメータ単位・URL全体の両方に対応。登録不要・無料で使えます。",
  shortDescription: "URLのエンコード・デコード変換",
  keywords: [
    "URLエンコード",
    "URLデコード",
    "パーセントエンコーディング",
    "URL変換",
    "日本語URL",
  ],
  category: "encoding",
  relatedSlugs: ["base64", "json-formatter", "email-validator", "image-base64"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "日本語を含むURLを貼り付けるだけでエンコード・デコードできる",
  usageExample: {
    input: "東京タワー 観光",
    output:
      "%E6%9D%B1%E4%BA%AC%E3%82%BF%E3%83%AF%E3%83%BC%20%E8%A6%B3%E5%85%89",
    description: "日本語テキストをURLエンコード（コンポーネントモード）する例",
  },
  faq: [
    {
      question: "「コンポーネント」モードと「URL全体」モードの違いは何ですか？",
      answer:
        "コンポーネントモードはクエリパラメータなどURL部品のエンコードに使い、スラッシュやコロンも変換します。URL全体モードはURL構造を保ったままエンコードするため、スキームやパス区切りはそのまま残ります。",
    },
    {
      question: "エンコード済みの文字列を元に戻せますか？",
      answer:
        "はい。「デコード」に切り替えてエンコード済みの文字列を入力すれば、元の日本語やマルチバイト文字に復元できます。",
    },
    {
      question: "URLエンコードとBase64エンコードは何が違いますか？",
      answer:
        "URLエンコードはURLに使用できない文字をパーセント記号と16進数で表現する方式です。一方、Base64は任意のバイナリデータをASCII文字列に変換する方式で、用途が異なります。",
    },
  ],
};
