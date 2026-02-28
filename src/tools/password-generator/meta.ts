import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "password-generator",
  name: "パスワード生成",
  nameEn: "Password Generator",
  description:
    "安全なパスワードを生成するツール。文字数、大文字・小文字・数字・記号の組み合わせを指定可能。暗号学的に安全な乱数を使用。登録不要・無料。",
  shortDescription: "安全なランダムパスワードを生成",
  keywords: [
    "パスワード生成",
    "パスワード作成",
    "ランダムパスワード",
    "安全なパスワード",
    "パスワードジェネレーター",
  ],
  category: "security",
  relatedSlugs: ["hash-generator", "qr-code", "email-validator"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "条件を選んでボタンを押すだけで安全なパスワードを即座に生成できる",
  usageExample: {
    input: "16文字、大文字・小文字・数字・記号すべて含む",
    output: "aB3$kL9&mP2!xQ7#",
    description: "デフォルト設定で生成されるパスワードの例",
  },
  faq: [
    {
      question: "生成できるパスワードの最大文字数はいくつですか？",
      answer:
        "最小8文字から最大128文字までのパスワードを生成できます。スライダーで文字数を自由に調整できます。",
    },
    {
      question: "紛らわしい文字を除外する機能とは何ですか？",
      answer:
        "O（大文字オー）と0（ゼロ）、I（大文字アイ）とl（小文字エル）と1（数字のイチ）など、見間違えやすい文字をパスワードから除外する機能です。手書きで控える場合などに便利です。",
    },
    {
      question: "生成されたパスワードはサーバーに送信されますか？",
      answer:
        "いいえ。パスワードの生成はすべてブラウザ上で行われ、暗号学的に安全な乱数（crypto.getRandomValues）を使用しています。生成されたパスワードがサーバーに送信されることはありません。",
    },
  ],
};
