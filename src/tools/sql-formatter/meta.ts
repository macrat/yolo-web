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
  valueProposition: "SQLクエリを貼り付けるだけで読みやすく自動整形できる",
  usageExample: {
    input: "select id,name from users where status='active' order by name",
    output:
      "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  status = 'active'\nORDER BY\n  name",
    description: "1行のSELECT文を整形して見やすくする例",
  },
  faq: [
    {
      question: "どのSQLデータベースに対応していますか？",
      answer:
        "標準的なSQL構文を対象としており、MySQL・PostgreSQL・SQLiteなどの一般的なデータベースのSQLを整形できます。ただしデータベース固有の特殊構文は正しく整形できない場合があります。",
    },
    {
      question: "キーワードの大文字・小文字は切り替えられますか？",
      answer:
        "はい。「キーワード大文字」チェックボックスで切り替えられます。オンにするとSELECTやFROMなどのキーワードが大文字に、オフにすると小文字になります。",
    },
    {
      question: "SQL圧縮（minify）機能はどのように動作しますか？",
      answer:
        "「圧縮」ボタンをクリックすると、不要な空白や改行を除去して1行にまとめます。ログへの埋め込みやURLパラメータとしてSQLを渡す際に便利です。",
    },
  ],
};
