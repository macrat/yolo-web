/**
 * 四字熟語辞典の一覧のページ（トップ・カテゴリ）の範囲と、そのページの見出し・題・説明・metadata・静的なページ番号・
 * 一覧の項目・並び順・一覧の上の索引。一覧のページの経路は、どれもここから範囲を受け取り、同じ形で組む。
 */

import type { Metadata } from "next";
import type { LinkIndexItem } from "@/components/LinkIndex";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import {
  listPageHref,
  listPageStaticParams,
  listPageTitle,
} from "@/lib/list-pages";
import {
  sortBrowseItems,
  type BrowseItem,
  type BrowseSort,
} from "@/lib/list-browse";
import { getAllYoji, getYojiByCategory, getYojiCategories } from "./yoji";
import {
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
  type YojiCategory,
  type YojiEntry,
} from "./types";

/** 一覧のページが受け持つ範囲。四字熟語の全体か、1つのカテゴリ。 */
export type YojiListScope =
  { type: "all" } | { type: "category"; category: YojiCategory };

/** 1ページの件数。四字熟語の行は意味を説明に持つので 50（DESIGN.md §7）。 */
export const YOJI_LIST_PER_PAGE = 50;

const DICTIONARY_TITLE = "四字熟語辞典";

/** 範囲の四字熟語。データの順のまま。 */
export function yojiListEntries(scope: YojiListScope): YojiEntry[] {
  return scope.type === "all"
    ? getAllYoji()
    : getYojiByCategory(scope.category);
}

/** 一覧の元のパス。ページ n の URL は listPageHref で組む。 */
export function yojiListBasePath(scope: YojiListScope): string {
  return scope.type === "all"
    ? "/dictionary/yoji"
    : `/dictionary/yoji/category/${scope.category}`;
}

/** 一覧のページの見出し。 */
export function yojiListHeading(scope: YojiListScope): string {
  return scope.type === "all"
    ? DICTIONARY_TITLE
    : `${YOJI_CATEGORY_LABELS[scope.category]}の四字熟語`;
}

/** 一覧のページの題（サイト名と「（n ページ目）」を除いたもの）。 */
export function yojiListTitle(scope: YojiListScope): string {
  return scope.type === "all"
    ? DICTIONARY_TITLE
    : `${yojiListHeading(scope)}一覧 - ${DICTIONARY_TITLE}`;
}

/** metadata の説明。 */
export function yojiListDescription(scope: YojiListScope): string {
  return scope.type === "all"
    ? `四字熟語${getAllYoji().length}語の読み方・意味・由来を、カテゴリ別にまとめた辞典です。`
    : `「${YOJI_CATEGORY_LABELS[scope.category]}」カテゴリの四字熟語一覧。読み方・意味を確認できます。`;
}

/** 2ページ目から最後のページまでの `page` の値。 */
export function yojiListPageParams(
  scope: YojiListScope,
): Array<{ page: string }> {
  return listPageStaticParams(
    yojiListEntries(scope).length,
    YOJI_LIST_PER_PAGE,
  );
}

/** 一覧のページの metadata。2ページ目からも自分を canonical にする。 */
export function yojiListMetadata(scope: YojiListScope, page: number): Metadata {
  const title = listPageTitle(yojiListTitle(scope), page);
  const description = yojiListDescription(scope);
  const url = `${BASE_URL}${listPageHref(yojiListBasePath(scope), page)}`;
  return {
    title,
    description,
    ...(scope.type === "all"
      ? {
          keywords: ["四字熟語辞典", "四字熟語", "読み方", "意味", "カテゴリ"],
        }
      : {}),
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
    },
  };
}

/** カテゴリの値が、いまあるカテゴリか。 */
export function isYojiCategory(value: string): value is YojiCategory {
  return (getYojiCategories() as string[]).includes(value);
}

/**
 * 並び順の選択肢。先頭が既定。どちらも行に見えている値（読み・難易度）で並べる（§7）。やさしい順は、初級・中級・
 * 上級の順で、同じ難易度の中を読みの五十音順に並べる。
 */
export const YOJI_LIST_SORTS: BrowseSort[] = [
  { value: "reading", label: "読みの五十音順", keys: [{ by: "reading" }] },
  {
    value: "easy",
    label: "やさしい順",
    keys: [
      {
        by: "fact",
        index: 0,
        order: Object.values(YOJI_DIFFICULTY_LABELS),
      },
      { by: "reading" },
    ],
  },
];

/**
 * 範囲の四字熟語を、一覧の項目にして既定の並び順で返す。行は語と読み・意味・難易度を持つ。種別はカテゴリで、
 * トップだけが持つ（カテゴリのページでは全件で同じなので持たない）。名前の絞り込みは、語と読みに一致を見て、
 * 意味と例文も探す。
 */
export function yojiListItems(scope: YojiListScope): BrowseItem[] {
  const items = yojiListEntries(scope).map((yoji): BrowseItem => ({
    name: yoji.yoji,
    readings: [yoji.reading],
    description: yoji.meaning,
    kind:
      scope.type === "all" ? YOJI_CATEGORY_LABELS[yoji.category] : undefined,
    facts: [{ text: YOJI_DIFFICULTY_LABELS[yoji.difficulty] }],
    searchTexts: [yoji.meaning, yoji.example],
  }));
  return sortBrowseItems(items, YOJI_LIST_SORTS[0]);
}

/** 一覧の上の索引を入れるアコーディオンのラベルを、語の切れ目で分けたもの（DESIGN.md §4）。 */
export const YOJI_INDEX_SUMMARY = ["カテゴリから", "探す"] as const;

/**
 * 一覧の上の索引に並べるカテゴリ（§7）。カテゴリは順を持たないので、語の多い順に並べ、語の後ろに語の数を添える。
 */
export function yojiIndexEntries(): LinkIndexItem[] {
  return getYojiCategories()
    .map((category) => ({
      label: YOJI_CATEGORY_LABELS[category],
      href: yojiListBasePath({ type: "category", category }),
      count: getYojiByCategory(category).length,
    }))
    .sort((a, b) => b.count - a.count);
}
