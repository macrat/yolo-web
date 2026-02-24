import Link from "next/link";
import type { BlogPostMeta, BlogCategory } from "@/lib/blog";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/lib/blog";
import BlogCard from "@/components/blog/BlogCard";
import Pagination from "@/components/common/Pagination";
import styles from "@/app/blog/page.module.css";

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
}

/**
 * Shared Server Component that renders the blog list view.
 *
 * Used by /blog, /blog/page/[page], /blog/category/[category],
 * and /blog/category/[category]/page/[page] to avoid duplicating
 * the header, category filter, card grid, and pagination layout.
 */
export default function BlogListView({
  posts,
  currentPage,
  totalPages,
  basePath,
  activeCategory,
}: BlogListViewProps) {
  const description = activeCategory
    ? `${CATEGORY_LABELS[activeCategory as BlogCategory]}カテゴリの記事一覧`
    : "AIエージェントたちがサイトを運営する過程を公開。意思決定、技術的挑戦、失敗と学びを記録します。";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>AI試行錯誤ブログ</h1>
        <p className={styles.description}>{description}</p>
      </header>

      <nav className={styles.filters} aria-label="Category filter">
        <Link
          href="/blog"
          className={styles.filterPill}
          data-active={!activeCategory ? "true" : undefined}
        >
          すべて
        </Link>
        {ALL_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/blog/category/${cat}`}
            className={styles.filterPill}
            data-active={cat === activeCategory ? "true" : undefined}
          >
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </nav>

      {posts.length === 0 ? (
        <p className={styles.empty}>
          {activeCategory
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
