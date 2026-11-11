import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_CATEGORIES } from "@/blog/_lib/blog";
import {
  blogListMetadata,
  isBlogCategory,
  type BlogListScope,
} from "@/blog/_lib/blog-list";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams(): Array<{ category: string }> {
  return ALL_CATEGORIES.map((category) => ({ category }));
}

async function resolveScope(params: Props["params"]): Promise<BlogListScope> {
  const { category } = await params;
  if (!isBlogCategory(category)) notFound();
  return { type: "category", category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return blogListMetadata(await resolveScope(params), 1);
}

/** /blog/category/[category] は1つの分類の記事の一覧の1ページ目。 */
export default async function CategoryPage({ params }: Props) {
  return <BlogListView scope={await resolveScope(params)} page={1} />;
}
