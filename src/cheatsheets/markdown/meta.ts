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
  trustLevel: "curated",
  valueProposition:
    "Markdown記法を構文と実例で網羅。書き方に迷ったらすぐ引ける",
  usageExample: {
    input: "Markdownで表やコードブロックを書きたいとき",
    output:
      "構文例とレンダリング結果を並べて確認でき、すぐに正しい書き方がわかる",
    description:
      "見出し・リスト・テーブル・コードブロックなど基本から応用まで網羅",
  },
  faq: [
    {
      question:
        "このチートシートはGitHub Flavored Markdown（GFM）にも対応していますか？",
      answer:
        "はい。標準のMarkdown構文に加え、タスクリスト、絵文字ショートコード、脚注、アラート記法などGitHub Flavored Markdownの拡張もカバーしています。",
    },
    {
      question:
        "テーブルのセルを中央揃えや右寄せにするにはどうすればいいですか？",
      answer:
        "テーブルの区切り行でコロンの位置を変えることで配置を指定できます。左寄せは :---、中央揃えは :---:、右寄せは ---: と書きます。詳しくはテーブルのセクションを参照してください。",
    },
    {
      question: "Markdownファイル内でHTMLタグを使うことはできますか？",
      answer:
        "はい。Markdownでは直接HTMLタグを記述できます。画像サイズの指定、テキストの色変更、折りたたみ（details要素）など、Markdown標準では表現できないレイアウトに活用できます。",
    },
  ],
};
