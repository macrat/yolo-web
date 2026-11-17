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
import { formatDate } from "@/lib/date";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { shareOpenGraphImage } from "@/lib/share-image";
import { blogShareImageContent } from "@/blog/_lib/share-image-content";
import Breadcrumb from "@/components/Breadcrumb";
import PhrasedText from "@/components/PhrasedText";
import ShareButtons from "@/components/ShareButtons";
import CollapsibleTOC from "@/blog/_components/CollapsibleTOC";
import TagList from "@/blog/_components/TagList";
import SeriesNav from "@/blog/_components/SeriesNav";
import MermaidRenderer from "@/blog/_components/MermaidRenderer";
import RelatedArticles from "@/blog/_components/RelatedArticles";
import Prose from "@/components/Prose";
import Section from "@/components/Section";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

const SHARE_HEADING_ID = "share-this-post";

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  return generateBlogPostMetadata(
    post,
    shareOpenGraphImage(`/blog/${slug}`, blogShareImageContent(post)),
  );
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
    image: shareOpenGraphImage(`/blog/${slug}`, blogShareImageContent(post))
      .url,
  });

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />

      {/*
       * 記事の頭・目次・連載の案内・本文を1つのセクションに置く。目次はこのセクションの中で画面の上端に留まるので、
       * 本文を読み終えるまで留まり、そのあとのセクションでは留まらない。
       */}
      <Section>
        <div className={styles.body}>
          <header className={styles.header}>
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
            <PhrasedText as="h1" phrases={splitIntoPhrases(post.title)} />
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

          {post.headings.length > 0 && (
            <CollapsibleTOC headings={post.headings} contentId={post.slug} />
          )}

          {post.series && (
            <SeriesNav
              seriesId={post.series}
              currentSlug={post.slug}
              seriesPosts={getSeriesPosts(post.series)}
            />
          )}

          {/* markdownToHtml() の中でサニタイズしてある。 */}
          <Prose className={styles.prose} html={post.contentHtml} />

          <MermaidRenderer />
        </div>
      </Section>

      <Section aria-labelledby={SHARE_HEADING_ID}>
        <PhrasedText
          as="h2"
          id={SHARE_HEADING_ID}
          className={styles.heading}
          phrases={["この", "記事を", "シェア"]}
        />
        <ShareButtons
          url={`/blog/${post.slug}`}
          title={post.title}
          sns={["x", "line", "hatena", "copy"]}
          contentType="blog"
          contentId={post.slug}
        />
      </Section>

      <RelatedArticles posts={relatedPosts} />

      {/*
       * 公開の順の前後の記事。連載の記事でも出し、連載の最後の回でも次に読む記事へ進める。連載の前後の回は
       * 連載の案内が持つので、こちらは時系列順であることを読み上げに伝える。
       */}
      {(prevPost || nextPost) && (
        <Section>
          <PhrasedText
            as="h2"
            className={styles.heading}
            phrases={["前後の", "記事"]}
          />
          <nav className={styles.postNav} aria-label="前後の記事（時系列順）">
            {prevPost && (
              <Link
                href={`/blog/${prevPost.slug}`}
                className={styles.postNavLink}
                data-text-box="inline"
              >
                <span className={styles.postNavLabel}>前の記事</span>
                <span className={styles.postNavTitle}>{prevPost.title}</span>
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className={styles.postNavLink}
                data-text-box="inline"
              >
                <span className={styles.postNavLabel}>次の記事</span>
                <span className={styles.postNavTitle}>{nextPost.title}</span>
              </Link>
            )}
          </nav>
        </Section>
      )}
    </article>
  );
}
