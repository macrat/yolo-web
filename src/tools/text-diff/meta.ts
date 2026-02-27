import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "text-diff",
  name: "テキスト差分比較",
  nameEn: "Text Diff",
  description:
    "2つのテキストの差分を比較表示するツール。行単位・単語単位・文字単位の比較モードに対応。変更箇所がハイライト表示されます。登録不要・無料。",
  shortDescription: "2つのテキストの差分をハイライト表示",
  keywords: ["テキスト比較", "差分比較", "diff", "テキスト差分", "文章比較"],
  category: "text",
  relatedSlugs: ["char-count", "json-formatter"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
};
