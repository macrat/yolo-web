import ItemList, { type ItemListItem } from "@/components/ItemList";
import { CATEGORY_LABELS } from "@/blog/_lib/blog";
import { getRelatedBlogPostsForTool } from "@/lib/cross-links";
import { formatDate } from "@/lib/date";
import styles from "./RelatedBlogPosts.module.css";

interface RelatedBlogPostsProps {
  /** このツール・ゲームを取り上げたブログ記事を載せる。記事はツールとゲームの slug を同じ欄に持つ。 */
  toolSlug: string;
}

const HEADING_ID = "related-blog-posts";

/**
 * ツール・ゲームのページの末尾の「関連ブログ記事」。行は題名・説明・分類・公開日で、説明があれば開く前に中身が分かり、
 * 公開日で記事の新しさを比べられる。関連記事が無いときは何も描かない。
 */
export default function RelatedBlogPosts({ toolSlug }: RelatedBlogPostsProps) {
  const posts = getRelatedBlogPostsForTool(toolSlug);
  if (posts.length === 0) return null;

  const items: ItemListItem[] = posts.map((post) => ({
    name: post.title,
    href: `/blog/${post.slug}`,
    description: post.description,
    kind: CATEGORY_LABELS[post.category],
    facts: [
      { text: formatDate(post.published_at), dateTime: post.published_at },
    ],
  }));

  return (
    <section className={styles.section} aria-labelledby={HEADING_ID}>
      <h2 id={HEADING_ID} className={styles.title}>
        関連ブログ記事
      </h2>
      <ItemList labelledBy={HEADING_ID} items={items} />
    </section>
  );
}
