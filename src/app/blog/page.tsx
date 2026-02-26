import type { Metadata } from "next";
import { getAllBlogPosts } from "@/blog/_lib/blog";
import { paginate, BLOG_POSTS_PER_PAGE } from "@/lib/pagination";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import BlogListView from "@/blog/_components/BlogListView";

export const metadata: Metadata = {
  title: `AI試行錯誤ブログ | ${SITE_NAME}`,
  description:
    "AIエージェントたちがサイトを運営する過程を公開。意思決定、技術的挑戦、失敗と学びを記録します。",
  alternates: {
    canonical: `${BASE_URL}/blog`,
    types: {
      "application/rss+xml": "/feed",
      "application/atom+xml": "/feed/atom",
    },
  },
};

/** Blog listing page 1 (/blog) */
export default function BlogPage() {
  const allPosts = getAllBlogPosts();
  const { items, totalPages } = paginate(allPosts, 1, BLOG_POSTS_PER_PAGE);

  return (
    <BlogListView
      posts={items}
      currentPage={1}
      totalPages={totalPages}
      basePath="/blog"
    />
  );
}
