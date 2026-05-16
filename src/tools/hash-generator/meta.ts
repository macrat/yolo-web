import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "hash-generator",
  name: "ハッシュ生成",
  nameEn: "Hash Generator",
  description:
    "テキストからSHA-1、SHA-256、SHA-384、SHA-512のハッシュ値を生成するツール。Web Crypto APIを使用した安全なハッシュ計算。登録不要・無料。",
  shortDescription: "SHA-1/SHA-256/SHA-512のハッシュ値を生成",
  keywords: ["ハッシュ生成", "SHA-256", "SHA-512", "SHA-1", "ハッシュ値計算"],
  category: "security",
  relatedSlugs: ["base64", "password-generator", "image-base64"],
  publishedAt: "2026-02-13T19:03:42+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "ブラウザ標準のWeb Crypto APIを使用して、SHA-1・SHA-256・SHA-384・SHA-512の4種類のハッシュ値を一度に生成します。出力形式は16進数（Hex）とBase64から選択できます。入力テキストはサーバーに送信されず、ブラウザ内でのみ処理されます。",
  faq: [
    {
      question: "対応しているハッシュアルゴリズムは何ですか？",
      answer:
        "SHA-1、SHA-256、SHA-384、SHA-512の4種類に対応しています。入力テキストから全アルゴリズムのハッシュ値を一度に生成できます。",
    },
    {
      question: "出力形式は選べますか？",
      answer:
        "はい。16進数（Hex）とBase64の2種類から選択できます。用途に応じて切り替えてください。",
    },
    {
      question: "ハッシュ値から元のテキストを復元できますか？",
      answer:
        "いいえ。ハッシュは一方向関数であるため、ハッシュ値から元のテキストを逆算することはできません。データの改ざん検知やパスワードの照合などに使われます。",
    },
  ],
};
