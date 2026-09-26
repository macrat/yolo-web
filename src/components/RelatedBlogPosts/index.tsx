import ItemList, { type ItemListItem } from "@/components/ItemList";
import { CATEGORY_LABELS } from "@/blog/_lib/blog";
import { getBlogPostsReferencing } from "@/lib/cross-links";
import { formatDate } from "@/lib/date";
import styles from "./RelatedBlogPosts.module.css";

interface RelatedBlogPostsProps {
  /** いまのツール・ゲームの slug。それを取り上げた記事を載せる。 */
  slug: string;
}

const HEADING_ID = "related-blog-posts";

/**
 * ツール・ゲームのページの末尾の「関連ブログ記事」。行は題名・説明・分類・公開日で、説明があれば開く前に中身が分かり、
 * 公開日で記事の新しさを比べられる。関連記事が無いときは何も描かない。
 */
export default function RelatedBlogPosts({ slug }: RelatedBlogPostsProps) {
  const posts = getBlogPostsReferencing(slug);
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
    <section className={styles.related}>
      <h2 id={HEADING_ID} className={styles.heading}>
        関連ブログ記事
      </h2>
      <ItemList labelledBy={HEADING_ID} items={items} />
    </section>
  );
}
