import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "regex-tester",
  name: "正規表現テスター",
  nameEn: "Regex Tester",
  description:
    "正規表現のテスト・デバッグツール。パターンマッチのリアルタイムハイライト表示、フラグ設定、置換機能に対応。登録不要・無料で使えます。",
  shortDescription: "正規表現のテスト・マッチ確認",
  keywords: [
    "正規表現",
    "正規表現テスト",
    "regex",
    "正規表現チェック",
    "パターンマッチ",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "text-diff", "email-validator"],
  publishedAt: "2026-02-13T19:03:42+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "JavaScriptの正規表現エンジンでパターンマッチを実行し、マッチした箇所をリアルタイムにハイライト表示します。g・i・m・sの各フラグに対応し、キャプチャグループ参照（$1など）を使った置換もリアルタイムで確認できます。テスト文字列は最大10,000文字、マッチ結果は最大1,000件まで対応します。",
  faq: [
    {
      question: "テスト文字列の長さに上限はありますか？",
      answer:
        "テスト文字列は最大10,000文字まで入力できます。通常のテストやデバッグ用途であれば十分な長さです。マッチ結果は最大1,000件まで表示されます。",
    },
    {
      question: "どのようなフラグが使えますか？",
      answer:
        "g（全体検索）、i（大文字小文字を区別しない）、m（複数行モード）、s（dotAllモード）の4種類のフラグに対応しています。チェックボックスで簡単に切り替えられます。",
    },
    {
      question: "正規表現の置換機能はどのように使いますか？",
      answer:
        "「置換を表示」ボタンをクリックすると置換入力欄が表示されます。置換文字列には$1などのキャプチャグループ参照も使用でき、リアルタイムで置換結果を確認できます。",
    },
  ],
};
