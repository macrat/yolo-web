/**
 * ゲーム完了後のResultModal内で表示する他カテゴリ推薦データの計算ロジック。
 *
 * Server Component（各ゲームのpage.tsx）で呼び出すことで、
 * @/play/registry と @/play/seo のimportをクライアントバンドルから除外する。
 */

import { playContentBySlug, getPlayContentsByCategory } from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { resolveDisplayCategory } from "@/play/seo";
import type { PlayContentMeta } from "@/play/types";
import type { CrossCategoryItem } from "@/play/games/shared/_components/CrossCategoryBanner";

/**
 * 2つのkeywords配列の重複数を返す。
 * O(n) ルックアップのためにSetを使用する。
 */
function countKeywordOverlap(keywordsA: string[], keywordsB: string[]): number {
  const setA = new Set(keywordsA);
  return keywordsB.filter((k) => setA.has(k)).length;
}

/**
 * ゲームslugに対応する他カテゴリ推薦データを計算して返す。
 *
 * 構成:
 * 1. fortune（daily）を固定1件
 * 2. personality と knowledge カテゴリから現在のゲームのkeywordsと最も近いコンテンツを1件
 *
 * @param gameSlug ゲームのslug（例: "kanji-kanaru"）
 * @returns 表示用データの配列（最大2件）
 */
export function computeCrossCategoryItems(
  gameSlug: string,
): CrossCategoryItem[] {
  const items: CrossCategoryItem[] = [];

  // fortune（daily）を固定枠として追加
  const fortuneContent = playContentBySlug.get("daily");
  if (fortuneContent) {
    items.push(contentToItem(fortuneContent));
  }

  // personality と knowledge カテゴリから現在のゲームのkeywordsと最も近いコンテンツを1件選出
  const currentGame = playContentBySlug.get(gameSlug);
  const candidates: PlayContentMeta[] = [
    ...getPlayContentsByCategory("personality"),
    ...getPlayContentsByCategory("knowledge"),
  ];

  if (candidates.length > 0) {
    let best = candidates[0];
    let bestOverlap = currentGame
      ? countKeywordOverlap(currentGame.keywords, candidates[0].keywords)
      : 0;

    for (let i = 1; i < candidates.length; i++) {
      const overlap = currentGame
        ? countKeywordOverlap(currentGame.keywords, candidates[i].keywords)
        : 0;
      // 重複数が厳密に多い場合のみ更新（同数の場合は先頭を維持）
      if (overlap > bestOverlap) {
        best = candidates[i];
        bestOverlap = overlap;
      }
    }
    items.push(contentToItem(best));
  }

  return items;
}

/**
 * PlayContentMeta を CrossCategoryItem に変換する。
 */
function contentToItem(content: PlayContentMeta): CrossCategoryItem {
  return {
    slug: content.slug,
    title: content.shortTitle ?? content.title,
    icon: content.icon,
    contentPath: getContentPath(content),
    categoryLabel: resolveDisplayCategory(content),
    category: content.category,
  };
}
