import { getAllKanji } from "@/dictionary/_lib/kanji";
import { getAllYoji } from "@/dictionary/_lib/yoji";
import {
  KANJI_GRADE_LABELS,
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
  type KanjiEntry,
  type YojiCategory,
  type YojiEntry,
} from "@/dictionary/_lib/types";
import type { BrowsableListProps } from "@/components/BrowsableList";
import {
  normalizeSearchText,
  sortBrowseItems,
  type BrowseItem,
  type BrowseSort,
} from "@/lib/list-browse";

/** BrowsableList の見本。1つのページに1つの一覧を置く。一覧の状態は URL が持ち、同じページの一覧どうしで混ざるため。 */
export interface ListSample {
  /** 見本の説明。見本の見出しの下に置く。 */
  note: string;
  list: Omit<BrowsableListProps, "basePath" | "page">;
}

const YOJI_SORTS: BrowseSort[] = [
  { value: "reading", label: "読みの五十音順" },
  { value: "easy", label: "やさしい順" },
];

const KANJI_SORTS: BrowseSort[] = [
  { value: "strokes", label: "画数順" },
  { value: "reading", label: "読みの五十音順" },
];

function yojiItem(entry: YojiEntry): BrowseItem {
  return {
    name: entry.yoji,
    slug: entry.yoji,
    reading: entry.reading,
    description: entry.meaning,
    kind: YOJI_CATEGORY_LABELS[entry.category],
    facts: [{ text: YOJI_DIFFICULTY_LABELS[entry.difficulty] }],
    searchTexts: [entry.meaning, entry.example],
    sortKeys: {
      reading: [entry.reading],
      easy: [entry.difficulty, entry.reading],
    },
  };
}

function kanjiItem(entry: KanjiEntry): BrowseItem {
  // 音読みと訓読みで同じ読みが重なる字があるので、1つにまとめてから見せる。
  const readings = Array.from(new Set([...entry.onYomi, ...entry.kunYomi]));
  const firstReading = normalizeSearchText(
    entry.onYomi[0] ?? entry.kunYomi[0] ?? "",
  );
  return {
    name: entry.character,
    slug: entry.character,
    reading: readings.join("・"),
    kind: KANJI_GRADE_LABELS[entry.grade],
    facts: [{ text: `${entry.strokeCount}画` }],
    matchNames: [entry.character, ...readings],
    searchTexts: entry.examples,
    sortKeys: {
      strokes: [entry.strokeCount, firstReading],
      reading: [firstReading],
    },
  };
}

function yojiByReading(count: number, categories?: YojiCategory[]) {
  const pool = getAllYoji().filter(
    (entry) => !categories || categories.includes(entry.category),
  );
  return sortBrowseItems(pool.slice(0, count).map(yojiItem), YOJI_SORTS[0]);
}

function categoryChoices(categories: YojiCategory[]) {
  return categories.map((category) => ({
    value: category,
    label: YOJI_CATEGORY_LABELS[category],
  }));
}

const ELEVEN_CATEGORIES: YojiCategory[] = ["life", "effort", "nature"];

export const LIST_SAMPLES: Record<string, ListSample> = {
  "11": {
    note: "操作が出る最小の件数。説明と種別を持つ行で、種別の組と並び順の組を持つ。",
    list: {
      items: yojiByReading(11, ELEVEN_CATEGORIES),
      hrefPrefix: "/dictionary/yoji/",
      label: "四字熟語の一覧",
      unit: "語",
      searchLabel: "語・読み・意味・例文で探す",
      kindGroup: {
        legend: "カテゴリ",
        options: categoryChoices(ELEVEN_CATEGORIES),
      },
      sorts: YOJI_SORTS,
      perPage: 50,
      pageTitle: "見本：四字熟語11語",
    },
  },
  "100": {
    note: "説明を持たない行の1ページの上限。読みと学年と画数を持つ行で、学年の組と並び順の組を持つ。",
    list: {
      items: sortBrowseItems(
        getAllKanji()
          .filter((entry) => entry.grade <= 2)
          .slice(0, 100)
          .map(kanjiItem),
        KANJI_SORTS[0],
      ),
      hrefPrefix: "/dictionary/kanji/",
      label: "漢字の一覧",
      unit: "字",
      searchLabel: "字・読み・熟語で探す",
      kindGroup: {
        legend: "学年",
        options: [1, 2].map((grade) => ({
          value: String(grade),
          label: KANJI_GRADE_LABELS[grade],
        })),
      },
      sorts: KANJI_SORTS,
      perPage: 100,
      pageTitle: "見本：漢字100字",
    },
  },
  "101": {
    note: "1ページの件数×2＋1件で3ページになる一覧。種別の索引を一覧の上に置く一覧と同じく、種別の組を持たない。",
    list: {
      items: yojiByReading(101),
      hrefPrefix: "/dictionary/yoji/",
      label: "四字熟語の一覧",
      unit: "語",
      searchLabel: "語・読み・意味・例文で探す",
      sorts: YOJI_SORTS,
      perPage: 50,
      pageTitle: "見本：四字熟語101語",
    },
  },
  "0": {
    note: "項目の無い範囲。件数の行だけが出る。",
    list: {
      items: [],
      hrefPrefix: "/dictionary/yoji/",
      label: "四字熟語の一覧",
      unit: "語",
      searchLabel: "語・読み・意味・例文で探す",
      sorts: YOJI_SORTS,
      perPage: 50,
      pageTitle: "見本：四字熟語0語",
    },
  },
};

export const LIST_SAMPLE_IDS = Object.keys(LIST_SAMPLES);

export function listSampleBasePath(id: string): string {
  return `/storybook/list/${id}`;
}
