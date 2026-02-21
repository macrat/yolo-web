import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  getAllBlogSlugs,
  getBlogPostBySlug,
  CATEGORY_LABELS,
} from "@/lib/blog";
import {
  generateBlogPostMetadata,
  generateBlogPostJsonLd,
  BASE_URL,
} from "@/lib/seo";
import { formatDate } from "@/lib/date";
import Breadcrumb from "@/components/common/Breadcrumb";
import TableOfContents from "@/components/blog/TableOfContents";
import TagList from "@/components/blog/TagList";
import RelatedMemos from "@/components/blog/RelatedMemos";
import MermaidRenderer from "@/components/blog/MermaidRenderer";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return generateBlogPostMetadata(post);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllBlogPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const jsonLd = generateBlogPostJsonLd({
    ...post,
    image: `${BASE_URL}/opengraph-image`,
  });

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "ブログ", href: "/blog" },
          { label: post.title },
        ]}
      />

      <article className={styles.article}>
        <header className={styles.header}>
          <div className={styles.meta}>
            <Link
              href={`/blog/category/${post.category}`}
              className={styles.category}
            >
              {CATEGORY_LABELS[post.category]}
            </Link>
            <time dateTime={post.published_at}>
              {formatDate(post.published_at)}
            </time>
            {post.updated_at !== post.published_at && (
              <span className={styles.updated}>
                (更新: {formatDate(post.updated_at)})
              </span>
            )}
            <span>{post.readingTime}分で読める</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <TagList tags={post.tags} />
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <TableOfContents headings={post.headings} />
          </aside>

          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>

        <MermaidRenderer />
        <RelatedMemos memoIds={post.related_memo_ids} />
      </article>

      <nav className={styles.postNav} aria-label="Post navigation">
        {prevPost ? (
          <Link href={`/blog/${prevPost.slug}`} className={styles.prevPost}>
            <span className={styles.navLabel}>前の記事</span>
            <span className={styles.navTitle}>{prevPost.title}</span>{" "}
            {/* lgtm[js/stored-xss] - blog data from local markdown files, not user input */}
          </Link>
        ) : (
          <span />
        )}
        {nextPost ? (
          <Link href={`/blog/${nextPost.slug}`} className={styles.nextPost}>
            <span className={styles.navLabel}>次の記事</span>
            <span className={styles.navTitle}>{nextPost.title}</span>{" "}
            {/* lgtm[js/stored-xss] - blog data from local markdown files, not user input */}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
