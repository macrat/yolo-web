import type { GameMeta } from "@/play/games/types";
import { allGameMetas } from "@/play/games/registry";
import type { QuizMeta } from "@/quiz/types";
import { allQuizMetas } from "@/quiz/registry";
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
