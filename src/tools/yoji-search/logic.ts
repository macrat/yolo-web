import { getAllYoji } from "@/dictionary/_lib/yoji";
import { YOJI_LIST_SORTS } from "@/dictionary/_lib/yoji-list";
import {
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
  type YojiEntry,
  type YojiOrigin,
} from "@/dictionary/_lib/types";
import {
  sortBrowseItems,
  type BrowseItem,
  type BrowseSpec,
} from "@/lib/list-browse";

/** 収録している四字熟語の数。 */
export const YOJI_COUNT = getAllYoji().length;

/** 1ページの件数。行は意味を持つので 50（DESIGN.md §7）。 */
export const YOJI_SEARCH_PER_PAGE = 50;

const ORIGINS: YojiOrigin[] = ["日本", "中国", "不明"];

/**
 * 絞り込みと並び順の選択肢。種別はカテゴリで、道具ごとの組は難易度（level）と出典（origin）。並び順は四字熟語辞典の
 * 一覧と同じ、読みの五十音順とやさしい順。
 */
export const YOJI_SEARCH_SPEC: BrowseSpec = {
  kinds: Object.entries(YOJI_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
  filterGroups: [
    {
      param: "level",
      legend: "難易度",
      options: Object.entries(YOJI_DIFFICULTY_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      param: "origin",
      legend: "出典",
      options: ORIGINS.map((origin) => ({ value: origin, label: origin })),
    },
  ],
  sorts: YOJI_LIST_SORTS,
};

/** 結果の行。絞り込みと並べ替えに使う値と、開いたときに見せる四字熟語。 */
export interface YojiSearchItem extends BrowseItem {
  entry: YojiEntry;
}

/**
 * 全件を結果の行にして、既定の並び順で返す。名前の絞り込みは、語と読みに一致を見て、意味と例文も探す。
 */
export const YOJI_SEARCH_ITEMS: YojiSearchItem[] = sortBrowseItems(
  getAllYoji().map((entry) => ({
    name: entry.yoji,
    readings: [entry.reading],
    description: entry.meaning,
    kind: YOJI_CATEGORY_LABELS[entry.category],
    facts: [{ text: YOJI_DIFFICULTY_LABELS[entry.difficulty] }],
    searchTexts: [entry.meaning, entry.example],
    filterValues: { level: String(entry.difficulty), origin: entry.origin },
    entry,
  })),
  YOJI_SEARCH_SPEC.sorts[0],
);
