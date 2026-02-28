import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "html-entity",
  name: "HTMLエンティティ変換",
  nameEn: "HTML Entity Encoder/Decoder",
  description:
    "HTMLエンティティ変換ツール。HTML特殊文字のエスケープ・アンエスケープに対応。XSS対策やHTMLソースの確認に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "HTML特殊文字のエスケープ・アンエスケープ",
  keywords: [
    "HTMLエンティティ変換",
    "HTML特殊文字 エスケープ",
    "HTMLエスケープ",
    "HTMLアンエスケープ",
    "HTML文字参照",
  ],
  category: "encoding",
  relatedSlugs: ["url-encode", "base64", "markdown-preview"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "HTML特殊文字を貼り付けるだけでエスケープ・アンエスケープできる",
  usageExample: {
    input: '<div class="main">Hello & World</div>',
    output: "&lt;div class=&quot;main&quot;&gt;Hello &amp; World&lt;/div&gt;",
    description: "HTMLタグを含むテキストをエスケープする例",
  },
  faq: [
    {
      question: "どの文字がエスケープ対象ですか？",
      answer:
        "エスケープ対象はHTMLで特別な意味を持つ5文字です。&は&amp;、<は&lt;、>は&gt;、\"は&quot;、'は&#39;に変換されます。",
    },
    {
      question: "デコード時に数値文字参照にも対応していますか？",
      answer:
        "はい。&#60;のような10進数参照と&#x3C;のような16進数参照の両方に対応しています。また&amp;や&copy;などの名前付きエンティティも主要なものをサポートしています。",
    },
    {
      question: "XSS対策としてこのツールは使えますか？",
      answer:
        "このツールはHTMLエンティティの変換確認用です。実際のXSS対策にはサーバーサイドでのサニタイズ処理やフレームワークの自動エスケープ機能を利用してください。",
    },
  ],
};
