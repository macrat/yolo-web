import type { ToolMeta } from "@/tools/types";

/**
 * NEW ラベルを表示する日数閾値（ミリ秒）: 30日。
 * 「最新」として来訪者が自然に受け取れる期間。30日を超えたツールに
 * NEW と表示されると、来訪者の「最新」の感覚とずれて信頼を損なう。
 */
export const NEW_BADGE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

/** NEW ラベルを表示するツールの最大件数 */
export const NEW_MAX_COUNT = 5;

/**
 * NEW ラベルを表示するツールのスラッグ集合を計算する。
 *
 * 条件（積集合）:
 * 1. publishedAt 降順でソートして上位 NEW_MAX_COUNT 件
 * 2. その中で publishedAt が now から NEW_BADGE_THRESHOLD_MS 以内のもの
 *
 * @param tools - 全ツールのメタデータ配列
 * @param now - 現在時刻（ミリ秒）。テスト容易性のため引数で受け取る
 */
export function calculateNewSlugs(
  tools: ToolMeta[],
  now: number,
): ReadonlySet<string> {
  // publishedAt 降順（新しい順）でソートして上位 NEW_MAX_COUNT 件を取得
  const top5 = [...tools]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, NEW_MAX_COUNT);

  // 上位5件の中から90日以内のものだけを返す（積集合）
  return new Set(
    top5
      .filter(
        (tool) =>
          now - new Date(tool.publishedAt).getTime() < NEW_BADGE_THRESHOLD_MS,
      )
      .map((tool) => tool.slug),
  );
}
