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
  publishedAt: "2026-02-13T19:03:42+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "1970年1月1日 00:00:00 UTC（エポック）からの経過秒数（またはミリ秒数）を入力すると、ローカルタイムゾーンの日時に変換します。逆変換では年・月・日・時・分・秒を入力してUNIXタイムスタンプを取得できます。エポック秒（10桁）とミリ秒（13桁）の両方に対応し、変換はブラウザ上で完結します。",
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
