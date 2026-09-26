/**
 * 遊びの一覧（/play）の項目・種別・並び順と、そのページの題・説明・metadata・静的なページ番号。
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
import { playFacts } from "./listItems";
import { allPlayContents } from "./registry";
import { resolveDisplayCategory } from "./seo";
import type { PlayContentMeta } from "./types";

/** 一覧の名前。上端のナビ・パンくず・見出し・ページの題で同じ名前を使う。 */
export const PLAY_LIST_TITLE = "遊び";

/** 一覧の元のパス。 */
export const PLAY_LIST_BASE_PATH = "/play";

/**
 * 見出しの下に置く文。何が並んでいるかを種別の語で言い、どの遊びにも当てはまることだけを添える。件数は件数の行に
 * 任せる。375px の幅で2行に収め、375×667 と 1280×800 で最初の行を最初の画面に入れる。
 */
export const PLAY_LIST_INTRO =
  "運勢・診断・クイズ・パズル。登録なしで、その場で結果まで見られます。";

/** 1ページの件数。遊びの行は説明を持つので 50（DESIGN.md §7）。 */
export const PLAY_LIST_PER_PAGE = 50;

/**
 * 種別。行に見せる語と同じ語で、並びが種別順の順になる。値はクエリの `kind` に書く。
 */
export const PLAY_KINDS: BrowseChoice[] = [
  { value: "fortune", label: "運勢" },
  { value: "personality", label: "診断" },
  { value: "knowledge", label: "クイズ" },
  { value: "puzzle", label: "パズル" },
];

/**
 * 並び順。既定は種別順で、同じ種別の中は新しい順。戻ってきた来訪者が新しいものを見つけられるよう、
 * 種別をまたいだ新しい順も選べる（§7）。新しい順は、行に見えている公開日の日付で比べ、同じ日付の遊びどうしは
 * 時刻で並べず、渡した順のまま並ぶ。
 */
export const PLAY_SORTS: BrowseSort[] = [
  {
    value: "kind",
    label: "種別順",
    keys: [
      { by: "kind", order: PLAY_KINDS.map((choice) => choice.label) },
      { by: "fact", index: 0, desc: true },
    ],
  },
  {
    value: "newest",
    label: "新しい順",
    keys: [{ by: "fact", index: 0, desc: true }],
  },
];

function playItem(content: PlayContentMeta): BrowseItem {
  return {
    name: content.shortTitle ?? content.title,
    slug: content.slug,
    description: content.shortDescription,
    kind: resolveDisplayCategory(content),
    facts: [
      {
        text: formatDate(content.publishedAt),
        dateTime: content.publishedAt,
      },
      ...playFacts(content),
    ],
    searchTexts: [content.shortDescription],
  };
}

/** 一覧の全件。既定の並び順（種別順）で並べる。 */
export function playListItems(): BrowseItem[] {
  return sortBrowseItems(allPlayContents.map(playItem), PLAY_SORTS[0]);
}

/** 2ページ目から最後のページまでの `page` の値。 */
export function playListPageParams(): Array<{ page: string }> {
  return listPageStaticParams(allPlayContents.length, PLAY_LIST_PER_PAGE);
}

const PLAY_LIST_DESCRIPTION = `占い・診断・クイズ・パズルなど、AIが作った全${allPlayContents.length}種のコンテンツを一覧できます。気になるものを選んで、その場で試せます。`;

/** 遊びの一覧のページの metadata。2ページ目からも自分を canonical にする。 */
export function playListMetadata(page: number): Metadata {
  const title = listPageTitle(PLAY_LIST_TITLE, page);
  const url = `${BASE_URL}${listPageHref(PLAY_LIST_BASE_PATH, page)}`;
  return {
    title,
    description: PLAY_LIST_DESCRIPTION,
    keywords: [
      "ゲーム",
      "クイズ",
      "診断",
      "占い",
      "パズル",
      "ブラウザゲーム",
      "無料",
    ],
    openGraph: {
      title,
      description: PLAY_LIST_DESCRIPTION,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: PLAY_LIST_DESCRIPTION,
    },
    alternates: {
      canonical: url,
    },
  };
}
