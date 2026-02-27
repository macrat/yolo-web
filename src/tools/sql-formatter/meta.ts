import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "sql-formatter",
  name: "SQL整形",
  nameEn: "SQL Formatter",
  description:
    "SQL整形ツール。SQLクエリを自動整形してインデント・改行・キーワード大文字化。MySQL・PostgreSQL・SQLite対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "SQLクエリの自動整形・インデント",
  keywords: [
    "SQL 整形",
    "SQL フォーマッター",
    "SQL 自動整形 オンライン",
    "SQL 改行",
    "SQL インデント",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "yaml-formatter", "csv-converter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
