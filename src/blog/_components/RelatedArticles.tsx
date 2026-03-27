import Link from "next/link";
import type { BlogPostMeta } from "@/blog/_lib/blog";
import { CATEGORY_LABELS } from "@/blog/_lib/blog";
import { formatDate } from "@/lib/date";
import styles from "./RelatedArticles.module.css";

interface RelatedArticlesProps {
  posts: BlogPostMeta[];
}

/**
 * Displays a "関連記事" section at the bottom of a blog post.
 * Renders nothing when no related posts are available.
 */
export default function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <section className={styles.section} aria-label="関連記事">
      <h2 className={styles.heading}>関連記事</h2>
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.item}>
            {/* lgtm[js/stored-xss] - blog slugs from local markdown files, not user input */}
            <Link href={`/blog/${post.slug}`} className={styles.link}>
              <div className={styles.meta}>
                <span className={styles.category}>
                  {CATEGORY_LABELS[post.category]}
                </span>
                <time className={styles.date} dateTime={post.published_at}>
                  {formatDate(post.published_at)}
                </time>
              </div>
              <p className={styles.title}>{post.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
