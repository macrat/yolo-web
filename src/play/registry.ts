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

/**
 * 「まずはここから」セクションに表示する固定コンテンツのスラグ一覧。
 * 各カテゴリから代表的な1コンテンツを選出（性格診断/知識テスト/ゲーム）。
 * 占いカテゴリは FortunePreview セクションで表示するため除外し、3件とする。
 * 初回訪問者が迷わず体験できる導線として機能する。
 * /play ページとトップページの両方から参照される共有定数。
 */
export const FEATURED_SLUGS: ReadonlyArray<string> = [
  "animal-personality", // 性格診断: アニマル性格診断
  "kanji-level", // 知識テスト: 漢字レベル診断
  "irodori", // ゲーム: いろどり
];

/** 全 PlayContentMeta の配列（ゲーム4種 + クイズ14種 + Fortune 1種 = 19種、表示順を保持） */
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
 * 「まずはここから」セクション用の固定コンテンツ配列を返す。
 * FEATURED_SLUGS に対応するコンテンツをレジストリから取得する。
 * /play ページとトップページの両方から参照される共有関数。
 */
export function getFeaturedContents(): PlayContentMeta[] {
  return FEATURED_SLUGS.flatMap((slug) => {
    const content = playContentBySlug.get(slug);
    return content ? [content] : [];
  });
}

/**
 * 「もっと診断してみよう」セクションに表示する厳選コンテンツのスラグ一覧。
 *
 * 選定基準:
 * - fortune カテゴリは FortunePreview セクションで表示済みのため除外
 * - "animal-personality" と "kanji-level" は「まずはここから」で表示済みのため除外
 * - personality から4件・knowledge から2件を厳選
 */
export const DIAGNOSIS_SLUGS: ReadonlyArray<string> = [
  "music-personality", // personality: 音楽性格診断
  "yoji-personality", // personality: 四字熟語で性格診断
  "character-personality", // personality: キャラクター性格診断
  "science-thinking", // personality: サイエンス思考診断
  "kotowaza-level", // knowledge: ことわざレベル診断
  "yoji-level", // knowledge: 四字熟語レベル診断
];

/**
 * 「もっと診断してみよう」セクション用の厳選コンテンツ配列を返す。
 * DIAGNOSIS_SLUGS に対応するコンテンツをレジストリから取得する。
 * トップページから参照される関数。
 */
export function getDiagnosisContents(): PlayContentMeta[] {
  return DIAGNOSIS_SLUGS.flatMap((slug) => {
    const content = playContentBySlug.get(slug);
    return content ? [content] : [];
  });
}
