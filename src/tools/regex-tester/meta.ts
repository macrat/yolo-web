import type { ToolMeta } from "@/tools/types";

/** 正規表現テスターのサンプル入力。
 * タイル UI と詳細ページの両方から参照する単一 SSoT として定義（T-2 論点 15 案 D-改 1）。
 * cycle-215 で 6 種定義。
 */
export interface RegexSampleInput {
  /** ドロップダウンに表示するラベル */
  label: string;
  /** 正規表現パターン文字列 */
  pattern: string;
  /** フラグ文字列 (例: "g", "gi") */
  flags: string;
  /** サンプルテストテキスト */
  testText: string;
}

/**
 * 正規表現テスターのサンプル入力 6 種（論点 15 案 D-改 1 採択 / cycle-215 T-2）。
 * タイル `<select>` 6 種 + 詳細ページドロップダウン 6 種で同一定数を参照する。
 */
export const REGEX_SAMPLE_INPUTS: RegexSampleInput[] = [
  {
    label: "メールアドレス",
    pattern: "[\\w.-]+@[\\w.-]+\\.\\w+",
    flags: "g",
    testText: "お問い合わせ: support@example.com、admin@yolos.net",
  },
  {
    label: "URL",
    pattern: "https?://[\\w./\\-?=&%]+",
    flags: "g",
    testText: "参考: https://example.com/path?query=1 と http://yolos.net",
  },
  {
    label: "電話番号（日本）",
    pattern: "0\\d{1,4}-\\d{1,4}-\\d{4}",
    flags: "g",
    testText: "連絡先 03-1234-5678 / 携帯 090-1234-5678",
  },
  {
    label: "郵便番号",
    pattern: "\\d{3}-\\d{4}",
    flags: "g",
    testText: "〒100-0001 東京都千代田区",
  },
  {
    label: "日付 (YYYY-MM-DD)",
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    flags: "g",
    testText: "日付: 2026-05-29 開始、2026-12-31 終了",
  },
  {
    label: "HTML タグ",
    pattern: "<[^>]+>",
    flags: "g",
    testText: "<p>テキスト</p><br>",
  },
];

export const meta: ToolMeta = {
  slug: "regex-tester",
  name: "正規表現テスター",
  nameEn: "Regex Tester",
  description:
    "正規表現のテスト・デバッグツール。パターンマッチの件数と一致箇所をリアルタイムで一覧表示。フラグ設定、置換機能、サンプル6種に対応。登録不要・無料で使えます。",
  shortDescription: "正規表現のテスト・マッチ確認",
  keywords: [
    "正規表現",
    "正規表現テスト",
    "regex",
    "正規表現チェック",
    "パターンマッチ",
  ],
  category: "developer",
  relatedSlugs: ["json-formatter", "text-diff", "email-validator"],
  publishedAt: "2026-02-13T19:03:42+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "JavaScriptの正規表現エンジンでパターンマッチを実行し、マッチした箇所の位置・テキスト・キャプチャグループをリアルタイムで一覧表示します。g・i・m・sの各フラグに対応し、キャプチャグループ参照（$1など）を使った置換もリアルタイムで確認できます。テスト文字列は最大10,000文字、マッチ結果は最大1,000件まで対応します。",
  faq: [
    {
      question: "テスト文字列の長さに上限はありますか？",
      answer:
        "テスト文字列は最大10,000文字まで入力できます。通常のテストやデバッグ用途であれば十分な長さです。マッチ結果は最大1,000件まで表示されます。",
    },
    {
      question: "どのようなフラグが使えますか？",
      answer:
        "g（全てのマッチを検索）、i（大文字小文字を区別しない）、m（^/$を各行に適用）、s（. が改行を含む全文字にマッチ）の4種類に対応しています。各フラグの説明を確認しながらチェックボックスで切り替えられます。",
    },
    {
      question: "正規表現の置換機能はどのように使いますか？",
      answer:
        "「置換を表示」ボタンをクリックすると置換入力欄が表示されます。置換文字列には$1などのキャプチャグループ参照も使用でき、リアルタイムで置換結果を確認できます。",
    },
  ],
};
