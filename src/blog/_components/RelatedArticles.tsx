import type { BlogPostMeta } from "@/blog/_lib/blog";
import { CATEGORY_LABELS } from "@/blog/_lib/blog";
import { formatDate } from "@/lib/date";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";

interface RelatedArticlesProps {
  posts: BlogPostMeta[];
}

/**
 * 記事末尾の「関連記事」— DESIGN.md フェーズ R「店構え」へ変換。
 *
 * カード羅列を廃し、共有の {@link Shinagaki}（品書き＝罫区切りリスト）に統合した。
 * 品名=記事タイトル・値札=カテゴリ名・右端メタ=公開日。専用の CSS は持たない
 * （見た目は Shinagaki 側が一元管理）。
 *
 * 関連記事が 0 件のときは何も描画しない。
 */
export default function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  const items: ShinagakiItem[] = posts.map((post) => ({
    name: post.title,
    href: `/blog/${post.slug}`,
    tags: [CATEGORY_LABELS[post.category]],
    meta: formatDate(post.published_at),
    // 右端メタは公開日。機械可読な <time dateTime> で包むため生の値も渡す。
    metaDateTime: post.published_at,
  }));

  return (
    <Shinagaki heading="関連記事" items={items} ariaLabel="関連記事の品書き" />
  );
}
