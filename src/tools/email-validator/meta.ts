import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "email-validator",
  name: "メールアドレスバリデーター",
  nameEn: "Email Address Validator",
  description:
    "メールアドレスの形式チェックツール。RFC準拠のバリデーション、ローカルパート・ドメインの詳細分析、よくあるミスの検出に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "メールアドレスの形式を検証・分析",
  keywords: [
    "メールアドレス チェック",
    "メール バリデーション",
    "メールアドレス 確認",
    "email 検証",
    "メールアドレス 正規表現",
  ],
  category: "developer",
  relatedSlugs: ["regex-tester", "url-encode", "password-generator"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "メールアドレスを入力するだけで形式チェックとエラー検出ができる",
  usageExample: {
    input: "user@gmial.com",
    output: "有効 / 候補: user@gmail.com",
    description: "ドメインのタイプミスを検出して正しい候補を提案する例",
  },
  faq: [
    {
      question: "実際にメールが届くかどうかも確認できますか？",
      answer:
        "いいえ、このツールはメールアドレスの形式（構文）チェックのみ行います。メールサーバーへの到達確認や受信可否の検証は行いません。形式が正しくても実在しないアドレスの場合があります。",
    },
    {
      question: "どのようなエラーを検出できますか？",
      answer:
        "ローカルパートやドメインの長さ超過、先頭・末尾のドット、連続ドット、使用不可文字、TLDの欠落など、RFC準拠のチェックを行います。また、gmailやyahooなどのよくあるドメインのタイプミスも検出します。",
    },
    {
      question: "日本語のメールアドレスには対応していますか？",
      answer:
        "いいえ、国際化メールアドレス（日本語ドメインや日本語ローカルパート）には対応していません。ASCII文字で構成された標準的なメールアドレスの検証に対応しています。",
    },
  ],
};
