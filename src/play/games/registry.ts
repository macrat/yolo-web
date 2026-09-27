import type { GameMeta } from "./types";
import { getPlayPath } from "@/play/paths";

const gameEntries: GameMeta[] = [
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    shortDescription: "毎日1つの漢字を推理するパズル",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    icon: "\u{1F4DA}",
    accentColor: "#3d7a2f",
    difficulty: "初級〜中級",
    keywords: ["漢字", "パズル", "デイリー", "推理"],
    statsKey: "kanji-kanaru-stats",
    isDaily: true,
    ogpSubtitle: "毎日の漢字パズル",
    publishedAt: "2026-02-13T19:11:53+09:00",
    updatedAt: "2026-03-01T23:14:37+09:00",
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
    seo: {
      title: "漢字カナール - 毎日の漢字パズル",
      description:
        "毎日1つの漢字を当てるパズルゲーム。6回以内に正解を見つけよう!部首・画数・読みなどのヒントを頼りに推理する、新感覚の漢字クイズです。",
      keywords: [
        "漢字",
        "パズル",
        "クイズ",
        "Wordle",
        "日本語",
        "ゲーム",
        "デイリーゲーム",
        "漢字カナール",
      ],
      ogTitle: "漢字カナール - 毎日の漢字パズル",
      ogDescription:
        "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    },
    summary: "今日の漢字1字を、部首・画数・読みから6回までに当てる",
    legend: {
      name: "盤の印の意味",
      entries: [
        { mark: "◯", meaning: "一致" },
        { mark: "△", meaning: "近い" },
        { mark: "×", meaning: "不一致" },
      ],
    },
    faq: [
      {
        question: "毎日何時に問題が変わりますか？",
        answer: "毎日午前0時（日本時間）に新しい問題が出題されます。",
      },
      {
        question: "出題される漢字の範囲は？",
        answer:
          "常用漢字を中心に出題されます。小学校で習う漢字から高校レベルの漢字まで幅広く登場します。",
      },
      {
        question: "ヒントはどのように表示されますか？",
        answer:
          "推理するごとに、部首の一致・画数の大小・読みの一致など、正解に近づくためのヒントが色で表示されます。",
      },
    ],
    relatedGameSlugs: ["yoji-kimeru", "nakamawake"],
  },
  {
    slug: "yoji-kimeru",
    title: "四字キメル",
    shortDescription: "毎日1つの四字熟語を当てるパズル",
    description:
      "毎日1つの四字熟語を当てるパズルゲーム。4文字の漢字を推理しよう!",
    icon: "\u{1F3AF}",
    accentColor: "#9a8533",
    difficulty: "中級〜上級",
    keywords: ["四字熟語", "パズル", "デイリー", "漢字"],
    statsKey: "yoji-kimeru-stats",
    isDaily: true,
    ogpSubtitle: "毎日の四字熟語パズル",
    publishedAt: "2026-02-14T12:45:55+09:00",
    updatedAt: "2026-03-01T23:14:37+09:00",
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
    seo: {
      title: "四字キメル - 毎日の四字熟語パズル",
      description:
        "毎日1つの四字熟語を当てるパズルゲーム。6回以内に正解を見つけよう!4文字の漢字を入力して、色のフィードバックを頼りに推理する新感覚の四字熟語クイズです。",
      keywords: [
        "四字熟語",
        "パズル",
        "クイズ",
        "Wordle",
        "漢字",
        "日本語",
        "ゲーム",
        "デイリーゲーム",
        "四字キメル",
      ],
      ogTitle: "四字キメル - 毎日の四字熟語パズル",
      ogDescription:
        "毎日1つの四字熟語を当てるパズルゲーム。色のフィードバックで推理しよう!",
    },
    summary: "今日の四字熟語を、1字ずつの当たり外れから6回までに当てる",
    legend: {
      name: "盤の印の意味",
      entries: [
        { mark: "◯", meaning: "正しい位置" },
        { mark: "△", meaning: "別の位置" },
        { mark: "×", meaning: "含まれない" },
      ],
    },
    faq: [
      {
        question: "どんな四字熟語が出題されますか？",
        answer:
          "日常でよく使われる四字熟語から、やや難しめのものまで幅広く出題されます。四字熟語辞典で意味を確認することもできます。",
      },
      {
        question: "漢字カナールとの違いは？",
        answer:
          "漢字カナールは漢字1文字を当てるゲームですが、四字キメルは4文字の四字熟語を当てるゲームです。各文字ごとにフィードバックが表示されます。",
      },
      {
        question: "入力する四字熟語が思いつかない場合はどうすればいいですか？",
        answer:
          "まずは有名な四字熟語から試してみてください。色のフィードバックを手がかりに、使われている漢字を絞り込んでいくのがコツです。",
      },
    ],
    relatedGameSlugs: ["kanji-kanaru", "nakamawake"],
  },
  {
    slug: "nakamawake",
    title: "ナカマワケ",
    shortDescription: "16個の言葉を4グループに分けるパズル",
    description:
      "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう!",
    icon: "\u{1F9E9}",
    accentColor: "#8a5a9a",
    difficulty: "初級〜上級",
    keywords: ["仲間分け", "グループ", "パズル", "言葉"],
    statsKey: "nakamawake-stats",
    isDaily: true,
    ogpSubtitle: "毎日の仲間分けパズル",
    publishedAt: "2026-02-14T23:00:07+09:00",
    updatedAt: "2026-02-21T22:10:47+09:00",
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
    seo: {
      title: "ナカマワケ - 毎日の仲間分けパズル",
      description:
        "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう！日本語・日本文化をテーマにした無料デイリーパズルです。",
      keywords: [
        "仲間分け",
        "グループ分け パズル",
        "Connections 日本語",
        "脳トレ 無料",
        "言葉 パズル",
        "日本語 クイズ",
        "デイリーゲーム",
        "ナカマワケ",
      ],
      ogTitle: "ナカマワケ - 毎日の仲間分けパズル",
      ogDescription:
        "16個の言葉を4つのグループに分けるパズルゲーム。共通テーマを見つけて仲間分けしよう！",
    },
    summary: "今日の16の言葉を、共通点で4組に分ける。4回間違えると終わり",
    legend: {
      name: "盤の数の意味",
      entries: [{ meaning: "グループの難易度1（易しい）〜4（とても難しい）" }],
    },
    faq: [
      {
        question: "間違えたらどうなりますか？",
        answer:
          "間違えるたびに、あと何回間違えられるかが言葉の下に出ます。4回間違えるとその日の問題は終わりで、当てられなかった組とその言葉が結果に出ます。",
      },
      {
        question: "グループの難易度に差はありますか？",
        answer:
          "はい。4つの組には、難易度1（易しい）から難易度4（とても難しい）までの差があります。当てた組には、名前の横に「難易度1」のように難易度が出ます。易しい組から当てていくと残りの言葉が減り、難しい組も見つけやすくなります。",
      },
      {
        question: "毎日問題は変わりますか？",
        answer:
          "はい。毎日0:00（日本時間）に新しい問題に替わります。前の日までの問題を遊び直すことはできません。",
      },
    ],
    relatedGameSlugs: ["kanji-kanaru", "yoji-kimeru", "irodori"],
  },
  {
    slug: "irodori",
    title: "イロドリ",
    shortDescription: "毎日5つの色を作って色彩感覚を鍛えよう",
    description:
      "毎日5つの色を作って色彩感覚を鍛えよう! ターゲットカラーにどれだけ近づけるかチャレンジ!",
    icon: "\u{1F3A8}",
    accentColor: "#c2185b",
    difficulty: "初級〜上級",
    keywords: ["色", "カラー", "色彩", "デイリー"],
    statsKey: "irodori-stats",
    isDaily: true,
    ogpSubtitle: "毎日の色彩チャレンジ",
    publishedAt: "2026-02-19T23:22:13+09:00",
    updatedAt: "2026-03-01T23:14:37+09:00",
    sitemap: { changeFrequency: "monthly", priority: 0.8 },
    seo: {
      title: "イロドリ - 毎日の色彩チャレンジ",
      description:
        "ターゲットカラーにどれだけ近い色を作れるかチャレンジ! HSLスライダーで色を混ぜて、あなたの色彩感覚を試そう。日本の伝統色も登場する無料デイリーゲーム。",
      keywords: [
        "色彩感覚テスト",
        "カラーIQ",
        "色覚テスト 無料",
        "color sense test",
        "色当てゲーム",
        "色彩チャレンジ",
        "デイリーゲーム",
        "イロドリ",
        "伝統色",
      ],
      ogTitle: "イロドリ - 毎日の色彩チャレンジ",
      ogDescription:
        "ターゲットカラーにどれだけ近い色を作れるかチャレンジ! HSLスライダーで色彩感覚を試そう。",
    },
    summary: "今日のお題の5色に近い色を、色相・彩度・明度を動かして作る",
    faq: [
      {
        question: "スコアはどのように計算されますか？",
        answer:
          "ターゲットカラーと作成した色の差（色相・彩度・明度）に基づいてスコアが計算されます。差が小さいほど高スコアになります。",
      },
      {
        question: "日本の伝統色とは何ですか？",
        answer:
          "藍色、朱色、若草色など、日本で古くから使われてきた色の名前と色味のことです。イロドリでは伝統色がターゲットとして出題されることがあります。",
      },
      {
        question: "色覚に特性がある場合も楽しめますか？",
        answer:
          "HSLスライダーの数値を参考にしながら調整することで、色覚特性に関わらずお楽しみいただけます。",
      },
    ],
    relatedGameSlugs: ["nakamawake", "kanji-kanaru", "yoji-kimeru"],
  },
];

/** slug -> GameMeta O(1) lookup */
export const gameBySlug: Map<string, GameMeta> = new Map(
  gameEntries.map((g) => [g.slug, g]),
);

/** All game metadata (display order preserved) */
export const allGameMetas: GameMeta[] = gameEntries;

/** All game slugs */
export function getAllGameSlugs(): string[] {
  return gameEntries.map((g) => g.slug);
}

/** Derive the path for a game from its slug */
export function getGamePath(slug: string): string {
  return getPlayPath(slug);
}
