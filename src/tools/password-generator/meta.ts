import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "password-generator",
  name: "パスワード生成",
  nameEn: "Password Generator",
  description:
    "安全なパスワードを生成するツール。文字数、大文字・小文字・数字・記号の組み合わせを指定可能。暗号学的に安全な乱数を使用。登録不要・無料。",
  shortDescription: "安全なランダムパスワードを生成",
  keywords: [
    "パスワード生成",
    "パスワード作成",
    "ランダムパスワード",
    "安全なパスワード",
    "パスワードジェネレーター",
  ],
  category: "security",
  relatedSlugs: ["hash-generator", "qr-code", "email-validator"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
};
