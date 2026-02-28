import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "unix-timestamp",
  name: "UNIXタイムスタンプ変換",
  nameEn: "Unix Timestamp Converter",
  description:
    "UNIXタイムスタンプと日時の相互変換ツール。現在時刻の取得、タイムゾーン表示に対応。エポック秒・ミリ秒の両方をサポート。登録不要・無料。",
  shortDescription: "UNIXタイムスタンプと日時を相互変換",
  keywords: [
    "UNIXタイムスタンプ",
    "タイムスタンプ変換",
    "エポック秒",
    "日時変換",
    "Unix time",
  ],
  category: "developer",
  relatedSlugs: ["hash-generator", "base64", "cron-parser", "age-calculator"],
  publishedAt: "2026-02-13",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition: "タイムスタンプを入力するだけで日時との相互変換ができる",
  usageExample: {
    input: "1700000000",
    output: "2023/11/15 07:13:20 (JST)",
    description: "UNIXタイムスタンプからローカル日時へ変換する例",
  },
  faq: [
    {
      question: "秒とミリ秒のどちらで入力すればよいですか？",
      answer:
        "デフォルトは秒単位です。ミリ秒単位のタイムスタンプを変換したい場合は「ミリ秒」チェックボックスをオンにしてから変換してください。13桁の数値はミリ秒、10桁の数値は秒であることが多いです。",
    },
    {
      question: "日時からタイムスタンプに変換できますか？",
      answer:
        "はい。「日時→タイムスタンプ」セクションで年・月・日・時・分・秒を入力して変換ボタンを押すと、秒とミリ秒の両方のタイムスタンプが表示されます。",
    },
    {
      question: "UNIXタイムスタンプの基準はいつですか？",
      answer:
        "1970年1月1日 00:00:00 UTC（協定世界時）が基準（エポック）です。この時点を0として、経過した秒数で時刻を表現します。",
    },
  ],
};
