/**
 * 一覧の件数と備え（DESIGN.md §7「件数と備え」）の純粋な関数。名前の絞り込み・種別と道具ごとの組の絞り込み・
 * 並べ替え・ページの切り出し・URL のクエリとの読み書き・畳んだ枠のラベルと件数の行の文を組む。
 * サーバーとクライアントで同じ結果を出すため、ロケールに依存する比較（Intl.Collator）を使わず、仮名の読みの
 * 辞書の並びは自前の比べる形で作る。
 */

import type { ItemListFact } from "@/components/ItemList";

/** 並び順ごとの比べる値。先頭の値から順に比べる。 */
export type BrowseSortKey = ReadonlyArray<string | number>;

/** 一覧のページで絞り込み・並べ替えをする項目。行の中身は ItemList の項目と同じ。 */
export interface BrowseItem {
  name: string;
  /** 名前のリンク先の、一覧の接頭辞に続く部分。行の key を兼ねる。 */
  slug: string;
  reading?: string;
  description?: string;
  /** 行に見せる種別の語。種別の絞り込みもこの語で当てる。 */
  kind?: string;
  facts?: ItemListFact[];
  swatch?: string;
  /** 名前か読みとして一致を見る語。読みを複数持つ項目（漢字の音訓）は1つずつ並べる。省略すると名前と読み。 */
  matchNames?: string[];
  /** 名前と読みのほかに、名前の絞り込みで探す値（説明・タグ・熟語・例文など）。 */
  searchTexts?: string[];
  /** 道具ごとの組の値。組のクエリの名前から、その組の選択肢の値へ。 */
  filterValues?: Record<string, string>;
  /** 並び順の値から、その並び順での比べる値へ。 */
  sortKeys: Record<string, BrowseSortKey>;
}

/** ラジオボタンの組の選択肢。 */
export interface BrowseChoice {
  value: string;
  label: string;
}

/** 並び順の選択肢。directions は比べる値ごとの向きで、省略した値は昇順。 */
export interface BrowseSort extends BrowseChoice {
  directions?: ReadonlyArray<"asc" | "desc">;
}

/** 道具ごとの組。param はクエリの名前で、選択肢に「すべて」は含めない。 */
export interface BrowseFilterGroup {
  param: string;
  legend: string;
  options: BrowseChoice[];
}

/** 一覧が受け付ける値の範囲。範囲の外の値は既定の値として読む。 */
export interface BrowseSpec {
  kinds: BrowseChoice[];
  sorts: BrowseSort[];
  filterGroups: BrowseFilterGroup[];
}

/** 「すべて」を選んだ組の値。 */
export const ALL = "";

/** 一覧の状態。kind と filters の ALL は「すべて」。 */
export interface BrowseState {
  query: string;
  kind: string;
  sort: string;
  filters: Record<string, string>;
  /** 既定でない状態のときのページ。既定の状態のページはパスが持つ。 */
  page: number;
}

/** 件数の単位。 */
export type BrowseUnit = "件" | "字" | "語" | "色";

const RESERVED_PARAMS = new Set(["q", "kind", "sort", "page"]);

// 片仮名（ァ〜ヶ）を平仮名に寄せる。ヷ〜ヺのように対応する平仮名の無い字はそのまま残す。
const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const KANA_OFFSET = 0x60;

/** 名前の絞り込みの比べる形。NFKC・小文字化・片仮名から平仮名への寄せ。 */
export function normalizeSearchText(text: string): string {
  const folded = text.normalize("NFKC").toLowerCase();
  let result = "";
  for (const char of folded) {
    const code = char.codePointAt(0) ?? 0;
    result +=
      code >= KATAKANA_START && code <= KATAKANA_END
        ? String.fromCodePoint(code - KANA_OFFSET)
        : char;
  }
  return result;
}

/**
 * 打った字との一致の度合い（§7）。0 は名前か読みが一致、1 は打った字で始まる、2 は打った字を含む、
 * 3 は名前と読みでは当たらずほかの値で当たる。当たらなければ null。
 */
export function matchDegree(
  item: BrowseItem,
  normalizedQuery: string,
): 0 | 1 | 2 | 3 | null {
  const names = (item.matchNames ?? [item.name, item.reading ?? ""])
    .filter((name) => name !== "")
    .map(normalizeSearchText);
  if (names.some((name) => name === normalizedQuery)) return 0;
  if (names.some((name) => name.startsWith(normalizedQuery))) return 1;
  if (names.some((name) => name.includes(normalizedQuery))) return 2;
  const others = item.searchTexts ?? [];
  if (
    others.some((text) => normalizeSearchText(text).includes(normalizedQuery))
  )
    return 3;
  return null;
}

// 辞書の五十音順で、1段目に比べるときに並の仮名に寄せる小書きの仮名。
const SMALL_KANA: Record<string, string> = {
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
  っ: "つ",
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ",
  ゎ: "わ",
  ゕ: "か",
  ゖ: "け",
};
// 長音符は、直前の仮名の母音として比べる（「かー」は「かあ」の位置）。
const VOWEL_ROWS: ReadonlyArray<readonly [string, string]> = [
  ["あ", "あかさたなはまやらわ"],
  ["い", "いきしちにひみりゐ"],
  ["う", "うくすつぬふむゆる"],
  ["え", "えけせてねへめれゑ"],
  ["お", "おこそとのほもよろを"],
];

function vowelOf(kana: string): string | undefined {
  return VOWEL_ROWS.find(([, row]) => row.includes(kana))?.[0];
}

// 2段目で字ごとに比べる重み。NFD で分かれた濁点・半濁点の結合文字から、清音 → 濁音 → 半濁音の順の重みへ。
const VOICING_WEIGHTS: Record<string, string> = {
  "\u3099": "1",
  "\u309a": "2",
};
const UNVOICED_WEIGHT = "0";
// 3段目で字ごとに比べる重み。長音符 → 小書き → 並の順。
const LONG_VOWEL_WEIGHT = "0";
const SMALL_KANA_WEIGHT = "1";
const PLAIN_KANA_WEIGHT = "2";

/** 仮名の読みを辞書の並びで比べる形。1段目から順に比べる。 */
export type KanaCollationKey = readonly [string, string, string];

/**
 * 仮名の読みを辞書の並び（日本語の照合）で比べるための3段の形。どれも片仮名を平仮名に寄せてから作る。
 *
 * 1段目は濁点・半濁点を外し、小書きの仮名を並の仮名に寄せ、長音符を直前の仮名の母音にしたもの。清音と
 * 濁音・半濁音が同じ位置に並ぶ。2段目は字ごとの濁点の重み、3段目は字ごとの長音符・小書き・並の重みで、
 * 1段目が同じ語どうしだけを比べる。語全体で濁点の差を先に比べ、同じなら長音符と小書きの差を比べるので、
 * 「はーと・はあと・はあど」「きつか・きっが」の順になる。1段目が同じ語どうしは字の数も同じなので、重みの
 * 列は字の位置が揃ったまま比べられる。
 */
export function kanaCollationKey(text: string): KanaCollationKey {
  let primary = "";
  let voicing = "";
  let form = "";
  for (const char of normalizeSearchText(text).normalize("NFD")) {
    const voicingWeight = VOICING_WEIGHTS[char];
    if (voicingWeight !== undefined && voicing !== "") {
      voicing = voicing.slice(0, -1) + voicingWeight;
      continue;
    }
    if (char === "ー") {
      primary += vowelOf(primary.slice(-1)) ?? char;
      form += LONG_VOWEL_WEIGHT;
    } else {
      const plain = SMALL_KANA[char];
      primary += plain ?? char;
      form += plain === undefined ? PLAIN_KANA_WEIGHT : SMALL_KANA_WEIGHT;
    }
    voicing += UNVOICED_WEIGHT;
  }
  return [primary, voicing, form];
}

type PreparedKey = ReadonlyArray<number | KanaCollationKey>;

function prepareKey(key: BrowseSortKey): PreparedKey {
  return key.map((value) =>
    typeof value === "number" ? value : kanaCollationKey(value),
  );
}

function compareValues(
  x: number | KanaCollationKey,
  y: number | KanaCollationKey,
): number {
  if (typeof x === "number" && typeof y === "number") return x - y;
  if (typeof x === "number" || typeof y === "number") {
    return String(x) < String(y) ? -1 : 1;
  }
  for (let level = 0; level < x.length; level++) {
    if (x[level] !== y[level]) return x[level] < y[level] ? -1 : 1;
  }
  return 0;
}

function compareKeys(
  a: PreparedKey,
  b: PreparedKey,
  directions: ReadonlyArray<"asc" | "desc">,
): number {
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const x = a[i];
    const y = b[i];
    // 値を持たない項目は、その並び順で後ろに回す。
    if (x === undefined && y === undefined) continue;
    if (x === undefined) return 1;
    if (y === undefined) return -1;
    const order = compareValues(x, y);
    if (order !== 0) return directions[i] === "desc" ? -order : order;
  }
  return 0;
}

/**
 * 並び順で並べる。数は数の大小で、文字列は仮名の読みの辞書の並び（kanaCollationKey）で比べる。
 * 比べる値が同じ項目は、渡された順のまま並ぶ（安定な並べ替え）。
 */
export function sortBrowseItems<T extends BrowseItem>(
  items: readonly T[],
  sort: BrowseSort,
): T[] {
  const directions = sort.directions ?? [];
  return items
    .map((item, index) => ({
      item,
      index,
      key: prepareKey(item.sortKeys[sort.value] ?? []),
    }))
    .sort((a, b) => compareKeys(a.key, b.key, directions) || a.index - b.index)
    .map(({ item }) => item);
}

/** 状態が選ぶ並び順。範囲の外の値なら既定（先頭）。 */
export function selectedSort(spec: BrowseSpec, value: string): BrowseSort {
  return spec.sorts.find((sort) => sort.value === value) ?? spec.sorts[0];
}

/**
 * 状態に合う項目を、表示する順に並べる。種別と道具ごとの組で絞り、並び順で並べ、名前で絞っている間は
 * 一致の近い順に並べ直す。同じ度合いの中は選んでいる並び順のまま。
 */
export function browseItems<T extends BrowseItem>(
  items: readonly T[],
  state: BrowseState,
  spec: BrowseSpec,
): T[] {
  const kindLabel = spec.kinds.find((kind) => kind.value === state.kind)?.label;
  const activeFilters = Object.entries(state.filters).filter(
    ([, value]) => value !== ALL,
  );
  const narrowed = items.filter(
    (item) =>
      (kindLabel === undefined || item.kind === kindLabel) &&
      activeFilters.every(
        ([param, value]) => item.filterValues?.[param] === value,
      ),
  );
  const sorted = sortBrowseItems(narrowed, selectedSort(spec, state.sort));
  const query = normalizeSearchText(state.query.trim());
  if (query === "") return sorted;
  return sorted
    .map((item, index) => ({ item, index, degree: matchDegree(item, query) }))
    .filter(
      (entry): entry is { item: T; index: number; degree: 0 | 1 | 2 | 3 } =>
        entry.degree !== null,
    )
    .sort((a, b) => a.degree - b.degree || a.index - b.index)
    .map(({ item }) => item);
}

/** ページの切り出し。範囲の外のページは、最も近い端のページとして切り出す。start と end は 1 から数える。 */
export interface BrowsePageSlice<T> {
  items: T[];
  page: number;
  pageCount: number;
  start: number;
  end: number;
}

export function slicePage<T>(
  items: readonly T[],
  page: number,
  perPage: number,
): BrowsePageSlice<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount);
  const offset = (current - 1) * perPage;
  const pageItems = items.slice(offset, offset + perPage);
  return {
    items: pageItems,
    page: current,
    pageCount,
    start: pageItems.length > 0 ? offset + 1 : 0,
    end: offset + pageItems.length,
  };
}

/** 既定の状態（名前の条件が空・どの組も「すべて」・並び順が既定・1ページ目）。 */
export function defaultBrowseState(spec: BrowseSpec): BrowseState {
  return {
    query: "",
    kind: ALL,
    sort: spec.sorts[0]?.value ?? "",
    filters: Object.fromEntries(
      spec.filterGroups.map((group) => [group.param, ALL]),
    ),
    page: 1,
  };
}

/** 名前の条件・種別・道具ごとの組・並び順のどれかが既定と違うか。ページは見ない。 */
export function isFiltered(state: BrowseState): boolean {
  return (
    state.query.trim() !== "" ||
    state.kind !== ALL ||
    Object.values(state.filters).some((value) => value !== ALL)
  );
}

export function isDefaultBrowseState(
  state: BrowseState,
  spec: BrowseSpec,
): boolean {
  return !isFiltered(state) && state.sort === defaultBrowseState(spec).sort;
}

function pickChoice(
  value: string | null,
  choices: readonly BrowseChoice[],
  fallback: string,
): string {
  return value !== null && choices.some((choice) => choice.value === value)
    ? value
    : fallback;
}

/** URL のクエリから状態を読む。範囲の外の値は既定の値として読む。 */
export function readBrowseState(search: string, spec: BrowseSpec): BrowseState {
  const params = new URLSearchParams(search);
  const defaults = defaultBrowseState(spec);
  const page = Number(params.get("page"));
  return {
    query: params.get("q") ?? "",
    kind: pickChoice(params.get("kind"), spec.kinds, ALL),
    sort: pickChoice(params.get("sort"), spec.sorts, defaults.sort),
    filters: Object.fromEntries(
      spec.filterGroups.map((group) => [
        group.param,
        pickChoice(params.get(group.param), group.options, ALL),
      ]),
    ),
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/**
 * 状態をクエリの文にする。既定の値は書かない。先頭の "?" を含み、書くものが無ければ空の文。
 * 道具ごとの組の名前は q・kind・sort・page と重ならないものにする。
 */
export function browseSearch(state: BrowseState, spec: BrowseSpec): string {
  const params = new URLSearchParams();
  const defaults = defaultBrowseState(spec);
  if (state.query !== "") params.set("q", state.query);
  if (state.kind !== ALL) params.set("kind", state.kind);
  for (const group of spec.filterGroups) {
    if (RESERVED_PARAMS.has(group.param)) continue;
    const value = state.filters[group.param] ?? ALL;
    if (value !== ALL) params.set(group.param, value);
  }
  if (state.sort !== defaults.sort) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  const text = params.toString();
  return text === "" ? "" : `?${text}`;
}

/**
 * 畳んだ枠の開閉のボタンのラベル（§7）。畳んだ組のいまの選択を言う。絞っている組の値を種別・道具ごとの組の
 * 順に「、」でつなぎ（値の中に「・」が現れるので区切りに使わない）、どの組も絞っていなければ「すべて」の1語で言う。
 */
export function controlsLabel(options: {
  /** 絞り込みの組（種別・道具ごとの組）を持つか。 */
  hasFilterGroups: boolean;
  /** 絞っている組の選択の語。種別・道具ごとの組の順。 */
  selectedFilters: readonly string[];
  /** 並び順の組を持つとき、選んでいる並び順の語。 */
  sortLabel?: string;
}): string {
  const selection =
    options.selectedFilters.length > 0
      ? options.selectedFilters.join("、")
      : "すべて";
  if (options.hasFilterGroups && options.sortLabel !== undefined) {
    return `絞り込みと並び順（${selection}、${options.sortLabel}）`;
  }
  if (options.hasFilterGroups) {
    return `絞り込み（${selection}）`;
  }
  return `並び順（${options.sortLabel ?? ""}）`;
}

const numberFormat = new Intl.NumberFormat("ja-JP");

function count(value: number, unit: BrowseUnit): string {
  return `${numberFormat.format(value)}${unit}`;
}

/** 「条件に合う○○はありません」の○○。「件」は物の名前にならないので「もの」と言う。 */
function unitNoun(unit: BrowseUnit): string {
  return unit === "件" ? "もの" : unit;
}

/**
 * 件数の行の文（§7）。全体の件数をいつも言い、絞っている間は該当の件数も言う。ページ送りがあるときは
 * 表示している範囲を、並び順の組が無いときはその並び順を後ろに添える。
 */
export function statusText(options: {
  total: number;
  matched: number;
  filtering: boolean;
  unit: BrowseUnit;
  /** ページ送りがあるときの、表示している範囲（1 から数える）。 */
  range?: { start: number; end: number };
  /** 並び順の組が無いときの、既定の並び順の語。 */
  sortLabel?: string;
}): string {
  const { total, matched, filtering, unit, range, sortLabel } = options;
  if (filtering && matched === 0) {
    return `条件に合う${unitNoun(unit)}はありません（全${count(total, unit)}）`;
  }
  const head = filtering
    ? `${count(matched, unit)}（全${count(total, unit)}）`
    : `全${count(total, unit)}`;
  const rangeText = !range
    ? ""
    : range.start === range.end
      ? `のうち${count(range.end, unit)}目`
      : `のうち${numberFormat.format(range.start)}〜${count(range.end, unit)}目`;
  const sortText = sortLabel ? `・${sortLabel}` : "";
  return `${head}${rangeText}${sortText}`;
}
