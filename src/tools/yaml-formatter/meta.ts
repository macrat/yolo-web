import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "yaml-formatter",
  name: "YAML整形・変換",
  nameEn: "YAML Formatter & Converter",
  description:
    "YAML整形・検証・JSON相互変換ツール。YAMLのフォーマット、バリデーション、YAML→JSON・JSON→YAML変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "YAMLの整形・検証・JSON相互変換",
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
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition: "YAMLの整形・検証・JSON相互変換がブラウザだけでできる",
  usageExample: {
    input: "name: yolos\nversion: 1\nitems:\n- a\n- b",
    output: '{"name":"yolos","version":1,"items":["a","b"]}',
    description: "YAMLからJSONへ変換する例",
  },
  faq: [
    {
      question: "入力データのサイズに制限はありますか？",
      answer:
        "入力は最大1,000,000文字（約1MB）まで対応しています。設定ファイルやAPI定義など通常の用途であれば十分なサイズです。",
    },
    {
      question: "JSON→YAML変換はどのように行いますか？",
      answer:
        "モード選択で「JSON → YAML」を選び、入力欄にJSONを貼り付けて「変換」ボタンを押してください。インデント幅は2スペースまたは4スペースから選べます。",
    },
    {
      question: "YAMLの検証機能はどのような情報を返しますか？",
      answer:
        "「検証」ボタンを押すと、YAMLの構文が正しいかどうかを判定します。エラーがある場合はエラーの内容と該当行番号が表示されるため、素早く問題箇所を特定できます。",
    },
  ],
};
