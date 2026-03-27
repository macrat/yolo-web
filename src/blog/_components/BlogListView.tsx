import Link from "next/link";
import type { BlogPostMeta, BlogCategory } from "@/blog/_lib/blog";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
} from "@/blog/_lib/blog";
import BlogCard from "@/blog/_components/BlogCard";
import Pagination from "@/components/common/Pagination";
import styles from "./BlogListView.module.css";

/** フィルタ未適用時に表示する人気タグの上限 */
const TOP_TAGS_COUNT = 8;

interface TagHeader {
  /** Tag name to display as page title */
  tag: string;
  /** Tag description to display below the title */
  description: string;
}

interface BlogListViewProps {
  /** Blog posts for the current page (already sliced) */
  posts: BlogPostMeta[];
  /** Current 1-based page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Base path for pagination links (e.g., "/blog" or "/blog/category/technical") */
  basePath: string;
  /** Currently active category slug, if any */
  activeCategory?: string;
  /**
   * All published posts (not paginated).
   * Used to compute per-category counts and popular tags.
   * Optional: when omitted (e.g. on tag pages), category nav shows without counts.
   */
  allPosts?: BlogPostMeta[];
  /**
   * When set, renders a tag-specific header instead of the default blog header.
   * Used by /blog/tag/[tag] pages.
   */
  tagHeader?: TagHeader;
}

/**
 * Shared Server Component that renders the blog list view.
 *
 * Used by /blog, /blog/page/[page], /blog/category/[category],
 * /blog/category/[category]/page/[page], and /blog/tag/[tag]
 * to avoid duplicating the header, category filter, card grid, and pagination layout.
 */
export default function BlogListView({
  posts,
  currentPage,
  totalPages,
  basePath,
  activeCategory,
  allPosts = [],
  tagHeader,
}: BlogListViewProps) {
  const description = activeCategory
    ? CATEGORY_DESCRIPTIONS[activeCategory as BlogCategory]
    : "AIエージェントたちがサイトを運営する過程を公開。意思決定、技術的挑戦、失敗と学びを記録します。";

  // カテゴリごとの記事件数を算出
  const countByCategory: Record<string, number> = {};
  for (const post of allPosts) {
    countByCategory[post.category] = (countByCategory[post.category] ?? 0) + 1;
  }

  // 人気タグを算出（使用頻度上位TOP_TAGS_COUNT個）
  const tagCounts: Record<string, number> = {};
  for (const post of allPosts) {
    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const popularTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_TAGS_COUNT)
    .map(([tag]) => tag);

  // カテゴリフィルタ未適用時のみ人気タグセクションを表示
  const showPopularTags =
    !activeCategory && !tagHeader && popularTags.length > 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {tagHeader ? (
          <>
            <p className={styles.tagBreadcrumb}>
              <Link href="/blog">ブログ</Link>
              <span aria-hidden="true"> / </span>
              タグ
            </p>
            <h1 className={styles.title}>{tagHeader.tag}</h1>
            <p className={styles.description}>{tagHeader.description}</p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>AI試行錯誤ブログ</h1>
            <p className={styles.description}>{description}</p>
          </>
        )}
      </header>

      {!tagHeader && (
        <nav className={styles.filters} aria-label="Category filter">
          <Link
            href="/blog"
            className={styles.filterPill}
            data-active={!activeCategory ? "true" : undefined}
          >
            すべて ({allPosts.length})
          </Link>
          {ALL_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/blog/category/${cat}`}
              className={styles.filterPill}
              data-active={cat === activeCategory ? "true" : undefined}
            >
              {CATEGORY_LABELS[cat]} ({countByCategory[cat] ?? 0})
            </Link>
          ))}
        </nav>
      )}

      {showPopularTags && (
        <nav className={styles.popularTags} aria-label="人気タグ">
          <span className={styles.popularTagsLabel}>タグで探す</span>
          <div className={styles.popularTagsList}>
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag)}`}
                className={styles.tagPill}
              >
                {tag}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {posts.length === 0 ? (
        <p className={styles.empty}>
          {tagHeader
            ? "このタグの記事はまだありません。"
            : activeCategory
              ? "このカテゴリの記事はまだありません。"
              : "まだ記事がありません。"}
        </p>
      ) : (
        <div className={styles.grid}>
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
      />
    </div>
  );
}
