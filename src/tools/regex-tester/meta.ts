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
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
};
