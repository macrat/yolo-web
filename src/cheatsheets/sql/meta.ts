import type { CheatsheetMeta } from "../types";

export const meta: CheatsheetMeta = {
  slug: "sql",
  name: "SQLチートシート",
  nameEn: "SQL Cheatsheet",
  description:
    "SQLの基本SELECT文からJOIN・サブクエリ・集計関数まで、よく使うSQL構文を網羅したチートシート。記述順と実行順の違いも解説。MySQL・PostgreSQL対応。",
  shortDescription: "よく使うSQL構文を用途別に整理",
  keywords: [
    "SQL",
    "SQLチートシート",
    "SQL 書き方",
    "SELECT文",
    "JOIN",
    "GROUP BY",
    "SQL入門",
    "SQL構文一覧",
  ],
  category: "developer",
  relatedToolSlugs: [],
  relatedCheatsheetSlugs: ["regex", "http-status-codes"],
  sections: [
    { id: "basics", title: "基本のSELECT文" },
    { id: "filtering", title: "絞り込み・条件指定" },
    { id: "aggregation", title: "集計・グループ化" },
    { id: "joins", title: "テーブル結合" },
    { id: "subqueries", title: "サブクエリ" },
    { id: "set-operations", title: "集合演算" },
    { id: "data-manipulation", title: "データ操作（DML）" },
    { id: "schema", title: "テーブル定義（DDL）" },
  ],
  publishedAt: "2026-03-01",
  trustLevel: "curated",
  valueProposition: "よく使うSQL構文を用途別に整理。書き方をすぐ確認できる",
  usageExample: {
    input: "JOINの書き方を忘れたとき",
    output: "INNER/LEFT/RIGHT/FULL JOINの構文と使い分けをすぐ参照できる",
    description: "記述順と実行順の解説付き",
  },
  faq: [
    {
      question: "WHEREとHAVINGの違いは何ですか？",
      answer:
        "WHEREはグループ化の前に行を絞り込み、HAVINGはGROUP BYでグループ化した後に条件で絞り込みます。WHEREでは集計関数を使えませんが、HAVINGでは使えます。例えばCOUNTやSUMの結果で絞り込む場合はHAVINGを使います。",
    },
    {
      question: "INNER JOINとLEFT JOINの違いは何ですか？",
      answer:
        "INNER JOINは両方のテーブルに一致するデータがある行のみを返します。LEFT JOINは左テーブルの全行を返し、右テーブルに一致がない場合はNULLで埋めます。注文のないユーザーも含めて一覧したい場合はLEFT JOINが適切です。",
    },
    {
      question: "SQLの記述順と実行順が違うのはなぜですか？",
      answer:
        "SQLは宣言的言語であり、記述順（SELECT, FROM, WHERE...）は人間が読みやすい順序で設計されています。一方、データベースはFROM（テーブル特定）から処理を始め、WHERE（絞り込み）、GROUP BY（集計）の順で実行します。この違いを理解するとSELECTで定義したエイリアスがWHEREで使えない理由などが分かります。",
    },
  ],
};
