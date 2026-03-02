import type { CheatsheetMeta } from "../types";

export const meta: CheatsheetMeta = {
  slug: "html-tags",
  name: "HTMLタグ チートシート",
  nameEn: "HTML Tags Cheatsheet",
  description:
    "HTMLタグの一覧チートシート。基本構造・セクション・テキスト・フォーム・テーブル・メディアなど用途別に約70タグを収録。セマンティクスの使い分けガイド付きで、SEO・アクセシビリティ観点も解説。",
  shortDescription: "用途別HTML全タグの意味と使い分けガイド",
  keywords: [
    "HTMLタグ 一覧",
    "HTMLタグ チートシート",
    "HTML 要素",
    "セマンティックHTML",
    "HTML5 タグ",
    "HTML 使い分け",
    "HTML SEO",
    "HTML フォーム",
    "HTML テーブル",
  ],
  category: "developer",
  relatedToolSlugs: ["html-entity"],
  relatedCheatsheetSlugs: ["markdown", "http-status-codes"],
  sections: [
    { id: "basic-structure", title: "基本構造" },
    { id: "sectioning", title: "セクション・ページ構造" },
    { id: "text-content", title: "テキストコンテンツ" },
    { id: "inline-text", title: "インラインテキスト" },
    { id: "table", title: "テーブル" },
    { id: "form", title: "フォーム" },
    { id: "media", title: "画像・メディア" },
    { id: "meta-seo", title: "メタ情報・SEO" },
    { id: "semantic-guide", title: "セマンティクス使い分けガイド" },
  ],
  publishedAt: "2026-03-02T09:10:04+09:00",
  trustLevel: "curated",
  valueProposition:
    "約70のHTMLタグを用途別に整理。セマンティクスの使い分けもわかる",
  usageExample: {
    input: "sectionとarticleとdivの使い分けに迷ったとき",
    output: "用途ごとの比較表で適切なタグをすぐ判断できる",
    description: "セマンティクスガイドで混乱しやすいタグの違いを解説",
  },
  faq: [
    {
      question: "sectionとarticleとdivはどう使い分けますか？",
      answer:
        "articleは独立して意味をなすコンテンツ（ブログ記事やニュース記事など）に使います。sectionはページ内の意味的なまとまり（章・節）に使い、通常は見出しを伴います。divは意味を持たない汎用コンテナで、スタイリング目的のみの場合に使います。",
    },
    {
      question: "strongタグとbタグの違いは何ですか？",
      answer:
        "strongは意味的に「重要な内容」を示し、スクリーンリーダーが強調して読み上げます。bは視覚的に太字にするだけで意味的な強調はありません。SEOやアクセシビリティを考慮する場合はstrongを使います。",
    },
    {
      question: "HTMLのmetaタグでSEOに重要なものはどれですか？",
      answer:
        "最も重要なのはmeta descriptionで、検索結果のスニペットに表示されます。次にviewport設定（モバイル対応）、charset指定（文字化け防止）が必須です。OGPタグ（og:title, og:image等）はSNSシェア時の表示に影響します。",
    },
    {
      question:
        "HTML5で追加されたセマンティックタグにはどんなものがありますか？",
      answer:
        "主なものはheader, footer, nav, main, article, section, aside, figure, figcaption, time, mark, details, summaryなどです。これらを使うことで文書構造が明確になり、SEOやアクセシビリティが向上します。",
    },
  ],
};
