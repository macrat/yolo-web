import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "byte-counter",
  name: "バイト数計算",
  nameEn: "Byte Counter",
  description:
    "バイト数計算ツール。UTF-8エンコーディングでのバイト数をリアルタイムで計算。文字数・行数・単語数も同時表示。データベースやAPIの文字数制限の確認に便利。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "UTF-8バイト数をリアルタイム計算、文字数・行数も表示",
  keywords: [
    "バイト数計算",
    "UTF-8 バイト数",
    "バイト数 カウント",
    "文字数 バイト数",
    "バイト数計算 オンライン",
  ],
  category: "text",
  relatedSlugs: ["char-count", "dummy-text", "text-replace", "unit-converter"],
  publishedAt: "2026-02-14T07:56:36+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "入力テキストをUTF-8エンコーディングでバイト列に変換し、バイト数をリアルタイムにカウントします。ASCII英数字は1バイト、日本語（ひらがな・カタカナ・漢字）は3バイト、絵文字は4バイトとして計算します。文字数・行数も同時にカウントし、すべての処理はブラウザ上で完結します。",
  faq: [
    {
      question: "対応しているエンコーディングはUTF-8だけですか？",
      answer:
        "はい。本ツールはUTF-8エンコーディングでのバイト数を計算します。Shift_JISやEUC-JPなど他のエンコーディングには対応していません。",
    },
    {
      question: "バイト構成の内訳は何を意味していますか？",
      answer:
        "UTF-8では文字によってバイト数が異なります。ASCII英数字は1バイト、日本語のひらがな・カタカナ・漢字は3バイト、絵文字は4バイトです。内訳表示で各カテゴリの文字数を確認できます。",
    },
    {
      question: "絵文字のバイト数も正しく計算されますか？",
      answer:
        "はい。サロゲートペアを含む絵文字も正しくカウントされます。UTF-8では絵文字は通常4バイトとして計算されます。",
    },
  ],
};
