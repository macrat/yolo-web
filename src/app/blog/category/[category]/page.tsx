import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type BlogCategory,
} from "@/lib/blog";
import { paginate, BLOG_POSTS_PER_PAGE } from "@/lib/pagination";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import BlogListView from "@/components/blog/BlogListView";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return ALL_CATEGORIES.map((cat) => ({ category: cat }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category as BlogCategory];
  if (!label) return {};

  return {
    title: `${label} - AI試行錯誤ブログ | ${SITE_NAME}`,
    description: `AI試行錯誤ブログの「${label}」カテゴリの記事一覧。`,
    alternates: {
      canonical: `${BASE_URL}/blog/category/${category}`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

/** Category blog listing page 1 (/blog/category/[category]) */
export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!ALL_CATEGORIES.includes(category as BlogCategory)) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const categoryPosts = allPosts.filter((p) => p.category === category);
  const { items, totalPages } = paginate(categoryPosts, 1, BLOG_POSTS_PER_PAGE);

  return (
    <BlogListView
      posts={items}
      currentPage={1}
      totalPages={totalPages}
      basePath={`/blog/category/${category}`}
      activeCategory={category}
    />
  );
}
