/**
 * ゲームを終えたダイアログに並べる、ほかの分類の遊びの行を選ぶ。
 *
 * 各ゲームの page.tsx（サーバー）で呼び、遊びの登録と分類の語をクライアントに持ち込まない。
 */

import { playContentBySlug, getPlayContentsByCategory } from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { resolveDisplayCategory } from "@/play/seo";
import type { PlayContentMeta } from "@/play/types";
import type { ItemListItem } from "@/components/ItemList";

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
 * @returns 行の配列（最大2件）
 */
export function computeCrossCategoryItems(gameSlug: string): ItemListItem[] {
  const items: ItemListItem[] = [];

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
 * 遊びを行にする。行は名前と種別だけを持ち、ダイアログの中で結果を押し下げないよう説明を持たない。
 */
function contentToItem(content: PlayContentMeta): ItemListItem {
  return {
    name: content.shortTitle ?? content.title,
    href: getContentPath(content),
    kind: resolveDisplayCategory(content),
  };
}
