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
    /*
     * contentColumn: max-width: 1200px のページ全体ラッパー。
     * グローバルヘッダー/フッターの .inner と同じ幅・パディングで
     * サイト上から下まで左右端が揃う。
     */
    <article className={styles.contentColumn}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />

      {/* articleHeader: Breadcrumb・タイトル・メタ情報を横幅いっぱいに表示 */}
      <header className={styles.articleHeader}>
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ブログ", href: "/blog" },
            { label: post.title },
          ]}
        />
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

      {/*
       * articleBody: 「エの字」レイアウトの中央ボディ。
       * モバイル: 単一カラム（DOM 順序: aside(TOC) → main）。
       * デスクトップ（≥ 1024px）: CSS Grid [main 1fr] [aside 220px]。
       * aside を DOM 先行に置くことでモバイルで TOC が本文の上に自然に表示される。
       * デスクトップでは grid-column/grid-row で左右を入れ替え。
       */}
      <div className={styles.articleBody}>
        {/*
         * articleAside: TOC サイドバー（DOM 先頭でモバイル時は本文上に配置）。
         * CollapsibleTOC が <details> での開閉とシェブロン表示を担当する。
         * デスクトップ既定は開、モバイル既定は閉（client 側で viewport 判定）。
         * 折りたたみ時、親 .articleBody の :has() ルールが本文を広げる。
         */}
        {post.headings.length > 0 && (
          <aside className={styles.articleAside}>
            <CollapsibleTOC headings={post.headings} />
          </aside>
        )}

        {/*
         * articleMain: 本文エリア（SeriesNav Panel → 本文 Panel の縦並び）。
         * デスクトップでは grid-column: 1 / grid-row: 1 で左カラムに配置。
         */}
        <div className={styles.articleMain}>
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
           * 本文 Panel（DESIGN.md §1「すべてのコンテンツはパネル」）。
           * 外側 <article> がブログ記事のセマンティック境界を提供しているため、
           * このラッパーは ARIA 上意味のない <div> で十分（<section> はラベル無しだと
           * 「region」として読み上げられ冗長になる）。
           * §4 入れ子禁止: Markdown 標準要素は Panel コンポーネントを使わないため入れ子非該当。
           */}
          <Panel as="div" padding="comfortable" className={styles.articlePanel}>
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }} // markdownToHtml() 内部で sanitize 済み
            />
          </Panel>

          <MermaidRenderer />
        </div>
      </div>

      {/* articleFooter: シェア・関連記事・前後ナビを横幅いっぱいに表示 */}
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
      </footer>
    </article>
  );
}
