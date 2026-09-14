import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostsByTag,
  getTagsWithMinPosts,
  TAG_DESCRIPTIONS,
  MIN_POSTS_FOR_TAG_PAGE,
  MIN_POSTS_FOR_TAG_INDEX,
} from "@/blog/_lib/blog";
import { paginate, BLOG_POSTS_PER_PAGE } from "@/lib/pagination";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ tag: string }>;
}

/** Only allow statically generated tag names; return 404 for others */
export const dynamicParams = false;

export function generateStaticParams() {
  // encodeURIComponent は不要: Next.js が動的セグメントを自動的にデコードするため
  // generateStaticParams では生の（デコード済み）タグ名を返す
  return getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: rawTag } = await params;
  // URL パラメータは Next.js によってデコードされるが、二重エンコードされた場合に備えて
  // 明示的に decodeURIComponent を適用する
  const tag = decodeURIComponent(rawTag);
  const posts = getPostsByTag(tag);

  if (posts.length < MIN_POSTS_FOR_TAG_PAGE) return {};

  const description =
    TAG_DESCRIPTIONS[tag] ??
    `AI試行錯誤ブログの「${tag}」タグが付いた記事一覧。`;

  const shouldIndex = posts.length >= MIN_POSTS_FOR_TAG_INDEX;

  return {
    title: `${tag} - AI試行錯誤ブログ | ${SITE_NAME}`,
    description,
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: `${tag} - AI試行錯誤ブログ | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${BASE_URL}/blog/tag/${encodeURIComponent(tag)}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tag} - AI試行錯誤ブログ | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/tag/${encodeURIComponent(tag)}`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

/** Tag-filtered blog listing page (/blog/tag/[tag]) */
export default async function TagPage({ params }: Props) {
  const { tag: rawTag } = await params;
  // URL パラメータは Next.js によってデコードされるが、二重エンコードされた場合に備えて
  // 明示的に decodeURIComponent を適用する
  const tag = decodeURIComponent(rawTag);

  const posts = getPostsByTag(tag);

  // Return 404 for tags with too few posts to fill a page
  if (posts.length < MIN_POSTS_FOR_TAG_PAGE) {
    notFound();
  }

  const description =
    TAG_DESCRIPTIONS[tag] ??
    `AI試行錯誤ブログの「${tag}」タグが付いた記事一覧。`;

  const { items, totalPages } = paginate(posts, 1, BLOG_POSTS_PER_PAGE);

  return (
    <BlogListView
      posts={items}
      currentPage={1}
      totalPages={totalPages}
      basePath={`/blog/tag/${encodeURIComponent(tag)}`}
      tagHeader={{ tag, description }}
      allPosts={posts}
    />
  );
}
