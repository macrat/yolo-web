import Link from "next/link";
import { getRelatedBlogPostsForGame } from "@/lib/cross-links";
import { formatDate } from "@/lib/date";
import styles from "./RelatedBlogPosts.module.css";

interface RelatedBlogPostsProps {
  gameSlug: string;
}

/**
 * 関連ブログ記事（(new) デザイン体系版・cycle-268 フォーク）。
 * legacy `../RelatedBlogPosts` を新トークン + austere（角丸 --r-normal）へ
 * 質的入れ替えしたもの。構造は不変。
 */
export default function RelatedBlogPosts({ gameSlug }: RelatedBlogPostsProps) {
  const posts = getRelatedBlogPostsForGame(gameSlug);
  if (posts.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>関連ブログ記事</h2>
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.item}>
            <Link href={`/blog/${post.slug}`} className={styles.link}>
              <span className={styles.postTitle}>{post.title}</span>
              <time className={styles.date} dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
