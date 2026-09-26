/**
 * 伝統色辞典の一覧のページ（トップ・色み）の範囲と、そのページの見出し・題・説明・metadata・静的なページ番号・
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
import { getAllColors, getColorsByCategory } from "./colors";
import {
  COLOR_CATEGORY_LABELS,
  type ColorCategory,
  type ColorEntry,
} from "./types";

/** 一覧のページが受け持つ範囲。伝統色の全体か、1つの色み。 */
export type ColorListScope =
  { type: "all" } | { type: "category"; category: ColorCategory };

/** 1ページの件数。伝統色の行は説明を持たず、色見本と色名と読みで済むので 100（DESIGN.md §7）。 */
export const COLOR_LIST_PER_PAGE = 100;

const DICTIONARY_TITLE = "伝統色辞典";

/** 色みの並び。赤系から紫系までの色相の順で、色相を持たない無彩色を最後に置く。 */
const COLOR_CATEGORY_ORDER = Object.keys(
  COLOR_CATEGORY_LABELS,
) as ColorCategory[];

/** 色相を持たない色み。この色みの中は明るさだけで並べる。 */
const ACHROMATIC: ColorCategory = "achromatic";

/**
 * 有彩色の色みの中で、色相を持たないものとして扱う彩度（OKLCH の C）の上限。これに満たない色は、色みの中で
 * 色相を持つ色の後ろに、明るい順で並ぶ。250色の C を並べると、無彩色の色みの色はどれも 0.0122 以下で、
 * 有彩色の色みでは銀鼠（0.0131）と、目に緑みの灰と分かる利休鼠（0.0187）のあいだが最も大きくあく。その
 * あいだに置くので、当たるのは胡粉・白鼠・黒橡・白練・溝鼠・銀鼠の6色である。
 */
const ACHROMATIC_CHROMA = 0.015;

/** 範囲の伝統色。データの順のまま。 */
export function colorListEntries(scope: ColorListScope): ColorEntry[] {
  return scope.type === "all"
    ? getAllColors()
    : getColorsByCategory(scope.category);
}

/** 項目のある色み。色みの並びの順。 */
export function colorListCategories(): ColorCategory[] {
  return COLOR_CATEGORY_ORDER.filter(
    (category) => getColorsByCategory(category).length > 0,
  );
}

/** 一覧の元のパス。ページ n の URL は listPageHref で組む。 */
export function colorListBasePath(scope: ColorListScope): string {
  return scope.type === "all"
    ? "/dictionary/colors"
    : `/dictionary/colors/category/${scope.category}`;
}

/** 一覧のページの見出し。 */
export function colorListHeading(scope: ColorListScope): string {
  return scope.type === "all"
    ? DICTIONARY_TITLE
    : `${COLOR_CATEGORY_LABELS[scope.category]}の伝統色`;
}

/** 一覧のページの題（サイト名と「（n ページ目）」を除いたもの）。 */
export function colorListTitle(scope: ColorListScope): string {
  return scope.type === "all"
    ? `${DICTIONARY_TITLE} - ${getAllColors().length}色一覧`
    : `${colorListHeading(scope)}一覧 - ${DICTIONARY_TITLE}`;
}

/** metadata の説明。 */
export function colorListDescription(scope: ColorListScope): string {
  return scope.type === "all"
    ? `日本の伝統色${getAllColors().length}色の一覧。色見本・色名・ローマ字・カラーコードを並べ、色みや明るさの順で見比べられます。`
    : `日本の伝統色「${COLOR_CATEGORY_LABELS[scope.category]}」カテゴリの色一覧。色見本とカラーコードを見比べられます。`;
}

/** 2ページ目から最後のページまでの `page` の値。 */
export function colorListPageParams(
  scope: ColorListScope,
): Array<{ page: string }> {
  return listPageStaticParams(
    colorListEntries(scope).length,
    COLOR_LIST_PER_PAGE,
  );
}

/** 一覧のページの metadata。2ページ目からも自分を canonical にする。 */
export function colorListMetadata(
  scope: ColorListScope,
  page: number,
): Metadata {
  const title = listPageTitle(colorListTitle(scope), page);
  const description = colorListDescription(scope);
  const url = `${BASE_URL}${listPageHref(colorListBasePath(scope), page)}`;
  return {
    title,
    description,
    keywords:
      scope.type === "all"
        ? ["伝統色", "日本の色", "カラーコード", "和色", "色見本"]
        : [
            COLOR_CATEGORY_LABELS[scope.category],
            "伝統色",
            "日本の色",
            "カラーコード",
          ],
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

/** 色みの値が、項目のある色みか。 */
export function isColorCategory(value: string): value is ColorCategory {
  return (colorListCategories() as string[]).includes(value);
}

const COLOR_KIND_ORDER = COLOR_CATEGORY_ORDER.map(
  (category) => COLOR_CATEGORY_LABELS[category],
);

const SORT_HUE_BY_CATEGORY: BrowseSort = {
  value: "hue",
  label: "色み順",
  keys: [
    { by: "kind", order: COLOR_KIND_ORDER },
    {
      by: "swatch",
      channel: "hue",
      achromaticKind: COLOR_CATEGORY_LABELS[ACHROMATIC],
      achromaticChroma: ACHROMATIC_CHROMA,
    },
    { by: "swatch", channel: "lightness", desc: true },
  ],
};
const SORT_HUE: BrowseSort = {
  value: "hue",
  label: "色相順",
  keys: [
    { by: "swatch", channel: "hue", achromaticChroma: ACHROMATIC_CHROMA },
    { by: "swatch", channel: "lightness", desc: true },
  ],
};
const SORT_LIGHT: BrowseSort = {
  value: "light",
  label: "明るい順",
  keys: [{ by: "swatch", channel: "lightness", desc: true }],
};

/**
 * 並び順の選択肢。先頭が既定。どれも行に見えている種別と色見本の色を OKLCH にした値で並べる（§7）。
 *
 * - トップ: 色み順（色みの並びの順で、同じ色みの中は色相の順、色相を持たない無彩色の中は明るい順）／明るい順
 * - 色み: 色相順／明るい順。色相を持たない無彩色は明るい順だけ
 *
 * 色み順と色相順では、ほとんど色を持たない色（ACHROMATIC_CHROMA）を、その色みの最後に明るい順で置く。
 */
export function colorListSorts(scope: ColorListScope): BrowseSort[] {
  if (scope.type === "all") return [SORT_HUE_BY_CATEGORY, SORT_LIGHT];
  return scope.category === ACHROMATIC ? [SORT_LIGHT] : [SORT_HUE, SORT_LIGHT];
}

/**
 * 範囲の伝統色を、一覧の項目にして既定の並び順で返す。行は色見本・色名・ローマ字（読み）・カラーコードを持ち、
 * 説明を持たない。種別は色みで、トップだけが持つ（色みのページでは全件で同じなので持たない）。名前の絞り込みは、
 * 色名とローマ字に一致を見て、カラーコードも探す。
 */
export function colorListItems(scope: ColorListScope): BrowseItem[] {
  const items = colorListEntries(scope).map((color): BrowseItem => ({
    name: color.name,
    slug: color.slug,
    readings: [color.romaji],
    kind:
      scope.type === "all" ? COLOR_CATEGORY_LABELS[color.category] : undefined,
    facts: [{ text: color.hex }],
    swatch: color.hex,
    searchTexts: [color.hex],
  }));
  return sortBrowseItems(items, colorListSorts(scope)[0]);
}

/** 一覧の上の索引を入れるアコーディオンのラベルを、語の切れ目で分けたもの（DESIGN.md §4）。 */
export const COLOR_INDEX_SUMMARY = ["色みから", "探す"] as const;

/** 一覧の上の索引に並べる色み（§7）。色みは色相の順を持つので、その順で並べ、数を添えない。 */
export function colorIndexEntries(): LinkIndexItem[] {
  return colorListCategories().map((category) => ({
    label: COLOR_CATEGORY_LABELS[category],
    href: colorListBasePath({ type: "category", category }),
  }));
}
