/**
 * ユーモア辞典の一覧のページの項目・並び順と、そのページの metadata・静的なページ番号。
 */

import type { Metadata } from "next";
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
import { getAllEntries } from "../data";
import { humorDictMeta } from "../meta";
import { getDefinitionPreview } from "./definition-preview";

/** 一覧の元のパス。ページ n の URL は listPageHref で組む。 */
export const HUMOR_LIST_BASE_PATH = "/dictionary/humor";

/** 1ページの件数。見出し語の行は語義の冒頭を説明に持つので 50（DESIGN.md §7）。 */
export const HUMOR_LIST_PER_PAGE = 50;

/**
 * 並び順。見出し語の読みの五十音順だけを持つ。ほかに来訪者が選ぶ理由のある順が無いので、件数の行が既定の順を
 * 言う（§7）。
 */
export const HUMOR_LIST_SORTS: BrowseSort[] = [
  { value: "reading", label: "五十音順", keys: [{ by: "reading" }] },
];

/**
 * 一覧の全件を五十音順で返す。行は語と読み・語義の冒頭の一文を持ち、名前の絞り込みは語と読みに一致を見て、
 * 語義の全文も探す。
 */
export function humorListItems(): BrowseItem[] {
  const items = getAllEntries().map((entry) => ({
    name: entry.word,
    slug: entry.slug,
    readings: [entry.reading],
    description: getDefinitionPreview(entry.definition),
    searchTexts: [entry.definition],
  }));
  return sortBrowseItems(items, HUMOR_LIST_SORTS[0]);
}

/** 2ページ目から最後のページまでの `page` の値。 */
export function humorListPageParams(): Array<{ page: string }> {
  return listPageStaticParams(getAllEntries().length, HUMOR_LIST_PER_PAGE);
}

/** 一覧のページの metadata。2ページ目からも自分を canonical にする。 */
export function humorListMetadata(page: number): Metadata {
  const title = listPageTitle(humorDictMeta.title, page);
  const description = humorDictMeta.description;
  const url = `${BASE_URL}${listPageHref(HUMOR_LIST_BASE_PATH, page)}`;
  return {
    title,
    description,
    keywords: ["ユーモア辞典", "ユーモア", "定義", "言葉", "面白い"],
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
