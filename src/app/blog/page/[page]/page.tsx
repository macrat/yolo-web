import type { Metadata } from "next";
import {
  BLOG_LIST_PER_PAGE,
  blogListMetadata,
  blogListPageParams,
  blogListPosts,
} from "@/blog/_lib/blog-list";
import { listPageFromParam } from "@/lib/list-pages";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ page: string }>;
}

const SCOPE = { type: "all" } as const;

export const dynamicParams = false;

export function generateStaticParams(): Array<{ page: string }> {
  return blogListPageParams(SCOPE);
}

async function resolvePage(params: Props["params"]): Promise<number> {
  const { page } = await params;
  return listPageFromParam(
    page,
    blogListPosts(SCOPE).length,
    BLOG_LIST_PER_PAGE,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return blogListMetadata(SCOPE, await resolvePage(params));
}

/** /blog/page/[page] はブログの全記事の一覧の2ページ目から。 */
export default async function BlogPaginatedPage({ params }: Props) {
  return <BlogListView scope={SCOPE} page={await resolvePage(params)} />;
}
