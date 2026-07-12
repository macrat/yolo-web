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
  publishedAt: "2026-02-14T22:39:14+09:00",
  updatedAt: "2026-03-02T12:00:00+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "5フィールド形式（分・時・日・月・曜日）のCron式を解析し、ブラウザ上でわかりやすい日本語の説明に変換します。次回の実行予定日時も計算して表示します。ビルダー機能では各フィールドを個別に入力してCron式を生成することもできます。",
  faq: [
    {
      question: "6フィールドや7フィールドのCron式には対応していますか？",
      answer:
        "標準的な5フィールド形式（分・時・日・月・曜日）のみ対応しています。秒フィールドや年フィールドを含む拡張形式は使用できません。",
    },
    {
      question: "ビルダー機能ではどのようにCron式を作成できますか？",
      answer:
        "「ビルダー」タブに切り替えると、分・時・日・月・曜日の各フィールドを個別に入力できます。各フィールドの説明がリアルタイムで表示され、プリセットも用意されています。",
    },
    {
      question: "曜日フィールドの0と7はどちらも日曜日ですか？",
      answer:
        "はい、0と7はどちらも日曜日を表します。これはcrontabの標準仕様に準拠しています。月曜から金曜を指定する場合は1-5と記述します。",
    },
  ],
};
