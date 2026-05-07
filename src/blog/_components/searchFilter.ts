import type { BlogPostMeta } from "@/blog/_lib/blog";

/**
 * キーワードでブログ記事を絞り込む純関数。
 *
 * 検索対象（5系統）:
 * 1. title - 記事タイトル
 * 2. description - 記事の概要
 * 3. tags - タグ配列（join して部分一致）
 * 4. categoryLabel - カテゴリ表示名（例: 「開発ノート」「AIワークフロー」）
 * 5. seriesLabel - シリーズ表示名（例: 「AIエージェント運用記」「Next.js実践ノート」）
 *    ※ post.series が存在する記事のみ対象
 *
 * 対象外:
 * - slug（M1cの打鍵語と乖離するため）
 * - series id 文字列（表示名ではないため）
 * - related_tool_slugs（来訪者の打鍵語と関係ないため）
 *
 * ラベルマッピングを引数で受け取る理由:
 * このファイルは Client Component（BlogFilterableList.tsx）からインポートされるため、
 * node:fs を使う @/blog/_lib/blog を直接インポートすると Turbopack ビルドエラーになる。
 * ラベルマッピングを引数で受け取ることで node:fs 依存を排除する。
 *
 * @param posts - 絞り込み対象の記事配列（既にソート済みの順序を保持）
 * @param keyword - 検索キーワード（空文字の場合は全件返す）
 * @param categoryLabels - カテゴリID → 表示名のマッピング
 * @param seriesLabels - シリーズID → 表示名のマッピング
 * @returns キーワードにマッチした記事の配列
 */
export function filterPostsByKeyword(
  posts: BlogPostMeta[],
  keyword: string,
  categoryLabels: Record<string, string>,
  seriesLabels: Record<string, string>,
): BlogPostMeta[] {
  const trimmed = keyword.trim();
  if (!trimmed) return posts;

  const lower = trimmed.toLowerCase();

  return posts.filter((post) => {
    const categoryLabel = categoryLabels[post.category] ?? "";
    const seriesLabel = post.series ? (seriesLabels[post.series] ?? "") : "";

    const targets = [
      post.title,
      post.description,
      post.tags.join(" "),
      categoryLabel,
      seriesLabel,
    ];

    return targets.some((t) => t.toLowerCase().includes(lower));
  });
}
