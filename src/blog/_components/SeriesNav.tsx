import Link from "next/link";
import AccordionItem from "@/components/AccordionItem";
import { SERIES_LABELS, type BlogPostMeta } from "@/blog/_lib/blog";
import styles from "./SeriesNav.module.css";

interface SeriesNavProps {
  seriesId: string;
  currentSlug: string;
  seriesPosts: BlogPostMeta[];
}

/**
 * Displays a collapsible series navigation UI with:
 * - A numbered list of all posts in the series (folded inside an AccordionItem)
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
      <AccordionItem
        heading={
          <span className={styles.seriesHeading}>
            <span className={styles.seriesLabel}>{seriesLabel}</span>
            <span className={styles.position}>{positionLabel}</span>
          </span>
        }
      >
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
      </AccordionItem>

      {(prevPost || nextPost) && (
        <div
          className={
            prevPost && nextPost
              ? styles.quickNav
              : nextPost
                ? styles.quickNavNextOnly
                : styles.quickNavPrevOnly
          }
        >
          {prevPost && (
            <Link href={`/blog/${prevPost.slug}`} className={styles.prevLink}>
              <span className={styles.quickNavLabel}>シリーズ内の前の記事</span>
              <span className={styles.quickNavTitle}>{prevPost.title}</span>
            </Link>
          )}
          {nextPost && (
            <Link href={`/blog/${nextPost.slug}`} className={styles.nextLink}>
              <span className={styles.quickNavLabel}>シリーズ内の次の記事</span>
              <span className={styles.quickNavTitle}>{nextPost.title}</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
