import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type BlogCategory,
} from "@/blog/_lib/blog";
import { paginate, BLOG_POSTS_PER_PAGE } from "@/lib/pagination";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ category: string; page: string }>;
}

/** Only allow statically generated page numbers; return 404 for others */
export const dynamicParams = false;

/**
 * Generate params for every category x page combination (pages 2+).
 * Page 1 of each category is handled by the parent page.tsx,
 * with a redirect from /blog/category/[category]/page/1.
 */
export function generateStaticParams() {
  const allPosts = getAllBlogPosts();
  const params: { category: string; page: string }[] = [];

  for (const category of ALL_CATEGORIES) {
    const categoryPosts = allPosts.filter((p) => p.category === category);
    const { totalPages } = paginate(categoryPosts, 1, BLOG_POSTS_PER_PAGE);

    for (let i = 2; i <= totalPages; i++) {
      params.push({ category, page: String(i) });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, page } = await params;
  const label = CATEGORY_LABELS[category as BlogCategory];
  if (!label) return {};

  const pageNum = Number(page);

  return {
    title: `${label} - AI試行錯誤ブログ（${pageNum}ページ目） | ${SITE_NAME}`,
    description: `AI試行錯誤ブログの「${label}」カテゴリの記事一覧。`,
    alternates: {
      canonical: `${BASE_URL}/blog/category/${category}/page/${pageNum}`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

/** Category blog listing pages 2+ (/blog/category/[category]/page/[page]) */
export default async function CategoryPaginatedPage({ params }: Props) {
  const { category, page } = await params;
  const pageNum = Number(page);

  if (!ALL_CATEGORIES.includes(category as BlogCategory)) {
    notFound();
  }

  // Safety check: page must be a valid integer >= 2
  if (!Number.isInteger(pageNum) || pageNum < 2) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const categoryPosts = allPosts.filter((p) => p.category === category);
  const { items, totalPages } = paginate(
    categoryPosts,
    pageNum,
    BLOG_POSTS_PER_PAGE,
  );

  // If the requested page exceeds the total, 404
  if (pageNum > totalPages) {
    notFound();
  }

  return (
    <BlogListView
      posts={items}
      currentPage={pageNum}
      totalPages={totalPages}
      basePath={`/blog/category/${category}`}
      activeCategory={category}
    />
  );
}
