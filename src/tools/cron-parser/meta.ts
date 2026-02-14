import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "cron-parser",
  name: "Cron式解析",
  nameEn: "Cron Parser",
  description:
    "Cron式解析ツール。Cron式を入力して人間が読める日本語説明に変換。次回実行予定の表示やCron式ビルダー機能も搭載。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "Cron式の解析・日本語説明・ビルダー",
  keywords: [
    "cron 書き方",
    "crontab 設定",
    "cron式 解析",
    "cron ジェネレーター",
    "cron 確認",
  ],
  category: "developer",
  relatedSlugs: ["unix-timestamp", "date-calculator", "regex-tester"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
