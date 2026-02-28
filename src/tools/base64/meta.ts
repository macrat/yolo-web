import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "base64",
  name: "Base64エンコード・デコード",
  nameEn: "Base64 Encoder/Decoder",
  description:
    "Base64エンコード・デコードツール。テキストをBase64に変換、またはBase64からテキストに復元。UTF-8対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "テキストとBase64の相互変換",
  keywords: ["Base64", "エンコード", "デコード", "Base64変換", "UTF-8"],
  category: "encoding",
  relatedSlugs: ["url-encode", "hash-generator", "image-base64"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "テキストを貼り付けるだけでBase64のエンコード・デコードができる",
  usageExample: {
    input: "Hello, World!",
    output: "SGVsbG8sIFdvcmxkIQ==",
    description: "テキストをBase64にエンコードする例",
  },
  faq: [
    {
      question: "日本語などのマルチバイト文字もエンコードできますか？",
      answer:
        "はい。UTF-8エンコーディングに対応しているため、日本語や絵文字などのマルチバイト文字も正しくエンコード・デコードできます。",
    },
    {
      question: "エンコードとデコードはどのように切り替えますか？",
      answer:
        "画面上部の「エンコード」「デコード」ボタンで切り替えられます。エンコードモードではテキストからBase64へ、デコードモードではBase64からテキストへ変換します。",
    },
    {
      question: "Base64エンコードするとデータサイズはどのくらい増えますか？",
      answer:
        "Base64エンコードすると元のデータの約1.33倍（約33%増）のサイズになります。3バイトのデータが4文字のASCII文字列に変換されるためです。",
    },
  ],
};
