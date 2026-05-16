import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "json-formatter",
  name: "JSON整形・検証",
  nameEn: "JSON Formatter & Validator",
  description:
    "JSONデータの整形・圧縮・検証ができるオンラインツール。インデント幅の設定やエラー位置の表示に対応。登録不要・無料で使えます。",
  shortDescription: "JSONの整形・圧縮・バリデーション",
  keywords: [
    "JSON整形",
    "JSONフォーマット",
    "JSON検証",
    "JSONバリデーション",
    "JSON圧縮",
  ],
  category: "developer",
  relatedSlugs: [
    "base64",
    "url-encode",
    "regex-tester",
    "yaml-formatter",
    "sql-formatter",
  ],
  publishedAt: "2026-02-13T18:57:05+09:00",
  updatedAt: "2026-02-28T08:10:50+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "入力されたJSONをブラウザ上でパースし、インデントを付けた整形表示または不要な空白を除去した圧縮表示に変換します。JSON構文エラーがある場合はエラー内容を表示します。インデント幅は2スペース・4スペース・タブから選択できます。入力データはサーバーに送信されません。",
  faq: [
    {
      question: "コメント付きのJSONは処理できますか？",
      answer:
        "標準のJSON仕様ではコメントに対応していないため、コメントが含まれているとエラーになります。コメントを削除してから入力してください。",
    },
    {
      question: "大きなJSONファイルも処理できますか？",
      answer:
        "ブラウザ上で動作するため、非常に大きなJSONファイル（数十MB以上）ではブラウザが重くなる場合があります。通常の開発で扱うサイズであれば問題なく処理できます。",
    },
    {
      question: "整形後のインデント幅は変更できますか？",
      answer:
        "はい。インデント幅は2スペース・4スペース・タブから選択できます。お好みに合わせて切り替えてください。",
    },
  ],
};
