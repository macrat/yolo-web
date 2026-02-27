import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "email-validator",
  name: "メールアドレスバリデーター",
  nameEn: "Email Address Validator",
  description:
    "メールアドレスの形式チェックツール。RFC準拠のバリデーション、ローカルパート・ドメインの詳細分析、よくあるミスの検出に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "メールアドレスの形式を検証・分析",
  keywords: [
    "メールアドレス チェック",
    "メール バリデーション",
    "メールアドレス 確認",
    "email 検証",
    "メールアドレス 正規表現",
  ],
  category: "developer",
  relatedSlugs: ["regex-tester", "url-encode", "password-generator"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
