/**
 * ツールの一覧（/tools）の項目・種別・並び順と、そのページの題・説明・metadata・静的なページ番号。
 */

import type { Metadata } from "next";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import {
  listPageHref,
  listPageStaticParams,
  listPageTitle,
} from "@/lib/list-pages";
import {
  sortBrowseItems,
  type BrowseChoice,
  type BrowseItem,
  type BrowseSort,
} from "@/lib/list-browse";
import { TOOL_CATEGORIES, toolCategoryLabel } from "@/tools/categories";
import { allToolMetas } from "@/tools/registry";
import type { ToolMeta } from "@/tools/types";

/** 一覧の名前。上端のナビ・パンくず・見出し・ページの題で同じ名前を使う。 */
export const TOOL_LIST_TITLE = "ツール";

/** 一覧の元のパス。 */
export const TOOL_LIST_BASE_PATH = "/tools";

/**
 * 見出しの下に置く文。行からは読み取れない、どのツールにも共通することだけを言う。何が並んでいるかは行が、
 * 件数は件数の行が言う。入力はどのツールもブラウザの中で扱い、外へ送らない。320px と 375px の幅で1行に収め、
 * 375×667 と 1280×800 で最初の行を最初の画面に入れる。
 */
export const TOOL_LIST_INTRO = "登録不要。入力は手元で処理。";

/** 1ページの件数。ツールの行は説明を持つので 50（DESIGN.md §7）。 */
export const TOOL_LIST_PER_PAGE = 50;

/** 種別。行に見せる語と同じ語で、並びが種別順の順になる。値はクエリの `kind` に書く。 */
export const TOOL_KINDS: BrowseChoice[] = TOOL_CATEGORIES.map(
  ({ value, label }) => ({ value, label }),
);

/**
 * 並び順。既定は種別順で、同じ種別の中は新しい順。戻ってきた来訪者が新しいツールを見つけられるよう、
 * 種別をまたいだ新しい順も選べる（§7）。新しい順は、行に見えている公開日の日付で比べ、同じ日付のツールどうしは
 * 時刻で並べず、渡した順のまま並ぶ。
 */
export const TOOL_SORTS: BrowseSort[] = [
  {
    value: "kind",
    label: "種別順",
    keys: [
      { by: "kind", order: TOOL_KINDS.map((choice) => choice.label) },
      { by: "fact", index: 0, desc: true },
    ],
  },
  {
    value: "newest",
    label: "新しい順",
    keys: [{ by: "fact", index: 0, desc: true }],
  },
];

function toolItem(meta: ToolMeta): BrowseItem {
  return {
    name: meta.name,
    slug: meta.slug,
    description: meta.shortDescription,
    kind: toolCategoryLabel(meta.category),
    facts: [{ text: formatDate(meta.publishedAt), dateTime: meta.publishedAt }],
    searchTexts: [meta.shortDescription],
  };
}

/** 一覧の全件。既定の並び順（種別順）で並べる。 */
export function toolListItems(): BrowseItem[] {
  return sortBrowseItems(allToolMetas.map(toolItem), TOOL_SORTS[0]);
}

/** 2ページ目から最後のページまでの `page` の値。 */
export function toolListPageParams(): Array<{ page: string }> {
  return listPageStaticParams(allToolMetas.length, TOOL_LIST_PER_PAGE);
}

const TOOL_LIST_DESCRIPTION = `文字数カウント・日付計算・パスワード生成から、JSON整形・正規表現のテストまで、全${allToolMetas.length}個の無料ツールを一覧できます。登録は不要で、ブラウザの中ですぐに使えます。`;

/** ツールの一覧のページの metadata。2ページ目からも自分を canonical にする。 */
export function toolListMetadata(page: number): Metadata {
  const title = listPageTitle(TOOL_LIST_TITLE, page);
  const url = `${BASE_URL}${listPageHref(TOOL_LIST_BASE_PATH, page)}`;
  return {
    title,
    description: TOOL_LIST_DESCRIPTION,
    keywords: [
      "オンラインツール",
      "無料ツール",
      "便利ツール",
      "開発者ツール",
      "文字数カウント",
      "日付計算",
    ],
    openGraph: {
      title,
      description: TOOL_LIST_DESCRIPTION,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: TOOL_LIST_DESCRIPTION,
    },
    alternates: {
      canonical: url,
    },
  };
}
