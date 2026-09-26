/**
 * 遊びの一覧（/play）の項目・種別・並び順と、そのページの題・説明・metadata。
 */

import type { Metadata } from "next";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { listPageTitle } from "@/lib/list-pages";
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

/** 見出しの下に置く文。何が並んでいるかを言い、件数は件数の行に任せる。 */
export const PLAY_LIST_INTRO =
  "占い・診断・クイズ・パズル。どれも答えたらすぐ結果が見られます。";

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
 * 種別をまたいだ新しい順も選べる（§7）。
 */
export const PLAY_SORTS: BrowseSort[] = [
  { value: "kind", label: "種別順", directions: ["asc", "desc"] },
  { value: "newest", label: "新しい順", directions: ["desc"] },
];

/**
 * 公開日を、行に見えている日付の値として比べる数（例 20260213）。並び順は見えている値で決めるので、
 * 同じ日付の遊びどうしは時刻で並べず、渡した順のまま並ぶ（§7）。
 */
function publishedDay(content: PlayContentMeta): number {
  return Number(formatDate(content.publishedAt).replaceAll("-", ""));
}

function playItem(content: PlayContentMeta): BrowseItem {
  const kind = resolveDisplayCategory(content);
  const day = publishedDay(content);
  return {
    name: content.shortTitle ?? content.title,
    slug: content.slug,
    description: content.shortDescription,
    kind,
    facts: [
      {
        text: formatDate(content.publishedAt),
        dateTime: content.publishedAt,
      },
      ...playFacts(content),
    ],
    searchTexts: [content.shortDescription],
    sortKeys: {
      kind: [PLAY_KINDS.findIndex((choice) => choice.label === kind), day],
      newest: [day],
    },
  };
}

/** 一覧の全件。既定の並び順（種別順）で並べる。 */
export function playListItems(): BrowseItem[] {
  return sortBrowseItems(allPlayContents.map(playItem), PLAY_SORTS[0]);
}

const PLAY_LIST_DESCRIPTION = `占い・診断・クイズ・パズルなど、AIが作った全${allPlayContents.length}種のコンテンツを一覧できます。気になるものを選んで、その場で試せます。`;

/** 遊びの一覧のページの metadata。 */
export function playListMetadata(): Metadata {
  const title = listPageTitle(PLAY_LIST_TITLE, 1);
  const url = `${BASE_URL}/play`;
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
