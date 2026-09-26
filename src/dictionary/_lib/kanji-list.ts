/**
 * 漢字辞典の一覧のページ（トップ・学年・部首・画数）の範囲と、そのページの見出し・題・説明・metadata・
 * 静的なページ番号・一覧の項目・並び順・一覧の上の索引。一覧のページの経路は、どれもここから範囲を受け取り、
 * 同じ形で組む。
 */

import type { Metadata } from "next";
import type { LinkIndexGroup, LinkIndexItem } from "@/components/LinkIndex";
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
import { headingFontAttr } from "@/lib/zen-antique-charset";
import {
  getAllKanji,
  getKanjiByGrade,
  getKanjiByRadical,
  getKanjiByStrokeCount,
  getKanjiGrades,
  getKanjiRadicals,
  getKanjiStrokeCounts,
} from "./kanji";
import { KANJI_GRADE_LABELS, type KanjiEntry } from "./types";

/** 一覧のページが受け持つ範囲。常用漢字の全体か、1つの学年・部首・画数。 */
export type KanjiListScope =
  | { type: "all" }
  | { type: "grade"; grade: number }
  | { type: "radical"; radical: string }
  | { type: "stroke"; strokeCount: number };

/** 1ページの件数。漢字の行は説明を持たず、字と読みで済むので 100（DESIGN.md §7）。 */
export const KANJI_LIST_PER_PAGE = 100;

const DICTIONARY_TITLE = "漢字辞典";

const DICTIONARY_DESCRIPTION =
  "常用漢字2,136字を、学年・部首・画数から引けるオンライン漢字辞典。各漢字の読み方・意味・部首・画数と使用例をまとめています。";

/** 範囲の漢字。データの順（学年・画数の順）のまま。 */
export function kanjiListEntries(scope: KanjiListScope): KanjiEntry[] {
  switch (scope.type) {
    case "all":
      return getAllKanji();
    case "grade":
      return getKanjiByGrade(scope.grade);
    case "radical":
      return getKanjiByRadical(scope.radical);
    case "stroke":
      return getKanjiByStrokeCount(scope.strokeCount);
  }
}

/** 一覧の元のパス。ページ n の URL は listPageHref で組む。 */
export function kanjiListBasePath(scope: KanjiListScope): string {
  switch (scope.type) {
    case "all":
      return "/dictionary/kanji";
    case "grade":
      return `/dictionary/kanji/grade/${scope.grade}`;
    case "radical":
      return `/dictionary/kanji/radical/${encodeURIComponent(scope.radical)}`;
    case "stroke":
      return `/dictionary/kanji/stroke/${scope.strokeCount}`;
  }
}

/** 一覧のページの見出し。 */
export function kanjiListHeading(scope: KanjiListScope): string {
  switch (scope.type) {
    case "all":
      return DICTIONARY_TITLE;
    case "grade":
      return `${KANJI_GRADE_LABELS[scope.grade]}の漢字`;
    case "radical":
      return `部首「${scope.radical}」の漢字`;
    case "stroke":
      return `${scope.strokeCount}画の漢字`;
  }
}

/** 一覧のページの題（サイト名と「（n ページ目）」を除いたもの）。 */
export function kanjiListTitle(scope: KanjiListScope): string {
  return scope.type === "all"
    ? DICTIONARY_TITLE
    : `${kanjiListHeading(scope)}一覧 - ${DICTIONARY_TITLE}`;
}

/** metadata の説明。 */
export function kanjiListDescription(scope: KanjiListScope): string {
  switch (scope.type) {
    case "all":
      return DICTIONARY_DESCRIPTION;
    case "grade":
      return `${KANJI_GRADE_LABELS[scope.grade]}で習う漢字の一覧。読み方・意味・部首情報を確認できます。`;
    case "radical":
      return `部首「${scope.radical}」を持つ漢字の一覧。読み方・意味・画数情報を確認できます。`;
    case "stroke":
      return `${scope.strokeCount}画の漢字一覧。読み方・意味・部首情報を確認できます。`;
  }
}

/** 2ページ目から最後のページまでの `page` の値。 */
export function kanjiListPageParams(
  scope: KanjiListScope,
): Array<{ page: string }> {
  return listPageStaticParams(
    kanjiListEntries(scope).length,
    KANJI_LIST_PER_PAGE,
  );
}

/** 一覧のページの metadata。2ページ目からも自分を canonical にする。 */
export function kanjiListMetadata(
  scope: KanjiListScope,
  page: number,
): Metadata {
  const title = listPageTitle(kanjiListTitle(scope), page);
  const description = kanjiListDescription(scope);
  const url = `${BASE_URL}${listPageHref(kanjiListBasePath(scope), page)}`;
  return {
    title,
    description,
    ...(scope.type === "all"
      ? {
          keywords: ["漢字辞典", "漢字", "読み方", "常用漢字", "部首", "画数"],
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

/** 学年の値が、いまある学年か。 */
export function isKanjiGrade(value: string): boolean {
  return getKanjiGrades().includes(value);
}

/** 部首の字が、いまある部首か。 */
export function isKanjiRadical(value: string): boolean {
  return getKanjiRadicals().includes(value);
}

/** 画数の値が、いまある画数か。 */
export function isKanjiStrokeCount(value: string): boolean {
  return getKanjiStrokeCounts().map(String).includes(value);
}

/**
 * 行に添える音訓。音読み・訓読みの順で、同じ読みは1つにまとめる（データには「生」の「なま」のように同じ読みが
 * 重なる字がある）。
 */
export function kanjiReadings(kanji: KanjiEntry): string[] {
  return Array.from(new Set([...kanji.onYomi, ...kanji.kunYomi]));
}

const SORT_GRADE: BrowseSort = { value: "grade", label: "学年順" };
const SORT_STROKE: BrowseSort = { value: "stroke", label: "画数順" };
const SORT_READING: BrowseSort = { value: "reading", label: "読みの五十音順" };

/** 範囲の漢字が2つ以上の学年にまたがるか。1つなら、行は学年を出さず、学年で並べる順も持たない（§7）。 */
function spansGrades(entries: KanjiEntry[]): boolean {
  return new Set(entries.map((kanji) => kanji.grade)).size > 1;
}

/**
 * 並び順の選択肢。先頭が既定。どれも行に見えている値（学年・画数・最初の読み）で並べる（§7）。
 *
 * - トップ: 学年順（同じ学年の中は画数順）／画数順（同じ画数の中は学年順）・読みの五十音順
 * - 学年: 画数順（同じ画数の中は読みの五十音順）／読みの五十音順
 * - 部首: 画数順（同じ画数の中は学年順）／学年順（同じ学年の中は画数順）・読みの五十音順
 * - 画数: 学年順（同じ学年の中は読みの五十音順）／読みの五十音順
 *
 * 部首と画数のページで学年が1つしかないときは、学年で並べる順を持たない。
 */
export function kanjiListSorts(scope: KanjiListScope): BrowseSort[] {
  const grades = spansGrades(kanjiListEntries(scope));
  switch (scope.type) {
    case "all":
      return [SORT_GRADE, SORT_STROKE, SORT_READING];
    case "grade":
      return [SORT_STROKE, SORT_READING];
    case "radical":
      return grades
        ? [SORT_STROKE, SORT_GRADE, SORT_READING]
        : [SORT_STROKE, SORT_READING];
    case "stroke":
      return grades ? [SORT_GRADE, SORT_READING] : [SORT_READING];
  }
}

/** 並び順ごとの比べる値。同じ値の中の順は、範囲ごとに kanjiListSorts の括弧のとおり。 */
function sortKeys(
  scope: KanjiListScope,
  kanji: KanjiEntry,
  firstReading: string,
): BrowseItem["sortKeys"] {
  const { grade, strokeCount } = kanji;
  switch (scope.type) {
    case "all":
    case "radical":
      return {
        grade: [grade, strokeCount],
        stroke: [strokeCount, grade],
        reading: [firstReading],
      };
    case "grade":
      return { stroke: [strokeCount, firstReading], reading: [firstReading] };
    case "stroke":
      return { grade: [grade, firstReading], reading: [firstReading] };
  }
}

/**
 * 範囲の漢字を、一覧の項目にして既定の並び順で返す。行は字と音訓を持ち、説明を持たない（英語の意味は日本語の
 * 来訪者が字を見分ける手がかりにならないので、行にも探す字にも入れない）。種別は学年で、範囲が2つ以上の学年に
 * またがるときだけ行に出る。補助情報は画数で、画数のページでは全件で同じなので持たない。名前の絞り込みは、
 * 字と読みに一致を見て、使用例の熟語も探す。
 */
export function kanjiListItems(scope: KanjiListScope): BrowseItem[] {
  const entries = kanjiListEntries(scope);
  const items = entries.map((kanji): BrowseItem => {
    const readings = kanjiReadings(kanji);
    return {
      name: kanji.character,
      slug: encodeURIComponent(kanji.character),
      reading: readings.join("・") || undefined,
      kind:
        scope.type === "grade" ? undefined : KANJI_GRADE_LABELS[kanji.grade],
      facts:
        scope.type === "stroke"
          ? undefined
          : [{ text: `${kanji.strokeCount}画` }],
      matchNames: [kanji.character, ...readings],
      searchTexts: kanji.examples,
      sortKeys: sortKeys(scope, kanji, readings[0] ?? ""),
    };
  });
  return sortBrowseItems(items, kanjiListSorts(scope)[0]);
}

// 康熙字典の部首の番号から、部首の画数を引く範囲。[その画数の最初の番号, 画数]。
const KANGXI_RADICAL_STROKES: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [7, 2],
  [30, 3],
  [61, 4],
  [95, 5],
  [118, 6],
  [147, 7],
  [167, 8],
  [176, 9],
  [187, 10],
  [195, 11],
  [201, 12],
  [205, 13],
  [209, 14],
  [211, 15],
  [212, 16],
  [214, 17],
];

/**
 * 索引に見せる部首の字の画数。部首の字が常用漢字なら、辞典がその字の詳細に載せている画数（「麦」は7画）。
 * 常用漢字でない字（「辵」「黃」）は、康熙字典の部首の番号から引く画数。来訪者が索引で見る字の画数と、
 * その字の詳細のページの画数が食い違わないようにするため。
 */
function radicalStrokeCount(
  radical: string,
  radicalGroup: number,
  strokeCounts: ReadonlyMap<string, number>,
): number {
  const own = strokeCounts.get(radical);
  if (own !== undefined) return own;
  let strokes = 0;
  for (const [first, count] of KANGXI_RADICAL_STROKES) {
    if (radicalGroup >= first) strokes = count;
  }
  return strokes;
}

/**
 * 一覧の上の索引に並べる学年・部首・画数（§7）。学年と画数はその順で並べる。部首は、並びの値の画数が字に
 * 見えないので、部首の画数ごとに区切りの見出しを立て、区切りの中は部首の番号の順に並べる。
 */
export function kanjiIndexEntries(): {
  grades: LinkIndexItem[];
  radicals: LinkIndexGroup[];
  radicalCount: number;
  strokes: LinkIndexItem[];
} {
  const all = getAllKanji();
  const strokeCounts = new Map(
    all.map((kanji) => [kanji.character, kanji.strokeCount]),
  );
  const radicalGroups = new Map<string, number>();
  for (const kanji of all) {
    if (!radicalGroups.has(kanji.radical)) {
      radicalGroups.set(kanji.radical, kanji.radicalGroup);
    }
  }
  const byStrokes = new Map<number, Array<[string, number]>>();
  for (const [radical, group] of radicalGroups) {
    const strokes = radicalStrokeCount(radical, group, strokeCounts);
    byStrokes.set(strokes, [
      ...(byStrokes.get(strokes) ?? []),
      [radical, group],
    ]);
  }
  const radicals = [...byStrokes.entries()]
    .sort(([a], [b]) => a - b)
    .map(([strokes, members]): LinkIndexGroup => {
      const heading = `${strokes}画`;
      return {
        heading,
        headingFont: headingFontAttr(heading),
        items: members
          .sort(([, a], [, b]) => a - b)
          .map(([radical]) => ({
            label: radical,
            href: kanjiListBasePath({ type: "radical", radical }),
          })),
      };
    });
  return {
    grades: getKanjiGrades().map((grade) => ({
      label: KANJI_GRADE_LABELS[Number(grade)],
      href: kanjiListBasePath({ type: "grade", grade: Number(grade) }),
    })),
    radicals,
    radicalCount: radicalGroups.size,
    strokes: getKanjiStrokeCounts().map((strokeCount) => ({
      label: `${strokeCount}画`,
      href: kanjiListBasePath({ type: "stroke", strokeCount }),
    })),
  };
}
