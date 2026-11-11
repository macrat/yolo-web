import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_CATEGORIES } from "@/blog/_lib/blog";
import {
  blogListMetadata,
  blogListPageFromParam,
  blogListPageParams,
  isBlogCategory,
  type BlogListScope,
} from "@/blog/_lib/blog-list";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ category: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{
  category: string;
  page: string;
}> {
  return ALL_CATEGORIES.flatMap((category) =>
    blogListPageParams({ type: "category", category }).map(({ page }) => ({
      category,
      page,
    })),
  );
}

async function resolve(params: Props["params"]) {
  const { category, page } = await params;
  if (!isBlogCategory(category)) notFound();
  const scope: BlogListScope = { type: "category", category };
  return { scope, page: blogListPageFromParam(scope, page) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scope, page } = await resolve(params);
  return blogListMetadata(scope, page);
}

/** /blog/category/[category]/page/[page] は1つの分類の記事の一覧の2ページ目から。 */
export default async function CategoryPaginatedPage({ params }: Props) {
  const { scope, page } = await resolve(params);
  return <BlogListView scope={scope} page={page} />;
}
