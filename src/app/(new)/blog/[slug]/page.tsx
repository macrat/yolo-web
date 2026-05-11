import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogPosts,
  getAllBlogSlugs,
  getBlogPostBySlug,
  getRelatedPosts,
  getSeriesPosts,
  getTagsWithMinPosts,
  CATEGORY_LABELS,
} from "@/blog/_lib/blog";
import {
  generateBlogPostMetadata,
  generateBlogPostJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import { BASE_URL } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import Breadcrumb from "@/components/common/Breadcrumb";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import ShareButtons from "@/components/common/ShareButtons";
import TableOfContents from "@/blog/_components/TableOfContents";
import TagList from "@/blog/_components/TagList";
import SeriesNav from "@/blog/_components/SeriesNav";
import MermaidRenderer from "@/blog/_components/MermaidRenderer";
import RelatedArticles from "@/blog/_components/RelatedArticles";
import PlayRecommendBlock from "@/play/_components/PlayRecommendBlock";
import { getPlayRecommendationsForBlog } from "@/play/recommendation";
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

  const relatedPosts = getRelatedPosts(post, allPosts);
  const playRecommendations = getPlayRecommendationsForBlog(post.tags);

  // TODO(cycle-184/B-389): X1 採用時に削除（タグ UI 完全廃止）
  // MIN_POSTS_FOR_TAG_PAGE = 3 未満のタグはタグページが存在しないため UI から非表示にする。
  // getTagsWithMinPosts は node:fs 依存のため Server Component のここで計算し props で渡す。
  const MIN_POSTS_FOR_TAG_PAGE = 3; // TODO(cycle-184/B-389): X1 採用時に一括削除
  const linkableTags = new Set(getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE));

  const jsonLd = generateBlogPostJsonLd({
    ...post,
    image: `${BASE_URL}/blog/${slug}/opengraph-image`,
  });

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
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
            <TrustLevelBadge level={post.trustLevel} />
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
          {/* TODO(cycle-184/B-389): X1 採用時に削除 */}
          <TagList tags={post.tags} linkableTags={linkableTags} />
        </header>

        {post.series && (
          <SeriesNav
            seriesId={post.series}
            currentSlug={post.slug}
            seriesPosts={getSeriesPosts(post.series)}
          />
        )}

        {/* モバイル向けインラインTOC（デスクトップではCSSで非表示） */}
        {post.headings.length > 0 && (
          <details className={styles.mobileToc}>
            <summary className={styles.mobileTocSummary}>目次</summary>
            <TableOfContents headings={post.headings} />
          </details>
        )}

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

        <section className={styles.shareSection}>
          <h2 className={styles.shareSectionTitle}>
            {"\u3053\u306E\u8A18\u4E8B\u3092\u30B7\u30A7\u30A2"}
          </h2>
          <ShareButtons
            url={`/blog/${post.slug}`}
            title={post.title}
            sns={["x", "line", "hatena", "copy"]}
            contentType="blog"
            contentId={post.slug}
          />
        </section>

        <RelatedArticles posts={relatedPosts} />
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

      <PlayRecommendBlock
        recommendations={playRecommendations}
        heading="この記事を読んだあなたに"
        subtext="ブラウザで今すぐ遊べる診断・占い"
      />
    </div>
  );
}
