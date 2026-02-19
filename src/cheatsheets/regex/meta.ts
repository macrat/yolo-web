import type { CheatsheetMeta } from "../types";

export const meta: CheatsheetMeta = {
  slug: "regex",
  name: "正規表現チートシート",
  nameEn: "Regex Cheatsheet",
  description:
    "正規表現（Regular Expression）の基本構文・メタ文字・量指定子・アンカー・グループ・先読み後読みなどを網羅したチートシート。実例付きでわかりやすく解説。",
  shortDescription: "正規表現の基本構文と実例集",
  keywords: [
    "正規表現",
    "regex",
    "チートシート",
    "正規表現 一覧",
    "正規表現 書き方",
    "メタ文字",
  ],
  category: "developer",
  relatedToolSlugs: ["regex-tester"],
  relatedCheatsheetSlugs: ["git", "markdown"],
  sections: [
    { id: "metacharacters", title: "基本メタ文字" },
    { id: "quantifiers", title: "量指定子" },
    { id: "character-classes", title: "文字クラス" },
    { id: "anchors", title: "アンカー" },
    { id: "groups", title: "グループとキャプチャ" },
    { id: "lookaround", title: "先読みと後読み" },
    { id: "flags", title: "フラグ" },
    { id: "common-patterns", title: "よく使うパターン例" },
  ],
  publishedAt: "2026-02-19",
};
