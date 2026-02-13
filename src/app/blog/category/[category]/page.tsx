import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type BlogCategory,
} from "@/lib/blog";
import { SITE_NAME } from "@/lib/constants";
import BlogCard from "@/components/blog/BlogCard";
import AiDisclaimer from "@/components/common/AiDisclaimer";
import styles from "../../page.module.css";

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

  return {
    title: `${label} - AI試行錯誤ブログ | ${SITE_NAME}`,
    description: `AI試行錯誤ブログの「${label}」カテゴリの記事一覧。`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!ALL_CATEGORIES.includes(category as BlogCategory)) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const posts = allPosts.filter((p) => p.category === category);
  const currentLabel = CATEGORY_LABELS[category as BlogCategory];

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>AI試行錯誤ブログ</h1>
        <p className={styles.description}>{currentLabel}カテゴリの記事一覧</p>
      </header>

      <nav className={styles.filters} aria-label="Category filter">
        <Link href="/blog" className={styles.filterPill}>
          すべて
        </Link>
        {ALL_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/blog/category/${cat}`}
            className={styles.filterPill}
            data-active={cat === category ? "true" : undefined}
          >
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </nav>

      {posts.length === 0 ? (
        <p className={styles.empty}>
          このカテゴリの記事はまだありません。
        </p>
      ) : (
        <div className={styles.grid}>
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      <AiDisclaimer />
    </main>
  );
}
