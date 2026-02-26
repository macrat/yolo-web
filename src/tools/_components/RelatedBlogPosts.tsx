import Link from "next/link";
import { getRelatedBlogPostsForTool } from "@/lib/cross-links";
import { formatDate } from "@/lib/date";
import styles from "./RelatedBlogPosts.module.css";

interface RelatedBlogPostsProps {
  toolSlug: string;
}

export default function RelatedBlogPosts({ toolSlug }: RelatedBlogPostsProps) {
  const posts = getRelatedBlogPostsForTool(toolSlug);
  if (posts.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>関連ブログ記事</h2>
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.item}>
            {/* lgtm[js/stored-xss] - blog slugs from local markdown files, not user input */}
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
