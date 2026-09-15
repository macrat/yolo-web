import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type BlogCategory,
} from "@/blog/_lib/blog";
import { paginate, BLOG_POSTS_PER_PAGE } from "@/lib/pagination";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import BlogListView from "@/blog/_components/BlogListView";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return ALL_CATEGORIES.map((cat) => ({ category: cat }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = CATEGORY_LABELS[category as BlogCategory];
  if (!label) return {};

  const description =
    CATEGORY_DESCRIPTIONS[category as BlogCategory] ??
    `AI試行錯誤ブログの「${label}」カテゴリの記事一覧。`;

  return {
    title: `${label} - AI試行錯誤ブログ | ${SITE_NAME}`,
    description,
    openGraph: {
      title: `${label} - AI試行錯誤ブログ | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${BASE_URL}/blog/category/${category}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} - AI試行錯誤ブログ | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/category/${category}`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

/** Category blog listing page 1 (/blog/category/[category]) */
export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!ALL_CATEGORIES.includes(category as BlogCategory)) {
    notFound();
  }

  const label = CATEGORY_LABELS[category as BlogCategory];
  const allPosts = getAllBlogPosts();
  const categoryPosts = allPosts.filter((p) => p.category === category);
  const { items, totalPages } = paginate(categoryPosts, 1, BLOG_POSTS_PER_PAGE);

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
        name: label,
        item: `${BASE_URL}/blog/category/${category}`,
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
        basePath={`/blog/category/${category}`}
        activeCategory={category as BlogCategory}
        allPosts={allPosts}
      />
    </>
  );
}
