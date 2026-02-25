import Link from "next/link";
import { SERIES_LABELS, type BlogPostMeta } from "@/lib/blog";
import styles from "./SeriesNav.module.css";

interface SeriesNavProps {
  seriesId: string;
  currentSlug: string;
  seriesPosts: BlogPostMeta[];
}

/**
 * Displays a collapsible series navigation UI with:
 * - A numbered list of all posts in the series (inside a details/summary)
 * - Previous/next quick navigation links (always visible)
 *
 * Returns null if the series has 1 or fewer posts (R1).
 */
export default function SeriesNav({
  seriesId,
  currentSlug,
  seriesPosts,
}: SeriesNavProps) {
  if (seriesPosts.length <= 1) return null;

  const currentIndex = seriesPosts.findIndex((p) => p.slug === currentSlug);
  if (currentIndex === -1) return null;

  // Defensive fallback: use seriesId as-is if not found in SERIES_LABELS
  const seriesLabel = SERIES_LABELS[seriesId] ?? seriesId;
  const positionLabel = `${seriesPosts.length}記事中${currentIndex + 1}番目`;

  // prev = older post (currentIndex - 1), next = newer post (currentIndex + 1) (R3)
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < seriesPosts.length - 1
      ? seriesPosts[currentIndex + 1]
      : null;

  return (
    <nav className={styles.seriesNav} aria-label="シリーズナビゲーション">
      <details className={styles.details}>
        <summary className={styles.summary}>
          <span className={styles.seriesLabel}>{seriesLabel}</span>
          <span className={styles.position}>{positionLabel}</span>
        </summary>
        <ol className={styles.list}>
          {seriesPosts.map((post) => (
            <li
              key={post.slug}
              className={
                post.slug === currentSlug ? styles.currentItem : styles.listItem
              }
            >
              {post.slug === currentSlug ? (
                <span aria-current="page" className={styles.currentLink}>
                  {post.title}
                  <span className={styles.currentBadge}>(この記事)</span>
                </span>
              ) : (
                <Link href={`/blog/${post.slug}`} className={styles.link}>
                  {post.title}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </details>

      {(prevPost || nextPost) && (
        <div className={styles.quickNav}>
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className={styles.prevLink}>
              <span className={styles.quickNavLabel}>前の記事</span>
              <span className={styles.quickNavTitle}>{prevPost.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className={styles.nextLink}>
              <span className={styles.quickNavLabel}>次の記事</span>
              <span className={styles.quickNavTitle}>{nextPost.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </nav>
  );
}
