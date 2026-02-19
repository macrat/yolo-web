import type { CheatsheetMeta } from "../types";

export const meta: CheatsheetMeta = {
  slug: "git",
  name: "Gitコマンドチートシート",
  nameEn: "Git Command Cheatsheet",
  description:
    "Gitの基本コマンドからブランチ操作・リモート操作・リセット・スタッシュまで、よく使うGitコマンドを網羅したチートシート。実例付きで初心者にもわかりやすい。",
  shortDescription: "よく使うGitコマンド一覧",
  keywords: [
    "Git",
    "git コマンド",
    "チートシート",
    "git 使い方",
    "git ブランチ",
    "git reset",
  ],
  category: "devops",
  relatedToolSlugs: [],
  relatedCheatsheetSlugs: ["regex", "markdown"],
  sections: [
    { id: "basics", title: "基本操作" },
    { id: "branching", title: "ブランチ操作" },
    { id: "remote", title: "リモート操作" },
    { id: "history", title: "履歴・差分" },
    { id: "undo", title: "取り消し・リセット" },
    { id: "stash", title: "スタッシュ" },
  ],
  publishedAt: "2026-02-19",
};
