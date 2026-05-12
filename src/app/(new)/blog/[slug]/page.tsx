/**
 * ブログ詳細ページ — (new) デザインシステム実装
 *
 * cycle-188 採用案 C: Panel デフォルト構造（枠線あり + 白背景）で本文を囲む。
 * DESIGN.md §1「すべてのコンテンツはパネル」を視覚的に満たす。
 * DESIGN.md §4「パネルは入れ子にしない」— RelatedArticles / SeriesNav / 前後ナビは本文 Panel の外側に並列配置。
 *
 * SeriesNav 自身が border + background を持つパネル的な矩形コンテナとして実装されているため、
 * Panel コンポーネントでの重ねラップは行わない（二重スタイルを避ける）。
 * SeriesNav は SeriesNav.module.css により §1 準拠の視覚を達成している。
 */
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
import Breadcrumb from "@/components/Breadcrumb";
import ShareButtons from "@/components/ShareButtons";
import Panel from "@/components/Panel";
import TableOfContents from "@/blog/_components/TableOfContents";
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
  // allPosts は新しい順のため、index+1 が「前の記事（古い）」、index-1 が「次の記事（新しい）」
  const prevPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const relatedPosts = getRelatedPosts(post, allPosts);

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
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />

      {/*
       * 720px 単一ラッパー: パンくず / タイトル / メタ情報 の左端起点を統一
       * cycle-188 再着手条件3: タイトル幅と本文幅の左端を構造的に一致させる
       */}
      <div className={styles.proseWrapper}>
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ブログ", href: "/blog" },
            { label: post.title },
          ]}
        />

        {/* タイトル・メタ情報ヘッダー（パンくずとは margin で視覚的に分離） */}
        <header className={styles.articleHeader}>
          <h1 className={styles.title}>{post.title}</h1>
          {/* メタ情報: color + size + 余白の組み合わせで階層化（単一手段に依存しない） */}
          <div className={styles.meta}>
            <Link
              href={`/blog/category/${post.category}`}
              className={styles.category}
            >
              {CATEGORY_LABELS[post.category]}
            </Link>
            <time dateTime={post.published_at} className={styles.metaItem}>
              {formatDate(post.published_at)}
            </time>
            {post.updated_at !== post.published_at && (
              <span className={styles.metaItem}>
                更新: {formatDate(post.updated_at)}
              </span>
            )}
            <span className={styles.metaItem}>
              {post.readingTime}分で読める
            </span>
          </div>
          {/* TODO(cycle-184/B-389): X1 採用時に削除 */}
          <TagList tags={post.tags} linkableTags={linkableTags} />
        </header>

        {/*
         * SeriesNav: §4「パネル入れ子禁止」対応として本文 Panel の外側・上に配置。
         * SeriesNav.module.css が border + background を持つパネル的な外観を持つため
         * Panel コンポーネントでのラップは行わない（二重スタイルを避ける）。
         */}
        {post.series && (
          <SeriesNav
            seriesId={post.series}
            currentSlug={post.slug}
            seriesPosts={getSeriesPosts(post.series)}
          />
        )}

        {/* モバイル向けインラインTOC（デスクトップでは CSS で非表示） */}
        {post.headings.length > 0 && (
          <details className={styles.mobileToc}>
            <summary className={styles.mobileTocSummary}>目次</summary>
            <TableOfContents headings={post.headings} />
          </details>
        )}
      </div>

      {/*
       * 本文エリア: 本文 Panel + デスクトップ TOC を横並び
       * max-width 1200px で TOC を横に並べ、本文は proseWrapperInner で 720px に収める
       */}
      <div className={styles.contentArea}>
        <div className={styles.proseWrapperInner}>
          {/*
           * 本文 Panel: 採用案 C = Panel デフォルト（枠線あり + 白背景）
           * DESIGN.md §1 を最も直接的に満たす矩形コンテナ
           * §4 入れ子禁止: RelatedArticles・SeriesNav は Panel の外側
           * Markdown 標準要素（code block / GFM Alert / table 等）は Panel コンポーネントを使わないため入れ子非該当
           */}
          <Panel as="article" className={styles.articlePanel}>
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </Panel>

          <MermaidRenderer />
        </div>

        {/* デスクトップ TOC: 本文の右側に並列配置（§4 入れ子なし） */}
        {post.headings.length > 0 && (
          <aside className={styles.tocSidebar}>
            <TableOfContents headings={post.headings} />
          </aside>
        )}
      </div>

      {/*
       * シェア・関連記事・前後ナビは本文 Panel の外側、720px ラッパー内
       * §4「パネル入れ子禁止」対応: 本文 Panel の外側に並列配置
       */}
      <div className={styles.proseWrapper}>
        {/* シェアボタン（WCAG 2.5.5: 44×44px — ShareButtons.module.css で確保済み） */}
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

        {/* 関連記事（本文 Panel の外側に並列配置 → §4 入れ子なし） */}
        <RelatedArticles posts={relatedPosts} />

        {/* 前後ナビゲーション */}
        <nav className={styles.postNav} aria-label="前後の記事">
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className={styles.prevPost}>
              <span className={styles.navLabel}>前の記事</span>
              {/* lgtm[js/stored-xss] - blog slugs from local markdown files, not user input */}
              <span className={styles.navTitle}>{prevPost.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className={styles.nextPost}>
              <span className={styles.navLabel}>次の記事</span>
              {/* lgtm[js/stored-xss] - blog slugs from local markdown files, not user input */}
              <span className={styles.navTitle}>{nextPost.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
