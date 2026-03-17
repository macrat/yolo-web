import type { GameMeta } from "@/play/games/types";
import { allGameMetas } from "@/play/games/registry";
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

/** 全 PlayContentMeta の配列（ゲーム4種、表示順を保持） */
export const allPlayContents: PlayContentMeta[] = allGameMetas.map(
  gameMetaToPlayContentMeta,
);

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
