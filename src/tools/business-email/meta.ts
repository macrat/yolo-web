import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "business-email",
  name: "ビジネスメール作成",
  nameEn: "Business Email Generator",
  description:
    "ビジネスメール作成ツール。お礼・お詫び・依頼・お断り・挨拶の5カテゴリからテンプレートを選び、宛先や用件を入力するだけでメール本文を自動生成。コピーボタンで即利用可能。登録不要・無料のオンラインツールです。",
  shortDescription: "テンプレートからビジネスメールを簡単作成",
  keywords: [
    "ビジネスメール 作成",
    "ビジネスメール テンプレート",
    "ビジネスメール 例文",
    "お礼メール 例文",
    "お詫びメール 書き方",
    "メール 文例 無料",
  ],
  category: "text",
  relatedSlugs: ["keigo-reference", "char-count", "text-replace"],
  publishedAt: "2026-02-21",
  structuredDataType: "WebApplication",
  trustLevel: "curated",
  valueProposition:
    "テンプレートを選んで項目を埋めるだけでビジネスメールが完成する",
  usageExample: {
    input: "カテゴリ: お礼 / テンプレート: 訪問のお礼 / 相手先: 山田様",
    output: "件名: ご訪問のお礼\n本文: お世話になっております。...",
    description: "訪問後のお礼メールをテンプレートから自動生成する例",
  },
  faq: [
    {
      question: "テンプレートの種類はどれくらいありますか？",
      answer:
        "お礼・お詫び・依頼・お断り・挨拶の5カテゴリ、合計12種類のテンプレートを用意しています。訪問のお礼、納期遅延のお詫び、見積依頼など、ビジネスでよく使う場面を網羅しています。",
    },
    {
      question: "生成されたメールの文面は編集できますか？",
      answer:
        "本ツールではテンプレートに項目を入力して本文を生成し、コピーボタンでクリップボードにコピーできます。コピー後にメールソフト上で自由に編集してご利用ください。",
    },
    {
      question: "ビジネスメールで気をつけるべき基本マナーは？",
      answer:
        "宛名の正確な記載、簡潔で明確な件名、冒頭の挨拶と名乗り、用件の簡潔な記述、結びの挨拶が基本です。本ツールのテンプレートはこれらのマナーに沿った構成になっています。",
    },
  ],
};
