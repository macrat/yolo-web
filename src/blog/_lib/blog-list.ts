/**
 * ブログの一覧のページ（`/blog`・分類・タグ）の範囲と、そのページの題・説明・metadata・静的なページ番号・
 * 一覧の項目・並び順。一覧のページの経路は、どれもここから範囲を受け取り、同じ形で組む。
 */

import type { Metadata } from "next";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import type { BrowseItem, BrowseSort } from "@/lib/list-browse";
import {
  listPageHref,
  listPageStaticParams,
  listPageTitle,
} from "@/lib/list-pages";
import {
  ALL_CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  MIN_POSTS_FOR_TAG_INDEX,
  MIN_POSTS_FOR_TAG_PAGE,
  SERIES_LABELS,
  TAG_DESCRIPTIONS,
  getAllBlogPosts,
  getPostsByTag,
  type BlogCategory,
  type BlogPostMeta,
} from "./blog";

/** 一覧のページが受け持つ範囲。ブログ全体か、1つの分類か、1つのタグ。 */
export type BlogListScope =
  | { type: "all" }
  | { type: "category"; category: BlogCategory }
  | { type: "tag"; tag: string };

/** 1ページの件数。記事の行は説明を持つので 50（DESIGN.md §7）。 */
export const BLOG_LIST_PER_PAGE = 50;

/** ブログの名前を、意味の切れ目で分けたもの。 */
const BLOG_TITLE_PHRASES = ["AI", "試行錯誤", "ブログ"];

const BLOG_TITLE = BLOG_TITLE_PHRASES.join("");

const BLOG_DESCRIPTION =
  "AIエージェントたちがサイトを運営する過程を公開。意思決定、技術的挑戦、失敗と学びを記録します。";

/** 範囲の記事。新しい順。 */
export function blogListPosts(scope: BlogListScope): BlogPostMeta[] {
  switch (scope.type) {
    case "all":
      return getAllBlogPosts();
    case "category":
      return getAllBlogPosts().filter(
        (post) => post.category === scope.category,
      );
    case "tag":
      return getPostsByTag(scope.tag);
  }
}

/** 並び順。既定は新しい順で、初めから順に読みたい人が古い順を選ぶ（§7）。どちらも公開の日時で比べる。 */
export const BLOG_SORTS: BrowseSort[] = [
  {
    value: "newest",
    label: "新しい順",
    keys: [{ by: "factTime", index: 0, desc: true }],
  },
  { value: "oldest", label: "古い順", keys: [{ by: "factTime", index: 0 }] },
];

function blogItem(post: BlogPostMeta): BrowseItem {
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
  };
}

/** 範囲の記事を、一覧の項目にして返す。範囲の記事は新しい順なので、既定の並び順のまま。 */
export function blogListItems(scope: BlogListScope): BrowseItem[] {
  return blogListPosts(scope).map(blogItem);
}

/** 分類の値が、いまある分類か。 */
export function isBlogCategory(value: string): value is BlogCategory {
  return (ALL_CATEGORIES as string[]).includes(value);
}

/** タグが一覧のページを持つか。記事が MIN_POSTS_FOR_TAG_PAGE 件に満たないタグは持たない。 */
export function hasTagPage(tag: string): boolean {
  return blogListPosts({ type: "tag", tag }).length >= MIN_POSTS_FOR_TAG_PAGE;
}

/** 一覧の元のパス。ページ n の URL は listPageHref で組む。 */
export function blogListBasePath(scope: BlogListScope): string {
  switch (scope.type) {
    case "all":
      return "/blog";
    case "category":
      return `/blog/category/${scope.category}`;
    case "tag":
      return `/blog/tag/${encodeURIComponent(scope.tag)}`;
  }
}

/** 一覧のページの見出し。 */
export function blogListHeading(scope: BlogListScope): string {
  switch (scope.type) {
    case "all":
      return BLOG_TITLE;
    case "category":
      return CATEGORY_LABELS[scope.category];
    case "tag":
      return scope.tag;
  }
}

/**
 * 一覧のページの見出しを、意味の切れ目で分けたもの。見出しは、幅に収まらないときこの切れ目で折る（DESIGN.md §4）。
 */
export function blogListHeadingPhrases(scope: BlogListScope): string[] {
  return scope.type === "all" ? BLOG_TITLE_PHRASES : [blogListHeading(scope)];
}

/** 一覧のページの題（サイト名と「（n ページ目）」を除いたもの）。 */
export function blogListTitle(scope: BlogListScope): string {
  return scope.type === "all"
    ? BLOG_TITLE
    : `${blogListHeading(scope)} - ${BLOG_TITLE}`;
}

/** 見出しの下に置き、metadata の説明にも使う文。 */
export function blogListDescription(scope: BlogListScope): string {
  switch (scope.type) {
    case "all":
      return BLOG_DESCRIPTION;
    case "category":
      return CATEGORY_DESCRIPTIONS[scope.category];
    case "tag":
      return (
        TAG_DESCRIPTIONS[scope.tag] ??
        `AI試行錯誤ブログの「${scope.tag}」タグが付いた記事の一覧です。`
      );
  }
}

/** 2ページ目から最後のページまでの `page` の値。 */
export function blogListPageParams(
  scope: BlogListScope,
): Array<{ page: string }> {
  return listPageStaticParams(blogListPosts(scope).length, BLOG_LIST_PER_PAGE);
}

/** 一覧のページの metadata。2ページ目からも自分を canonical にする。 */
export function blogListMetadata(scope: BlogListScope, page: number): Metadata {
  const title = listPageTitle(blogListTitle(scope), page);
  const description = blogListDescription(scope);
  const url = `${BASE_URL}${listPageHref(blogListBasePath(scope), page)}`;
  const robots =
    scope.type === "tag"
      ? blogListPosts(scope).length >= MIN_POSTS_FOR_TAG_INDEX
        ? { index: true, follow: true }
        : { index: false, follow: true }
      : undefined;
  return {
    title,
    description,
    ...(robots ? { robots } : {}),
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

/** 一覧の上の索引を入れるアコーディオンのラベルを、語の切れ目で分けたもの（DESIGN.md §4）。 */
export const BLOG_INDEX_SUMMARY = ["分類・", "タグから", "探す"] as const;

/** 索引の1語。分類かタグと、それに属する記事の数。 */
export interface BlogIndexEntry {
  label: string;
  href: string;
  count: number;
}

/**
 * 一覧の上の索引に並べる分類とタグ。どちらも順を持たないので、記事の多い順に並べる（§7）。
 * 同じ数のものは、分類は ALL_CATEGORIES の順、タグは名前の順のまま並ぶ。
 * タグは一覧のページを持つものだけを並べる。
 */
export function blogIndexEntries(): {
  categories: BlogIndexEntry[];
  tags: BlogIndexEntry[];
} {
  const posts = getAllBlogPosts();
  const categories = ALL_CATEGORIES.map((category) => ({
    label: CATEGORY_LABELS[category],
    href: blogListBasePath({ type: "category", category }),
    count: posts.filter((post) => post.category === category).length,
  }));
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const tags = Array.from(tagCounts.entries())
    .filter(([, count]) => count >= MIN_POSTS_FOR_TAG_PAGE)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([tag, count]) => ({
      label: tag,
      href: blogListBasePath({ type: "tag", tag }),
      count,
    }));
  const byCount = (a: BlogIndexEntry, b: BlogIndexEntry) => b.count - a.count;
  return {
    categories: categories.filter((entry) => entry.count > 0).sort(byCount),
    tags: tags.sort(byCount),
  };
}
