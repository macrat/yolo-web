import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "dummy-text",
  name: "ダミーテキスト生成",
  nameEn: "Dummy Text Generator",
  description:
    "ダミーテキスト生成ツール。Lorem Ipsum（英語）と日本語のダミーテキストを段落数・文章数を指定して生成。Webデザインのモックアップ作成に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "英語・日本語のダミーテキストを段落数指定で生成",
  keywords: [
    "ダミーテキスト生成",
    "Lorem Ipsum",
    "ダミーテキスト",
    "日本語ダミーテキスト",
    "テスト文章 生成",
  ],
  category: "generator",
  relatedSlugs: ["password-generator", "char-count", "byte-counter"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
