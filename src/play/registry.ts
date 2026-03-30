import type { GameMeta } from "@/play/games/types";
import { allGameMetas } from "@/play/games/registry";
import type { QuizMeta } from "@/play/quiz/types";
import { allQuizMetas } from "@/play/quiz/registry";
import type { PlayContentMeta } from "./types";

/**
 * GameMeta を PlayContentMeta に変換する。
 *
 * - description はトップレベルの description を使用（seo.description は使わない）
 * - contentType / category は "game" 固定
 */
export function gameMetaToPlayContentMeta(gameMeta: GameMeta): PlayContentMeta {
  return {
    slug: gameMeta.slug,
    title: gameMeta.title,
    description: gameMeta.description,
    shortDescription: gameMeta.shortDescription,
    icon: gameMeta.icon,
    accentColor: gameMeta.accentColor,
    keywords: gameMeta.keywords,
    publishedAt: gameMeta.publishedAt,
    updatedAt: gameMeta.updatedAt,
    trustLevel: gameMeta.trustLevel,
    trustNote: gameMeta.trustNote,
    contentType: "game",
    category: "game",
  };
}

/**
 * QuizMeta を PlayContentMeta に変換する。
 *
 * - questionCount は PlayContentMeta に存在しないため変換時に除外する
 * - contentType は "quiz" 固定
 * - category は QuizMeta の category をそのままマッピング（"knowledge" → "knowledge", "personality" → "personality"）
 */
export function quizMetaToPlayContentMeta(quizMeta: QuizMeta): PlayContentMeta {
  return {
    slug: quizMeta.slug,
    title: quizMeta.title,
    shortTitle: quizMeta.shortTitle,
    description: quizMeta.description,
    shortDescription: quizMeta.shortDescription,
    icon: quizMeta.icon,
    accentColor: quizMeta.accentColor,
    keywords: quizMeta.keywords,
    publishedAt: quizMeta.publishedAt,
    updatedAt: quizMeta.updatedAt,
    trustLevel: quizMeta.trustLevel,
    trustNote: quizMeta.trustNote,
    contentType: "quiz",
    category: quizMeta.category,
  };
}

/**
 * Fortune（日替わり占い）用 PlayContentMeta 定数。
 *
 * Fortune は1種のみであり、レジストリ管理するほどではないが、
 * /play 一覧ページ表示のために PlayContentMeta として登録する。
 */
export const fortunePlayContentMeta: PlayContentMeta = {
  slug: "daily",
  title: "今日のユーモア運勢",
  description:
    "AIが毎日生成するユーモラスな運勢診断。今日のあなたの運勢は一体どんな形?",
  shortDescription: "AIが毎日生成するユーモラスな運勢",
  icon: "🔮",
  accentColor: "#7c3aed",
  keywords: ["運勢", "占い", "デイリー", "ユーモア", "AI"],
  publishedAt: "2026-02-01T00:00:00+09:00",
  trustLevel: "generated",
  contentType: "fortune",
  category: "fortune",
};

/**
 * 毎日新しい問題/結果が生成されるデイリー更新コンテンツのslug一覧。
 * これらのカードには「毎日更新」バッジを表示してリピート訪問を促す。
 * /play ページとトップページの両方から参照される共有定数。
 */
export const DAILY_UPDATE_SLUGS: ReadonlySet<string> = new Set([
  "daily",
  "kanji-kanaru",
  "yoji-kimeru",
  "nakamawake",
  "irodori",
]);

/** 全 PlayContentMeta の配列（ゲーム4種 + クイズ15種 + Fortune 1種 = 20種、表示順を保持） */
export const allPlayContents: PlayContentMeta[] = [
  ...allGameMetas.map(gameMetaToPlayContentMeta),
  ...allQuizMetas.map(quizMetaToPlayContentMeta),
  fortunePlayContentMeta,
];

/** slug → PlayContentMeta の O(1) ルックアップ */
export const playContentBySlug: Map<string, PlayContentMeta> = new Map(
  allPlayContents.map((c) => [c.slug, c]),
);

/** カテゴリでフィルタリングした PlayContentMeta の配列を返す */
export function getPlayContentsByCategory(
  category: PlayContentMeta["category"],
): PlayContentMeta[] {
  return allPlayContents.filter((c) => c.category === category);
}

/** 全 PlayContent のスラグ配列を返す */
export function getAllPlaySlugs(): string[] {
  return allPlayContents.map((c) => c.slug);
}

/**
 * slug → questionCount のルックアップマップ（クイズの問数表示用）。
 * /play ページとトップページの両方から参照される共有マップ。
 */
export const quizQuestionCountBySlug: Map<string, number> = new Map(
  allQuizMetas.map((q) => [q.slug, q.questionCount]),
);

/**
 * ヒーローセクションのピックアップ3件を自動選出する。
 *
 * 選出ルール:
 * - fortune カテゴリ（daily）は除外
 * - personality, knowledge, game の3カテゴリから各1件ずつ、計3件を選出
 * - 各カテゴリ内の選出基準は publishedAt の新しい順
 */
export function getHeroPickupContents(): PlayContentMeta[] {
  const categories: PlayContentMeta["category"][] = [
    "personality",
    "knowledge",
    "game",
  ];
  return categories.flatMap((cat) => {
    const items = getPlayContentsByCategory(cat);
    const sorted = [...items].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    return sorted.length > 0 ? [sorted[0]] : [];
  });
}

/**
 * 「すべて」タブのデフォルト6件を選出する。
 *
 * 選出ルール:
 * - fortune カテゴリ（daily）は除外
 * - 各カテゴリから最低1件を確保: personality 4件 + knowledge 1件 + game 1件
 * - 各カテゴリ内は publishedAt 新しい順
 */
export function getDefaultTabContents(): PlayContentMeta[] {
  const config: { category: PlayContentMeta["category"]; count: number }[] = [
    { category: "personality", count: 4 },
    { category: "knowledge", count: 1 },
    { category: "game", count: 1 },
  ];
  return config.flatMap(({ category, count }) => {
    const items = getPlayContentsByCategory(category);
    const sorted = [...items].sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
    return sorted.slice(0, count);
  });
}

/**
 * タブUI用に fortune を除く全コンテンツを返す（19件）。
 *
 * fortune カテゴリは FortunePreview セクションで別途表示するため除外する。
 */
export function getNonFortuneContents(): PlayContentMeta[] {
  return allPlayContents.filter((c) => c.category !== "fortune");
}

/**
 * /play ページの「イチオシ」セクションに表示するコンテンツとおすすめ理由のペア。
 * PlayFeaturedItem は内部専用の型（export しない）。
 */
interface PlayFeaturedItem {
  slug: string;
  recommendReason: string;
}

/**
 * PlayContentMeta におすすめ理由を付与した型。
 * /play ページの「イチオシ」セクション表示に使用する。
 */
export interface PlayFeaturedContent extends PlayContentMeta {
  recommendReason: string;
}

/**
 * /play ページ専用 — 「イチオシ」セクションに表示する固定コンテンツとおすすめ理由の一覧。
 * 各コンテンツに訪問者の興味を引くおすすめ理由を付与することで、クリック率向上を図る。
 */
export const PLAY_FEATURED_ITEMS: ReadonlyArray<PlayFeaturedItem> = [
  { slug: "contrarian-fortune", recommendReason: "ひと味違う運勢診断" },
  {
    slug: "unexpected-compatibility",
    recommendReason: "友達にシェアしたくなる",
  },
  { slug: "traditional-color", recommendReason: "和の色であなたを表現" },
];

/**
 * /play ページの「イチオシ」セクション用のコンテンツ配列を返す。
 * PLAY_FEATURED_ITEMS の各 slug から playContentBySlug でコンテンツを取得し、
 * recommendReason を付与した PlayFeaturedContent[] として返す。
 */
export function getPlayFeaturedContents(): PlayFeaturedContent[] {
  return PLAY_FEATURED_ITEMS.flatMap(({ slug, recommendReason }) => {
    const content = playContentBySlug.get(slug);
    return content ? [{ ...content, recommendReason }] : [];
  });
}
