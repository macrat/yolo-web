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
  trustLevel: "curated",
  valueProposition: "正規表現パターンをすぐ引き出せる。実例付きで意味がわかる",
  usageExample: {
    input: "[0-9]+",
    output: "電話番号 090-1234-5678 から数字部分 090, 1234, 5678 を抽出",
    description: "数字の連続にマッチするパターンの使用例",
  },
  faq: [
    {
      question: "JavaScriptとPythonで正規表現の文法に違いはありますか？",
      answer:
        "基本的な構文は共通ですが、一部違いがあります。例えばJavaScriptでは後読み（lookbehind）のサポートが比較的新しく、Pythonには名前付きグループの記法に(?P<name>...)という独自の書き方があります。また、Pythonにはre.VERBOSEフラグでコメント付き正規表現が書ける機能があります。",
    },
    {
      question: "全角文字にマッチさせるにはどうすればいいですか？",
      answer:
        "Unicodeの範囲指定を使います。例えば全角ひらがなは[\\u3040-\\u309F]、全角カタカナは[\\u30A0-\\u30FF]、漢字は[\\u4E00-\\u9FFF]でマッチできます。JavaScriptではUnicodeプロパティエスケープ（\\p{Script=Hiragana}）も利用可能です。",
    },
    {
      question: "正規表現のパフォーマンスが悪い場合はどうすればいいですか？",
      answer:
        "ネストした量指定子（例: (a+)+）や過度なバックトラッキングが原因のことが多いです。具体的な文字クラスを使う、不要なキャプチャグループを非キャプチャ（?:...）に変える、アンカー（^や$）を活用するなどの対策が有効です。",
    },
  ],
};
