import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostsByTag,
  getTagsWithMinPosts,
  TAG_DESCRIPTIONS,
  MIN_POSTS_FOR_TAG_INDEX,
} from "@/blog/_lib/blog";
import { paginate, BLOG_POSTS_PER_PAGE } from "@/lib/pagination";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import BlogListView from "@/blog/_components/BlogListView";

/** Minimum number of posts a tag must have to generate a static page. */
const MIN_POSTS_FOR_TAG_PAGE = 3;

interface Props {
  params: Promise<{ tag: string; page: string }>;
}

/** Only allow statically generated page numbers; return 404 for others */
export const dynamicParams = false;

/**
 * Generate params for every tag x page combination (pages 2+).
 * Page 1 of each tag is handled by the parent page.tsx.
 */
export function generateStaticParams() {
  const tags = getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE);
  const params: { tag: string; page: string }[] = [];

  for (const tag of tags) {
    const posts = getPostsByTag(tag);
    const { totalPages } = paginate(posts, 1, BLOG_POSTS_PER_PAGE);

    for (let i = 2; i <= totalPages; i++) {
      params.push({ tag, page: String(i) });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: rawTag, page } = await params;
  const tag = decodeURIComponent(rawTag);
  const pageNum = Number(page);
  const posts = getPostsByTag(tag);

  if (posts.length < MIN_POSTS_FOR_TAG_PAGE) return {};

  const description =
    TAG_DESCRIPTIONS[tag] ??
    `AI試行錯誤ブログの「${tag}」タグが付いた記事一覧。`;

  const shouldIndex = posts.length >= MIN_POSTS_FOR_TAG_INDEX;
  const encodedTag = encodeURIComponent(tag);

  return {
    title: `${tag} - AI試行錯誤ブログ（${pageNum}ページ目） | ${SITE_NAME}`,
    description,
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: `${tag} - AI試行錯誤ブログ（${pageNum}ページ目） | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${BASE_URL}/blog/tag/${encodedTag}/page/${pageNum}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tag} - AI試行錯誤ブログ（${pageNum}ページ目） | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/tag/${encodedTag}/page/${pageNum}`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

/** Tag blog listing pages 2+ (/blog/tag/[tag]/page/[page]) */
export default async function TagPaginatedPage({ params }: Props) {
  const { tag: rawTag, page } = await params;
  const tag = decodeURIComponent(rawTag);
  const pageNum = Number(page);

  const posts = getPostsByTag(tag);

  // Return 404 for tags with too few posts
  if (posts.length < MIN_POSTS_FOR_TAG_PAGE) {
    notFound();
  }

  const description =
    TAG_DESCRIPTIONS[tag] ??
    `AI試行錯誤ブログの「${tag}」タグが付いた記事一覧。`;

  const { items, totalPages } = paginate(posts, pageNum, BLOG_POSTS_PER_PAGE);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ブログ",
        item: `${BASE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tag,
        item: `${BASE_URL}/blog/tag/${encodeURIComponent(tag)}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogListView
        posts={items}
        currentPage={pageNum}
        totalPages={totalPages}
        basePath={`/blog/tag/${encodeURIComponent(tag)}`}
        tagHeader={{ tag, description }}
        allPosts={posts}
      />
    </>
  );
}
