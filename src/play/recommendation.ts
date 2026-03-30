import type { PlayContentMeta } from "./types";
import {
  playContentBySlug,
  getPlayContentsByCategory,
  allPlayContents,
  PLAY_FEATURED_ITEMS,
} from "./registry";

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

/**
 * フォールバック推薦コンテンツを返す内部関数。
 *
 * PLAY_FEATURED_ITEMS の slug 順に並んだ厳選コンテンツから、
 * すでに推薦済みのコンテンツ（excludeSlugs）を除いた上で count 件返す。
 * キーワードマッチが不十分な場合の安定した導線として機能する。
 *
 * @param excludeSlugs 除外する slug の配列（すでに推薦済みのコンテンツ）
 * @param count 返す件数の上限
 * @returns フォールバックとして返すコンテンツの配列
 */
function getFallbackRecommendations(
  excludeSlugs: string[],
  count: number,
): PlayContentMeta[] {
  const excludeSet = new Set(excludeSlugs);
  const results: PlayContentMeta[] = [];

  for (const { slug } of PLAY_FEATURED_ITEMS) {
    if (results.length >= count) break;
    // undefined を返す slug はスキップ（レジストリから削除されたコンテンツへの耐性）
    const content = playContentBySlug.get(slug);
    if (!content) continue;
    if (excludeSet.has(slug)) continue;
    results.push(content);
  }

  return results;
}

/**
 * ブログ記事のタグに基づいて、関連する play 系コンテンツを最大2件推薦する。
 *
 * タグと各コンテンツの keywords のオーバーラップ数でスコアリングし、
 * スコアが高いコンテンツを優先的に推薦する。マッチが不十分な場合は
 * PLAY_FEATURED_ITEMS による固定フォールバックで補完する。
 *
 * @param tags ブログ記事のタグ配列（記事の主題を表すキーワード）
 * @returns 推薦コンテンツの配列（最大2件）
 */
export function getPlayRecommendationsForBlog(
  tags: string[],
): PlayContentMeta[] {
  // tags と各コンテンツの keywords のオーバーラップ数でスコアリング
  const scored = allPlayContents
    .map((content) => ({
      content,
      score: countKeywordOverlap(tags, content.keywords),
    }))
    .filter(({ score }) => score > 0);

  // スコア降順の stable sort（同スコアは allPlayContents の配列順を維持）
  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.slice(0, 2).map(({ content }) => content);

  if (topMatches.length === 0) {
    // スコア > 0 のコンテンツが0件 → フォールバック2件
    return getFallbackRecommendations([], 2);
  }

  if (topMatches.length === 1) {
    // スコア > 0 のコンテンツが1件 → その1件 + フォールバック1件で計2件
    const fallback = getFallbackRecommendations([topMatches[0].slug], 1);
    return [...topMatches, ...fallback];
  }

  return topMatches;
}

/**
 * 辞典ページの slug に基づいて、関連する play 系コンテンツを最大2件推薦する。
 *
 * 辞典 slug をテーマキーワードにマッピングし、getPlayRecommendationsForBlog
 * と同じスコアリングロジックで推薦する。未知の slug の場合はフォールバックを返す。
 *
 * @param dictionarySlug 辞典ページの slug（例: "kanji", "yoji", "colors"）
 * @returns 推薦コンテンツの配列（最大2件）
 */
export function getPlayRecommendationsForDictionary(
  dictionarySlug: string,
): PlayContentMeta[] {
  // 辞典slug → テーマキーワードのマッピング
  // 辞典の内容を代表するキーワードに変換することで、
  // 辞典ページとplay系コンテンツの意味的な関連性を橋渡しする
  const dictionaryKeywordMap: Record<string, string[]> = {
    kanji: ["漢字"],
    yoji: ["四字熟語"],
    colors: ["伝統色", "色"],
  };

  const tags = dictionaryKeywordMap[dictionarySlug] ?? [];

  // タグが空（未知のslug）の場合も getPlayRecommendationsForBlog 経由で
  // フォールバックロジックを統一的に処理する
  return getPlayRecommendationsForBlog(tags);
}
