import type { PlayContentMeta } from "./types";
import { playContentBySlug, getPlayContentsByCategory } from "./registry";

/** 全カテゴリの一覧 */
const ALL_CATEGORIES: ReadonlyArray<PlayContentMeta["category"]> = [
  "fortune",
  "personality",
  "knowledge",
  "game",
];

/**
 * 2つのkeywords配列の重複数を返す。
 * O(n) ルックアップのためにSetを使用する。
 */
function countKeywordOverlap(keywordsA: string[], keywordsB: string[]): number {
  const setA = new Set(keywordsA);
  return keywordsB.filter((k) => setA.has(k)).length;
}

/**
 * 指定カテゴリの中から、currentContentとのkeywords重複が最も多いコンテンツを返す。
 * 重複数が同数の場合はレジストリ定義順（allPlayContentsの順）で先頭のものを選出する。
 *
 * @param category 選出対象のカテゴリ
 * @param currentContent 現在表示中のコンテンツ
 * @returns 選出されたPlayContentMeta（カテゴリにコンテンツがない場合はundefined）
 */
function selectBestFromCategory(
  category: PlayContentMeta["category"],
  currentContent: PlayContentMeta,
): PlayContentMeta | undefined {
  const candidates = getPlayContentsByCategory(category);
  if (candidates.length === 0) return undefined;

  // 重複数が最大のコンテンツを選出。同数の場合はレジストリ定義順で先頭（findで最初に見つかるもの）
  let best = candidates[0];
  let bestOverlap = countKeywordOverlap(
    currentContent.keywords,
    candidates[0].keywords,
  );

  for (let i = 1; i < candidates.length; i++) {
    const overlap = countKeywordOverlap(
      currentContent.keywords,
      candidates[i].keywords,
    );
    // 重複数が厳密に多い場合のみ更新（同数の場合は先頭を維持）
    if (overlap > bestOverlap) {
      best = candidates[i];
      bestOverlap = overlap;
    }
  }

  return best;
}

/**
 * 指定slugのコンテンツに対して、他カテゴリからレコメンドコンテンツを3件返す。
 *
 * アルゴリズム:
 * 1. 現在のコンテンツのカテゴリを特定する
 * 2. 自分のカテゴリ以外の3カテゴリから各1件選出
 * 3. 選出基準: 現在のコンテンツのkeywordsとの重複が最も多いコンテンツ
 *    重複が同数（0を含む）の場合はレジストリ定義順の先頭
 * 4. 決定的な関数（ランダム要素なし）
 *
 * @param slug 現在表示中のコンテンツのslug
 * @returns レコメンドコンテンツの配列（3件）。存在しないslugの場合は空配列
 */
export function getRecommendedContents(slug: string): PlayContentMeta[] {
  const currentContent = playContentBySlug.get(slug);
  if (!currentContent) return [];

  const otherCategories = ALL_CATEGORIES.filter(
    (cat) => cat !== currentContent.category,
  );

  const recommended: PlayContentMeta[] = [];
  for (const category of otherCategories) {
    const selected = selectBestFromCategory(category, currentContent);
    if (selected) {
      recommended.push(selected);
    }
  }

  return recommended;
}
