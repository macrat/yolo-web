import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "markdown-preview",
  name: "Markdownプレビュー",
  nameEn: "Markdown Preview",
  description:
    "Markdownプレビューツール。Markdownテキストをリアルタイムでプレビュー表示。見出し、リスト、テーブル、コードブロック等に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "MarkdownテキストをリアルタイムでHTML表示",
  keywords: [
    "Markdown プレビュー",
    "マークダウン エディタ オンライン",
    "Markdownプレビュー",
    "Markdown変換",
    "Markdownエディタ",
  ],
  category: "developer",
  relatedSlugs: [
    "json-formatter",
    "html-entity",
    "regex-tester",
    "yaml-formatter",
  ],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "Markdownを入力するだけでリアルタイムにプレビュー表示できる",
  usageExample: {
    input: "# 見出し\n- リスト項目\n**太字**テキスト",
    output: "見出し・リスト・太字が反映されたHTMLプレビュー",
    description: "Markdown記法をリアルタイムでHTML表示する例",
  },
  faq: [
    {
      question: "入力できるMarkdownの最大文字数はありますか？",
      answer:
        "最大50,000文字まで入力できます。通常のドキュメントであれば問題なく利用できます。",
    },
    {
      question: "テーブルやコードブロックも表示できますか？",
      answer:
        "はい。GitHub Flavored Markdownに対応しており、テーブル、コードブロック、チェックリスト、取り消し線なども正しく表示されます。",
    },
    {
      question: "入力したMarkdownのHTMLはサニタイズされますか？",
      answer:
        "はい。scriptタグなどの危険なHTMLは自動的に除去されます。安全なタグと属性のみがホワイトリスト方式で許可されるため、安心して利用できます。",
    },
  ],
};
