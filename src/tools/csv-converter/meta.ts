import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "csv-converter",
  name: "CSV/TSV変換",
  nameEn: "CSV/TSV Converter",
  description:
    "CSV/TSV変換ツール。CSV・TSV・JSON・Markdown表の相互変換に対応。ダブルクォートや改行を含むフィールドも正しく処理。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "CSV・TSV・JSON・Markdown表を相互変換",
  keywords: [
    "CSV変換",
    "TSV変換",
    "CSV JSON 変換",
    "CSV Markdown 変換",
    "CSV TSV 変換 オンライン",
  ],
  category: "developer",
  relatedSlugs: [
    "json-formatter",
    "markdown-preview",
    "text-replace",
    "yaml-formatter",
    "sql-formatter",
  ],
  publishedAt: "2026-02-14T07:55:06+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "RFC 4180準拠のCSVパーサーを使用して入力データを解析し、選択した出力形式（CSV・TSV・JSON・Markdown表）に変換します。ダブルクォートで囲まれたフィールドや、フィールド内の改行・カンマも正しく処理されます。最大500,000文字まで対応し、すべての変換はブラウザ上で完結します。",
  faq: [
    {
      question: "入力データの最大サイズはどのくらいですか？",
      answer:
        "最大500,000文字まで入力できます。通常の業務データであれば問題なく処理できます。",
    },
    {
      question: "ダブルクォートや改行を含むCSVも正しく変換できますか？",
      answer:
        "はい。RFC 4180準拠のCSVパーサーを使用しているため、ダブルクォートで囲まれたフィールドや、フィールド内の改行・カンマも正しく処理されます。",
    },
    {
      question: "JSON配列からCSVに逆変換することもできますか？",
      answer:
        "はい。入力形式をJSONに、出力形式をCSVに設定すれば逆変換できます。JSON配列の最初のオブジェクトのキーがヘッダー行になります。",
    },
  ],
};
