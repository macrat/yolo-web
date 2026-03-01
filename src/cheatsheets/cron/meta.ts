import type { CheatsheetMeta } from "../types";

export const meta: CheatsheetMeta = {
  slug: "cron",
  name: "Cron式チートシート",
  nameEn: "Cron Expression Cheatsheet",
  description:
    "Cron式（crontab）の書き方を網羅したチートシート。5フィールドの基本構文・特殊文字（*, /, -, ,）・@dailyなどのショートカット・よく使うパターン・プラットフォーム別の違いまで実例付きで解説。",
  shortDescription: "Cron式の構文・特殊文字・パターン集",
  keywords: [
    "cron 書き方",
    "crontab チートシート",
    "cron式 一覧",
    "cron 特殊文字",
    "cronジョブ スケジュール",
    "cron 使い方",
  ],
  category: "devops",
  relatedToolSlugs: ["cron-parser"],
  relatedCheatsheetSlugs: ["git", "http-status-codes"],
  sections: [
    { id: "format", title: "基本フォーマット" },
    { id: "special-chars", title: "特殊文字" },
    { id: "shortcuts", title: "特殊文字列（ショートカット）" },
    { id: "patterns", title: "よく使うパターン" },
    { id: "examples", title: "実用例" },
    { id: "platforms", title: "プラットフォーム別の注意点" },
  ],
  publishedAt: "2026-03-01",
  trustLevel: "curated",
  valueProposition: "Cron式の構文と実用パターンをすぐ引ける",
  usageExample: {
    input: "0 9 * * 1-5",
    output: "平日（月〜金）の午前9時に実行",
    description: "Cron式の意味をフィールドごとに確認できる",
  },
  faq: [
    {
      question: "crontabとcronの違いは何ですか？",
      answer:
        "cronはスケジュールされたタスクを自動実行するUnix/Linuxのデーモン（サービス）です。crontabはそのスケジュール設定ファイルのことで、「crontab -e」コマンドで編集できます。",
    },
    {
      question: "GitHub ActionsのcronとLinuxのcrontabは同じ書き方ですか？",
      answer:
        "基本的な5フィールド形式（分・時・日・月・曜日）は共通です。ただしGitHub Actionsはタイムゾーンが常にUTCで、最短5分間隔の制限があります。L・W・#などのQuartz拡張記法は使えません。",
    },
    {
      question: "AWSのcron式はLinuxのcrontabと互換性がありますか？",
      answer:
        "互換性はありません。AWS EventBridgeのcron式は「分・時・日・月・曜日・年」の6フィールドで、日フィールドと曜日フィールドの片方に必ず?を使う必要があります。",
    },
  ],
};
