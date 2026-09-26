import type { Metadata } from "next";
import { blogListMetadata } from "@/blog/_lib/blog-list";
import BlogListView from "@/blog/_components/BlogListView";

export const metadata: Metadata = blogListMetadata({ type: "all" }, 1);

/** /blog はブログの全記事の一覧の1ページ目。 */
export default function BlogPage() {
  return <BlogListView scope={{ type: "all" }} page={1} />;
}
