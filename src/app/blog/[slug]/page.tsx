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
  MIN_POSTS_FOR_TAG_PAGE,
} from "@/blog/_lib/blog";
import {
  generateBlogPostMetadata,
  generateBlogPostJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import { BASE_URL } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import Breadcrumb from "@/components/Breadcrumb";
import ShareButtons from "@/components/ShareButtons";
import CollapsibleTOC from "@/blog/_components/CollapsibleTOC";
import TagList from "@/blog/_components/TagList";
import SeriesNav from "@/blog/_components/SeriesNav";
import MermaidRenderer from "@/blog/_components/MermaidRenderer";
import RelatedArticles from "@/blog/_components/RelatedArticles";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return generateBlogPostMetadata(post);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllBlogPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  // allPosts は新しい順のため、index+1 が「前の記事（古い）」、index-1 が「次の記事（新しい）」
  const prevPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const relatedPosts = getRelatedPosts(post, allPosts);

  // 一覧のページを持つタグだけをリンクにする。
  const linkableTags = new Set(getTagsWithMinPosts(MIN_POSTS_FOR_TAG_PAGE));

  const jsonLd = generateBlogPostJsonLd({
    ...post,
    image: `${BASE_URL}/blog/${slug}/opengraph-image`,
  });

  return (
    <article className={styles.contentColumn}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />

      <header className={styles.articleHeader}>
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ブログ", href: "/blog" },
            {
              label: CATEGORY_LABELS[post.category],
              href: `/blog/category/${post.category}`,
            },
            { label: post.title, href: `/blog/${post.slug}` },
          ]}
        />
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <Link
            href={`/blog/category/${post.category}`}
            className={styles.category}
            data-text-box="inline"
          >
            {CATEGORY_LABELS[post.category]}
          </Link>
          <time dateTime={post.published_at}>
            {formatDate(post.published_at)}
          </time>
          {post.updated_at !== post.published_at && (
            <span>更新: {formatDate(post.updated_at)}</span>
          )}
          <span>{post.readingTime}分で読める</span>
        </div>
        <TagList tags={post.tags} linkableTags={linkableTags} />
      </header>

      {/*
       * aside を main より DOM 先行に置くことで、モバイルの単一カラム時に
       * TOC が本文の上に並ぶ。デスクトップでは grid-column で左右を入れ替える。
       */}
      <div className={styles.articleBody}>
        {post.headings.length > 0 && (
          <aside className={styles.articleAside}>
            <CollapsibleTOC headings={post.headings} />
          </aside>
        )}

        <div className={styles.articleMain}>
          {post.series && (
            <SeriesNav
              seriesId={post.series}
              currentSlug={post.slug}
              seriesPosts={getSeriesPosts(post.series)}
            />
          )}

          {/*
           * 本文。矩形のコンテナには包まず、読む幅 --measure に絞ったテキスト列として直接置く（§5）。
           */}
          <div
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }} // markdownToHtml() 内部で sanitize 済み
          />

          <MermaidRenderer />
        </div>
      </div>

      <footer className={styles.articleFooter}>
        <section className={styles.shareSection} aria-label="この記事をシェア">
          <h2 className={styles.shareSectionTitle}>この記事をシェア</h2>
          <ShareButtons
            url={`/blog/${post.slug}`}
            title={post.title}
            sns={["x", "line", "hatena", "copy"]}
            contentType="blog"
            contentId={post.slug}
          />
        </section>

        {/* 関連記事 */}
        <RelatedArticles posts={relatedPosts} />

        {/*
         * 前後ナビゲーション（投稿日時系列順）。
         * シリーズ記事でも常時表示する（シリーズ最終回で動線が消えないため）。
         * aria-label で時系列順であることをスクリーンリーダー向けに明示している。
         */}
        <nav className={styles.postNav} aria-label="前後の記事（時系列順）">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className={styles.prevPost}
              data-text-box="inline"
            >
              <span className={styles.navLabel}>前の記事</span>
              <span className={styles.navTitle}>{prevPost.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className={styles.nextPost}
              data-text-box="inline"
            >
              <span className={styles.navLabel}>次の記事</span>
              <span className={styles.navTitle}>{nextPost.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      </footer>
    </article>
  );
}
