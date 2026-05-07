import type { BlogPostMeta } from "@/blog/_lib/blog";

/**
 * NEW バッジを表示する日数閾値（ミリ秒）: 30日。
 * 「最新」として来訪者が自然に受け取れる期間。30日を超えた記事に
 * NEW と表示されると、来訪者の「最新」の感覚とずれて信頼を損なう。
 */
export const NEW_BADGE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

/** NEW バッジを表示する記事の最大件数 */
export const NEW_MAX_COUNT = 5;

/**
 * NEW バッジを表示する記事のスラッグ集合を計算する。
 *
 * 条件（積集合）:
 * 1. published_at 降順でソートして上位 NEW_MAX_COUNT 件
 * 2. その中で published_at が now から NEW_BADGE_THRESHOLD_MS 以内のもの
 *
 * @param posts - 全ブログ記事のメタデータ配列
 * @param now - 現在時刻（ミリ秒）。テスト容易性のため引数で受け取る
 *
 * 注意: ブログの日時フィールドは published_at（ハイフン区切り）で、
 * play/tools の publishedAt（キャメルケース）と異なる。
 */
export function calculateNewSlugs(
  posts: BlogPostMeta[],
  now: number,
): ReadonlySet<string> {
  // published_at 降順（新しい順）でソートして上位 NEW_MAX_COUNT 件を取得
  const top5 = [...posts]
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    )
    .slice(0, NEW_MAX_COUNT);

  // 上位5件の中から30日以内のものだけを返す（積集合）
  return new Set(
    top5
      .filter(
        (post) =>
          now - new Date(post.published_at).getTime() < NEW_BADGE_THRESHOLD_MS,
      )
      .map((post) => post.slug),
  );
}
