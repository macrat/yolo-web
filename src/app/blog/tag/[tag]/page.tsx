import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MIN_POSTS_FOR_TAG_PAGE, getTagsWithMinPosts } from "@/blog/_lib/blog";
import {
  blogListMetadata,
  hasTagPage,
  type BlogListScope,
} from "@/blog/_lib/blog-list";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ tag: string }>;
}

// Next.js は動的セグメントをデコードして渡すので、生のタグ名を返す。
export function generateStaticParams(): Array<{ tag: string }> {
  return getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE).map((tag) => ({ tag }));
}

// 二重に百分率符号化された URL でも同じタグとして読む。
async function resolveScope(params: Props["params"]): Promise<BlogListScope> {
  const tag = decodeURIComponent((await params).tag);
  if (!hasTagPage(tag)) notFound();
  return { type: "tag", tag };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return blogListMetadata(await resolveScope(params), 1);
}

/** /blog/tag/[tag] は1つのタグの記事の一覧の1ページ目。 */
export default async function TagPage({ params }: Props) {
  return <BlogListView scope={await resolveScope(params)} page={1} />;
}
