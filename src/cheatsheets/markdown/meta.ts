import type { CheatsheetMeta } from "../types";

export const meta: CheatsheetMeta = {
  slug: "markdown",
  name: "Markdownチートシート",
  nameEn: "Markdown Cheatsheet",
  description:
    "Markdownの書き方を網羅したチートシート。見出し・リスト・リンク・画像・テーブル・コードブロック・引用など基本構文から応用まで実例付きで解説。",
  shortDescription: "Markdown記法の基本と応用",
  keywords: [
    "Markdown",
    "マークダウン",
    "チートシート",
    "Markdown 書き方",
    "Markdown 記法",
    "Markdown 表",
  ],
  category: "writing",
  relatedToolSlugs: ["markdown-preview"],
  relatedCheatsheetSlugs: ["regex", "git"],
  sections: [
    { id: "headings", title: "見出し" },
    { id: "text-formatting", title: "テキスト装飾" },
    { id: "lists", title: "リスト" },
    { id: "links-images", title: "リンク・画像" },
    { id: "code", title: "コード" },
    { id: "tables", title: "テーブル" },
    { id: "blockquotes", title: "引用" },
    { id: "horizontal-rules", title: "水平線" },
    { id: "html-embed", title: "HTMLの埋め込み" },
    { id: "gfm-extensions", title: "GitHub Flavored Markdown拡張" },
  ],
  publishedAt: "2026-02-19",
};
