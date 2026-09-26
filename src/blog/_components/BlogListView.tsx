import Accordion from "@/components/Accordion";
import Breadcrumb from "@/components/Breadcrumb";
import BrowsableList from "@/components/BrowsableList";
import LinkIndex from "@/components/LinkIndex";
import Section from "@/components/Section";
import { Fragment } from "react";
import { formatDate } from "@/lib/date";
import type { BreadcrumbItem } from "@/lib/seo";
import type { BrowseItem, BrowseSort } from "@/lib/list-browse";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import {
  CATEGORY_LABELS,
  SERIES_LABELS,
  type BlogPostMeta,
} from "@/blog/_lib/blog";
import {
  BLOG_LIST_PER_PAGE,
  blogIndexEntries,
  blogListBasePath,
  blogListDescription,
  blogListHeading,
  blogListHeadingPhrases,
  blogListPosts,
  blogListTitle,
  type BlogListScope,
} from "@/blog/_lib/blog-list";
import styles from "./BlogListView.module.css";

/** 並び順。既定は新しい順で、初めから順に読みたい人が古い順を選ぶ（§7）。 */
const BLOG_SORTS: BrowseSort[] = [
  { value: "newest", label: "新しい順", directions: ["desc"] },
  { value: "oldest", label: "古い順" },
];

function blogItem(post: BlogPostMeta): BrowseItem {
  const publishedAt = Date.parse(post.published_at);
  const seriesLabel = post.series ? SERIES_LABELS[post.series] : undefined;
  return {
    name: post.title,
    slug: post.slug,
    description: post.description,
    kind: CATEGORY_LABELS[post.category],
    facts: [
      { text: formatDate(post.published_at), dateTime: post.published_at },
      { text: `${post.readingTime}分で読める` },
    ],
    searchTexts: [
      post.description,
      CATEGORY_LABELS[post.category],
      ...post.tags,
      ...(seriesLabel ? [seriesLabel] : []),
    ],
    sortKeys: { newest: [publishedAt], oldest: [publishedAt] },
  };
}

interface BlogListViewProps {
  scope: BlogListScope;
  /** パスが示すページ。 */
  page: number;
}

/**
 * ブログの一覧のページ（`/blog`・分類・タグ）。見出しと説明の下に、分類とタグの索引を閉じたアコーディオンで置き、
 * その下に範囲の記事の一覧を置く（DESIGN.md §7）。分類とタグのページは、パンくずでブログへ戻れる。
 *
 * 分類は行の種別として出るが、一覧の上に分類の索引を置くので、種別の組は置かない。分類で見たい来訪者は
 * 索引から分類のページへ移る。
 *
 * 記事の一覧の見出しは読み上げにだけ出す。見出しで移る来訪者が、一覧を索引の「タグ」の中身と取り違えずに
 * 一覧へ移れるようにするためで、目で見る来訪者には主見出しがそのまま一覧の見出しになる。
 */
export default function BlogListView({ scope, page }: BlogListViewProps) {
  const heading = blogListHeading(scope);
  const basePath = blogListBasePath(scope);
  const index = blogIndexEntries();
  const trail: BreadcrumbItem[] = [
    { label: "ホーム", href: "/" },
    { label: "ブログ", href: "/blog" },
    { label: heading },
  ];

  return (
    <Section>
      <div className={styles.view}>
        {scope.type === "all" ? null : <Breadcrumb items={trail} />}
        <div>
          <h1 className={styles.title} {...headingFontAttr(heading)}>
            {blogListHeadingPhrases(scope).map((phrase, i) => (
              <Fragment key={phrase}>
                {i > 0 ? <wbr /> : null}
                {phrase}
              </Fragment>
            ))}
          </h1>
          <p className={styles.description}>{blogListDescription(scope)}</p>
        </div>
        <Accordion summary="分類・タグから探す">
          <div className={styles.index}>
            <div className={styles.indexPart}>
              <h2 id="blog-index-categories" className={styles.indexHeading}>
                分類（{index.categories.length}）
              </h2>
              <LinkIndex
                labelledBy="blog-index-categories"
                items={index.categories}
                currentHref={basePath}
              />
            </div>
            <div className={styles.indexPart}>
              <h2 id="blog-index-tags" className={styles.indexHeading}>
                タグ（{index.tags.length}）
              </h2>
              <LinkIndex
                labelledBy="blog-index-tags"
                items={index.tags}
                currentHref={basePath}
              />
            </div>
          </div>
        </Accordion>
        <h2 className="visually-hidden">記事の一覧</h2>
        <BrowsableList
          items={blogListPosts(scope).map(blogItem)}
          hrefPrefix="/blog/"
          label="記事の一覧"
          unit="件"
          searchLabel="題名・説明・分類・タグ・連載名で探す"
          sorts={BLOG_SORTS}
          perPage={BLOG_LIST_PER_PAGE}
          basePath={basePath}
          page={page}
          pageTitle={blogListTitle(scope)}
        />
      </div>
    </Section>
  );
}
