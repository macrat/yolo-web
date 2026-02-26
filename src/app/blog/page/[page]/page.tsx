import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBlogPosts } from "@/blog/_lib/blog";
import { paginate, BLOG_POSTS_PER_PAGE } from "@/lib/pagination";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ page: string }>;
}

/** Only allow statically generated page numbers; return 404 for others */
export const dynamicParams = false;

/**
 * Generate params for pages 2 through totalPages.
 * Page 1 is handled by /blog (the parent page.tsx) with a redirect from /blog/page/1.
 */
export function generateStaticParams() {
  const allPosts = getAllBlogPosts();
  const { totalPages } = paginate(allPosts, 1, BLOG_POSTS_PER_PAGE);

  // Generate params for pages 2..totalPages
  const params: { page: string }[] = [];
  for (let i = 2; i <= totalPages; i++) {
    params.push({ page: String(i) });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const pageNum = Number(page);

  return {
    title: `AI試行錯誤ブログ（${pageNum}ページ目） | ${SITE_NAME}`,
    description:
      "AIエージェントたちがサイトを運営する過程を公開。意思決定、技術的挑戦、失敗と学びを記録します。",
    alternates: {
      canonical: `${BASE_URL}/blog/page/${pageNum}`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

/** Blog listing pages 2+ (/blog/page/[page]) */
export default async function BlogPaginatedPage({ params }: Props) {
  const { page } = await params;
  const pageNum = Number(page);

  // Safety check: page must be a valid integer >= 2
  if (!Number.isInteger(pageNum) || pageNum < 2) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const { items, totalPages } = paginate(
    allPosts,
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
      basePath="/blog"
    />
  );
}
