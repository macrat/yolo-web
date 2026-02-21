import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "business-email",
  name: "ビジネスメール作成",
  nameEn: "Business Email Generator",
  description:
    "ビジネスメール作成ツール。お礼・お詫び・依頼・お断り・挨拶の5カテゴリからテンプレートを選び、宛先や用件を入力するだけでメール本文を自動生成。コピーボタンで即利用可能。登録不要・無料のオンラインツールです。",
  shortDescription: "テンプレートからビジネスメールを簡単作成",
  keywords: [
    "ビジネスメール 作成",
    "ビジネスメール テンプレート",
    "ビジネスメール 例文",
    "お礼メール 例文",
    "お詫びメール 書き方",
    "メール 文例 無料",
  ],
  category: "text",
  relatedSlugs: ["keigo-reference", "char-count", "text-replace"],
  publishedAt: "2026-02-21",
  structuredDataType: "WebApplication",
};
