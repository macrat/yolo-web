import type { GameMeta } from "./types";

const gameEntries: GameMeta[] = [
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    shortDescription: "毎日1つの漢字を推理するパズル",
    description:
      "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう!",
    icon: "\u{1F4DA}",
    accentColor: "#4d8c3f",
    difficulty: "初級〜中級",
    keywords: ["漢字", "パズル", "デイリー", "推理"],
    statsKey: "kanji-kanaru-stats",
    ogpSubtitle: "毎日の漢字パズル",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
    trustLevel: "curated",
    trustNote: "ゲームの正解判定は正確です。パズルデータはAIが作成しています。",
    valueProposition:
      "毎日1つの漢字を推理。部首・画数・読みのヒントで正解を導く",
    usageExample: {
      input: "漢字1文字を入力して推理開始",
      output: "部首・画数・読みのヒントが表示され、6回以内に正解を目指す",
      description: "Wordleのように毎日問題が変わるデイリーパズルです",
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
    ogpSubtitle: "毎日の四字熟語パズル",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
    trustLevel: "curated",
    trustNote: "ゲームの正解判定は正確です。パズルデータはAIが作成しています。",
    valueProposition:
      "毎日1つの四字熟語を当てる。4文字の漢字を推理する新感覚パズル",
    usageExample: {
      input: "四字熟語を1つ入力して推理開始",
      output: "各文字の正誤が色で表示され、6回以内に正解を目指す",
      description: "漢字カナールの四字熟語版。より高い語彙力が試されます",
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
    ogpSubtitle: "毎日の仲間分けパズル",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
    trustLevel: "curated",
    trustNote: "ゲームの正解判定は正確です。パズルデータはAIが作成しています。",
    valueProposition:
      "16個の言葉を4グループに仲間分け。共通テーマを見抜く推理パズル",
    usageExample: {
      input: "16個の言葉から同じグループの4語を選択",
      output:
        "正解するとグループのテーマが表示される。全4グループの解明を目指す",
      description: "NYT Connectionsにインスパイアされた日本語版パズルです",
    },
    faq: [
      {
        question: "間違えたらどうなりますか？",
        answer:
          "間違えるとライフが1つ減ります。ライフがなくなるとゲームオーバーです。慎重に選んでください。",
      },
      {
        question: "グループの難易度に差はありますか？",
        answer:
          "はい。4つのグループには難易度の違いがあり、色で区別されています。簡単なグループから解くのがおすすめです。",
      },
      {
        question: "毎日問題は変わりますか？",
        answer:
          "はい。毎日午前0時（日本時間）に新しい問題が出題されます。過去の問題に再挑戦することはできません。",
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
    accentColor: "#e91e63",
    difficulty: "初級〜上級",
    keywords: ["色", "カラー", "色彩", "デイリー"],
    statsKey: "irodori-stats",
    ogpSubtitle: "毎日の色彩チャレンジ",
    sitemap: { changeFrequency: "daily", priority: 0.8 },
    trustLevel: "verified",
    valueProposition:
      "毎日5つのターゲットカラーを再現。HSLスライダーで色彩感覚に挑戦",
    usageExample: {
      input: "HSLスライダーでターゲットに近い色を作成",
      output:
        "ターゲットとの類似度がスコアで表示。5色の平均スコアで結果が決まる",
      description: "日本の伝統色も登場する色彩感覚テストです",
    },
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
  return `/games/${slug}`;
}
