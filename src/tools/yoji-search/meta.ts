import type { ToolMeta } from "@/tools/types";
import { YOJI_COUNT } from "./logic";

export const meta: ToolMeta = {
  slug: "yoji-search",
  name: "四字熟語検索",
  nameEn: "Yoji Jukugo Search",
  description: `四字熟語検索ツール。${YOJI_COUNT}語の四字熟語を読み・意味・カテゴリ・難易度で即座に検索。各語の意味・読み・例文・出典を確認できます。登録不要・無料で使えるオンラインツールです。`,
  shortDescription: `${YOJI_COUNT}語の四字熟語を読み・意味で検索`,
  keywords: [
    "四字熟語 検索",
    "四字熟語 意味",
    "四字熟語 一覧",
    "四字熟語 読み方",
    "四字熟語 使い方",
    "四字熟語 カテゴリ",
    "四字熟語 難易度",
    "yoji jukugo",
  ],
  category: "text",
  relatedSlugs: ["keigo-reference", "kana-converter", "char-count"],
  publishedAt: "2026-06-13T19:31:45+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "curated",
  howItWorks: `${YOJI_COUNT}語の四字熟語データベースから、テキスト入力・カテゴリ・難易度・出典で絞り込んで検索します。検索はブラウザ上で即座に処理され、入力した内容が外部に送信されることはありません。各四字熟語には読み・意味・例文・出典・構造パターンが収録されています。`,
  faq: [
    {
      question: "収録されている四字熟語は何語ですか？",
      answer: `${YOJI_COUNT}語の四字熟語が収録されています。人生・努力・変化・自然・美徳・感情・知識・社会・対立/闘い・否定的の10カテゴリに分類されており、初級・中級・上級の3段階の難易度で絞り込めます。`,
    },
    {
      question: "検索するとデータが外部に送信されますか？",
      answer:
        "いいえ。検索はすべてブラウザ上で処理されます。入力した文字や検索条件が外部のサーバーに送信されることはありません。",
    },
    {
      question: "どのような条件で検索できますか？",
      answer:
        "四字熟語の漢字・ひらがな読み・意味のテキスト検索に加えて、カテゴリ（10種）・難易度（初級/中級/上級）・出典（日本/中国/不明）で絞り込めます。",
    },
  ],
};
