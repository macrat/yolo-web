import Link from "next/link";
import Accordion from "@/components/Accordion";
import ItemList from "@/components/ItemList";
import { SERIES_LABELS, type BlogPostMeta } from "@/blog/_lib/blog";
import styles from "./SeriesNav.module.css";

interface SeriesNavProps {
  seriesId: string;
  currentSlug: string;
  seriesPosts: BlogPostMeta[];
}

const LIST_LABEL_ID = "series-list-label";

/**
 * 連載の記事の上に置く、連載の案内。開閉の行が連載の名前と回数を言い、開くと全回の題名が順に並ぶ。
 * 閉じておくのは、全回の一覧で本文を画面の外へ押し出さないため。その下の前後の回へのリンクは、
 * 順に読む来訪者がいつも1回の操作で次へ進めるよう、開閉の外に置く。
 *
 * 連載の記事が1本以下のときと、いまの記事が連載に無いときは何も描かない。
 */
export default function SeriesNav({
  seriesId,
  currentSlug,
  seriesPosts,
}: SeriesNavProps) {
  if (seriesPosts.length <= 1) return null;

  const currentIndex = seriesPosts.findIndex((p) => p.slug === currentSlug);
  if (currentIndex === -1) return null;

  const seriesLabel = SERIES_LABELS[seriesId] ?? seriesId;
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < seriesPosts.length - 1
      ? seriesPosts[currentIndex + 1]
      : null;

  return (
    <nav className={styles.seriesNav} aria-label="連載">
      <Accordion
        summary={
          <>
            <span id={LIST_LABEL_ID} className={styles.seriesLabel}>
              連載「{seriesLabel}」（全{seriesPosts.length}回）
            </span>{" "}
            <span className={styles.position}>
              この記事は第{currentIndex + 1}回
            </span>
          </>
        }
      >
        <ItemList
          labelledBy={LIST_LABEL_ID}
          ordered
          boxed={false}
          currentHref={`/blog/${currentSlug}`}
          items={seriesPosts.map((post) => ({
            name: post.title,
            href: `/blog/${post.slug}`,
          }))}
        />
      </Accordion>

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
            <Link
              href={`/blog/${prevPost.slug}`}
              className={styles.prevLink}
              data-text-box="inline"
            >
              <span className={styles.quickNavLabel}>連載の前の回</span>
              <span className={styles.quickNavTitle}>{prevPost.title}</span>
            </Link>
          )}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className={styles.nextLink}
              data-text-box="inline"
            >
              <span className={styles.quickNavLabel}>連載の次の回</span>
              <span className={styles.quickNavTitle}>{nextPost.title}</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
