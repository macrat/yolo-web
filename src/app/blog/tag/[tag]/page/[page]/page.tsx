import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MIN_POSTS_FOR_TAG_PAGE, getTagsWithMinPosts } from "@/blog/_lib/blog";
import {
  BLOG_LIST_PER_PAGE,
  blogListMetadata,
  blogListPageParams,
  blogListPosts,
  hasTagPage,
  type BlogListScope,
} from "@/blog/_lib/blog-list";
import { listPageFromParam } from "@/lib/list-pages";
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
  return {
    scope,
    page: listPageFromParam(
      page,
      blogListPosts(scope).length,
      BLOG_LIST_PER_PAGE,
    ),
  };
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
