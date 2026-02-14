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
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
};
