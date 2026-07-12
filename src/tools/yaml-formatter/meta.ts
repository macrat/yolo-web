import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "yaml-formatter",
  name: "YAML整形・変換",
  nameEn: "YAML Formatter & Converter",
  description:
    "YAML整形・検証・JSON相互変換ツール。YAMLのフォーマット、バリデーション、YAML→JSON・JSON→YAML変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription:
    "YAMLを読みやすく整形（改行・字下げ）。構文チェック・JSON変換も",
  keywords: [
    "YAML整形",
    "YAMLフォーマット",
    "YAML JSON 変換",
    "JSON YAML 変換",
    "YAMLバリデーション",
  ],
  category: "developer",
  relatedSlugs: [
    "json-formatter",
    "csv-converter",
    "markdown-preview",
    "sql-formatter",
  ],
  publishedAt: "2026-02-14T13:25:20+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "入力したYAMLを読みやすく改行・字下げ（インデント）して整形します。「検証」ボタンで構文が正しいかをチェックでき、エラーがある場合は該当行番号とともに日本語で内容を表示します。「YAML → JSON」「JSON → YAML」モードで形式間の変換も可能。字下げ幅は2スペースまたは4スペースから選べます。すべての処理はブラウザ上で完結し、入力内容はサーバーに送信されません。最大1,000,000文字まで対応しています。",
  faq: [
    {
      question: "入力データのサイズに制限はありますか？",
      answer:
        "入力は最大1,000,000文字（約1MB）まで対応しています。設定ファイルやAPI定義など通常の用途であれば十分なサイズです。",
    },
    {
      question: "JSON→YAML変換はどのように行いますか？",
      answer:
        "モード選択で「JSON → YAML」を選び、入力欄にJSONを貼り付けて「変換」ボタンを押してください。字下げ幅は2スペースまたは4スペースから選べます。",
    },
    {
      question: "構文チェックで何が分かりますか？",
      answer:
        "「検証」ボタンを押すと、YAMLの書き方が正しいかどうかを判定します。誤りがある場合は、問題のある行番号と内容を日本語で表示するため、どこを直せばよいかすぐに分かります。",
    },
  ],
};
