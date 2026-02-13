import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "fullwidth-converter",
  name: "全角半角変換",
  nameEn: "Fullwidth/Halfwidth Converter",
  description:
    "全角半角変換ツール。英数字やカタカナの全角・半角を相互変換。テキストの一括変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "英数字・カタカナの全角半角を相互変換",
  keywords: [
    "全角半角変換",
    "全角 半角 変換",
    "カタカナ 半角変換",
    "半角カタカナ変換",
    "全角英数字変換",
  ],
  category: "text",
  relatedSlugs: ["char-count", "text-replace", "text-diff"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
};
