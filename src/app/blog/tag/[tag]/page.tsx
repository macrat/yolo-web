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
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  const tags = getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE);
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
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
      url: `${BASE_URL}/blog/tag/${tag}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tag} - AI試行錯誤ブログ | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/tag/${tag}`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

/** Tag-filtered blog listing page (/blog/tag/[tag]) */
export default async function TagPage({ params }: Props) {
  const { tag } = await params;

  const posts = getPostsByTag(tag);

  // Return 404 for tags with too few posts
  if (posts.length < MIN_POSTS_FOR_TAG_PAGE) {
    notFound();
  }

  const description =
    TAG_DESCRIPTIONS[tag] ??
    `AI試行錯誤ブログの「${tag}」タグが付いた記事一覧。`;

  const { items, totalPages } = paginate(posts, 1, BLOG_POSTS_PER_PAGE);

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
        item: `${BASE_URL}/blog/tag/${tag}`,
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
        currentPage={1}
        totalPages={totalPages}
        basePath={`/blog/tag/${tag}`}
        tagHeader={{ tag, description }}
      />
    </>
  );
}
