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
  publishedAt: "2026-02-14T22:39:14+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "SQLクエリを解析し、キーワードの大文字化・適切なインデント・改行を追加して読みやすく整形します。「圧縮」ボタンで不要な空白と改行を除去した1行形式にも変換できます。MySQL・PostgreSQL・SQLiteなど一般的なSQLに対応し、すべての処理はブラウザ上で完結します。",
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
