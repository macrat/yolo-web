import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "date-calculator",
  name: "日付計算",
  nameEn: "Date Calculator",
  description:
    "日付計算ツール。2つの日付の日数差分、日付に日数を加算・減算、和暦・西暦変換に対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "日付の差分計算・加減算・和暦変換",
  keywords: [
    "日付計算",
    "日数計算",
    "日付 差分",
    "和暦 西暦 変換",
    "日付 加算 減算",
  ],
  category: "developer",
  relatedSlugs: [
    "unix-timestamp",
    "number-base-converter",
    "char-count",
    "unit-converter",
    "age-calculator",
    "cron-parser",
  ],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition: "日付を入力するだけで差分・加減算・和暦変換ができる",
  usageExample: {
    input: "2025-01-01 から 2025-12-31",
    output: "364日（0年11ヶ月30日）",
    description: "2つの日付の差分を計算する例",
  },
  faq: [
    {
      question: "対応している和暦の範囲はどこまでですか？",
      answer:
        "明治（1868年）から令和まで対応しています。明治以前の日付は和暦変換の対象外です。西暦から和暦、和暦から西暦の双方向変換が可能です。",
    },
    {
      question: "日付の加算・減算では営業日計算もできますか？",
      answer:
        "いいえ、現在は暦日（カレンダー上の日数）での加算・減算のみ対応しています。土日・祝日を除いた営業日計算には対応していません。",
    },
    {
      question: "日付の差分で表示される「月数」はどう計算されますか？",
      answer:
        "暦上の月を基準に計算しています。例えば1月31日から3月1日は1ヶ月1日となります。月の日数の違い（28日・30日・31日）を考慮した正確な計算です。",
    },
  ],
};
