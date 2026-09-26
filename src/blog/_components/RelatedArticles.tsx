import type { BlogPostMeta } from "@/blog/_lib/blog";
import { CATEGORY_LABELS } from "@/blog/_lib/blog";
import { formatDate } from "@/lib/date";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import styles from "./RelatedArticles.module.css";

interface RelatedArticlesProps {
  posts: BlogPostMeta[];
}

const HEADING_ID = "related-articles";

/**
 * 記事の末尾の「関連記事」。行は題名・説明・分類・公開日で、説明があれば開く前に中身が分かる。
 * 関連記事が無いときは何も描かない。
 */
export default function RelatedArticles({ posts }: RelatedArticlesProps) {
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
    <section aria-labelledby={HEADING_ID}>
      <h2 id={HEADING_ID} className={styles.heading}>
        関連記事
      </h2>
      <ItemList labelledBy={HEADING_ID} items={items} />
    </section>
  );
}
