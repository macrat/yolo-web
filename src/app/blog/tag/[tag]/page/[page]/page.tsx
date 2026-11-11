import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MIN_POSTS_FOR_TAG_PAGE, getTagsWithMinPosts } from "@/blog/_lib/blog";
import {
  blogListMetadata,
  blogListPageFromParam,
  blogListPageParams,
  hasTagPage,
  type BlogListScope,
} from "@/blog/_lib/blog-list";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ tag: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{ tag: string; page: string }> {
  return getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE).flatMap((tag) =>
    blogListPageParams({ type: "tag", tag }).map(({ page }) => ({
      tag,
      page,
    })),
  );
}

async function resolve(params: Props["params"]) {
  const { tag: rawTag, page } = await params;
  const tag = decodeURIComponent(rawTag);
  if (!hasTagPage(tag)) notFound();
  const scope: BlogListScope = { type: "tag", tag };
  return { scope, page: blogListPageFromParam(scope, page) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scope, page } = await resolve(params);
  return blogListMetadata(scope, page);
}

/** /blog/tag/[tag]/page/[page] は1つのタグの記事の一覧の2ページ目から。 */
export default async function TagPaginatedPage({ params }: Props) {
  const { scope, page } = await resolve(params);
  return <BlogListView scope={scope} page={page} />;
}
