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
    { id: "setup", title: "初期設定" },
    { id: "basics", title: "基本操作" },
    { id: "branching", title: "ブランチ操作" },
    { id: "remote", title: "リモート操作" },
    { id: "undo", title: "取り消し・修正" },
    { id: "tag", title: "タグ" },
    { id: "advanced", title: "高度な操作" },
    { id: "aliases", title: "よく使うエイリアス設定例" },
  ],
  publishedAt: "2026-02-19",
  trustLevel: "curated",
  valueProposition:
    "よく使うGitコマンドを用途別に整理。コマンドをすぐ見つけられる",
  faq: [
    {
      question: "git rebaseとmergeの違いは何ですか？",
      answer:
        "mergeはブランチの履歴を保持したまま統合しマージコミットを作成します。rebaseはコミットを別のブランチの先端に移動させ、直線的な履歴を作ります。チーム開発ではmergeが安全で、個人の作業ブランチ整理にはrebaseが便利です。",
    },
    {
      question: "直前のコミットメッセージを修正するにはどうすればいいですか？",
      answer:
        'git commit --amend -m "新しいメッセージ" で直前のコミットメッセージを修正できます。ただし、既にリモートにプッシュ済みのコミットを修正すると履歴が変わるため、強制プッシュが必要になります。',
    },
    {
      question:
        "間違えてコミットしたファイルを取り消すにはどうすればいいですか？",
      answer:
        "直前のコミットを取り消すにはgit reset --soft HEAD~1を使います。--softオプションを付けると変更内容はステージングに残るため、修正してから再コミットできます。",
    },
  ],
};
