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
  publishedAt: "2026-02-13T19:03:42+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "コンポーネントモードでは encodeURIComponent を使い、スラッシュやコロンを含むすべての非ASCII文字をパーセントエンコードします。URL全体モードでは encodeURI を使い、URL構造を保ったままエンコードします。日本語などのマルチバイト文字はUTF-8バイト列に変換してからエンコードされます。",
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
