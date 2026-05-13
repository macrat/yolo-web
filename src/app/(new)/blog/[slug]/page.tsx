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
       * proseWrapper: 狭い幅では max-width 720px 単一カラム。
       * デスクトップ（≥ 1024px）: CSS Grid [コンテンツ 720px] [TOC 220px]。
       *
       * T-2 対策: contentColumn を Grid 左カラム（col 1）に置くことで、
       * ヘッダー(.inner padding-left: 1.25rem)と本文左端の X 座標が一致する。
       *
       * DOM 順序: contentColumn を先（col 1）、tocSidebar を後（col 2）に置く。
       * 逆順にすると Grid auto-placement が干渉して col 1 が空白になるため必須。
       * grid-column を両要素に明示しているが、DOM 順序もあわせて揃えることで二重に安全。
       */}
      <div className={styles.proseWrapper}>
        {/*
         * contentColumn: Grid 左カラム（720px）。
         * DOM 先頭に置くことで auto-placement の干渉を防ぐ。
         * grid-column: 1 を明示しているため tocSidebar の有無に関わらず左端に固定される。
         * すべてのコンテンツ要素をこの div に収める。
         */}
        <div className={styles.contentColumn}>
          <Breadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "ブログ", href: "/blog" },
              { label: post.title },
            ]}
          />

          <header className={styles.articleHeader}>
            <h1 className={styles.title}>{post.title}</h1>
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
                <span>更新: {formatDate(post.updated_at)}</span>
              )}
              <span>{post.readingTime}分で読める</span>
            </div>
            {/* TODO(cycle-184/B-389): X1 採用時に削除 */}
            <TagList tags={post.tags} linkableTags={linkableTags} />
          </header>

          {/* SeriesNav: DESIGN.md §4「パネル入れ子禁止」対応で本文 Panel の外に並列配置 */}
          {post.series && (
            <Panel className={styles.seriesNavPanel}>
              <SeriesNav
                seriesId={post.series}
                currentSlug={post.slug}
                seriesPosts={getSeriesPosts(post.series)}
              />
            </Panel>
          )}

          {/*
           * モバイル向けインライン TOC（デスクトップでは CSS で非表示）。
           * Panel コンポーネントを使わず <details> に直接スタイル適用（T-1 対策）。
           * articlePanel との視覚的分離を明確にするため bg-soft + border スタイルを使用。
           * DESIGN.md §4「パネル入れ子禁止」にも整合（mobileToc は Panel でなく details 要素）。
           */}
          {post.headings.length > 0 && (
            <details className={styles.mobileToc}>
              <summary className={styles.mobileTocSummary}>目次</summary>
              <TableOfContents headings={post.headings} />
            </details>
          )}

          {/*
           * 本文 Panel（DESIGN.md §1「すべてのコンテンツはパネル」）。
           * §4 入れ子禁止: Markdown 標準要素は Panel コンポーネントを使わないため入れ子非該当。
           */}
          <Panel
            as="article"
            padding="comfortable"
            className={styles.articlePanel}
          >
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }} // markdownToHtml() 内部で sanitize 済み
            />
          </Panel>

          <MermaidRenderer />

          <section
            className={styles.shareSection}
            aria-label="この記事をシェア"
          >
            <h2 className={styles.shareSectionTitle}>この記事をシェア</h2>
            <ShareButtons
              url={`/blog/${post.slug}`}
              title={post.title}
              sns={["x", "line", "hatena", "copy"]}
              contentType="blog"
              contentId={post.slug}
            />
          </section>

          {/* 関連記事（DESIGN.md §4: 本文 Panel 外の並列配置） */}
          <RelatedArticles posts={relatedPosts} />

          {/*
           * 前後ナビゲーション（投稿日時系列順）。
           * シリーズ記事でも常時表示し、時系列ナビであることをラベルで明示する。
           * SeriesNav 側は「シリーズ内の前/次の記事」ラベルで区別済み。
           */}
          <nav className={styles.postNav} aria-label="前後の記事（時系列順）">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className={styles.prevPost}>
                <span className={styles.navLabel}>
                  {post.series ? "すべての記事から：前の記事" : "前の記事"}
                </span>
                <span className={styles.navTitle}>{prevPost.title}</span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} className={styles.nextPost}>
                <span className={styles.navLabel}>
                  {post.series ? "すべての記事から：次の記事" : "次の記事"}
                </span>
                <span className={styles.navTitle}>{nextPost.title}</span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        </div>

        {/*
         * デスクトップ TOC サイドバー（Grid 右カラム）。
         * DOM で contentColumn の後に置くことで auto-placement と干渉しない。
         * モバイルでは CSS で display:none。mobileToc が代わりに表示される。
         * Panel 化: DESIGN.md §1「すべてのコンテンツはパネル」。
         */}
        {post.headings.length > 0 && (
          <Panel as="aside" className={styles.tocSidebar}>
            <TableOfContents headings={post.headings} />
          </Panel>
        )}
      </div>
    </div>
  );
}
