/**
 * 一覧の件数と備え（DESIGN.md §7「件数と備え」）の純粋な関数。名前の絞り込み・種別と道具ごとの組の絞り込み・
 * 並べ替え・ページの切り出し・URL のクエリとの読み書き・畳んだ枠のラベルと件数の行の文を組む。
 * サーバーとクライアントで同じ結果を出すため、ロケールに依存する比較（Intl.Collator）を使わず、仮名の読みの
 * 辞書の並びは自前の比べる形で作る。
 */

import type { ItemListFact } from "@/components/ItemList";
import { hexToOklch } from "@/lib/hexToOklch";

/**
 * 一覧のページで絞り込み・並べ替えをする項目。サーバーからクライアントへ全件を渡すので、行に見せる値と、
 * それだけでは作れない値だけを持つ。一致を見る語・並び順で比べる値・リンク先は、クライアントで行の値から組む。
 */
export interface BrowseItem {
  name: string;
  /** 名前のリンク先の、一覧の接頭辞に続く部分。百分率符号化する前の形で、省略すると名前。 */
  slug?: string;
  /**
   * 読み。読みを複数持つ項目（漢字の音訓）は1つずつ並べる。行には「・」でつないで見せ、名前の絞り込みは名前と
   * 読みの1つずつに一致を見る。
   */
  readings?: string[];
  description?: string;
  /** 行に見せる種別の語。種別の絞り込みもこの語で当てる。 */
  kind?: string;
  facts?: ItemListFact[];
  swatch?: string;
  /** 名前と読みのほかに、名前の絞り込みで探す値（説明・タグ・熟語・例文など）。 */
  searchTexts?: string[];
  /** 道具ごとの組の値。組のクエリの名前から、その組の選択肢の値へ。 */
  filterValues?: Record<string, string>;
}

/**
 * 並び順で比べる値の1つ。どれも行に見えている値から組む（§7）。desc で大きい順・五十音の逆順にする。
 *
 * - reading: 最初の読み。仮名の辞書の並びで比べる。
 * - kind: 種別の語の、order の並びでの位置。
 * - fact: index 番目の補助情報。order があれば、その語の order の並びでの位置。無ければ、文の中の数字を
 *   つないだ数（「4画」は 4、「2026-02-13」は 20260213）。
 * - factTime: index 番目の補助情報の日時（dateTime）。
 * - swatch: 色見本の色を OKLCH にした値。channel が lightness なら明るさ（L）、hue なら色相。
 *   色相は円なので、同じ種別の項目の色相のうち最も大きくあいた所の後ろを起点に、そこから回った角度で比べる
 *   （0度をまたぐ紫系が、0度の前後で割れない）。種別を持たない項目どうしは、並べる全件で1つの起点を持つ。
 *   無彩色の色相には意味が無いので、achromaticKind の種別の項目は色相を持たないものとして扱う。色相を
 *   どちらも持たない項目どうしは次の値で比べるので、無彩色を明るさで並べるには lightness を後ろに続ける。
 */
export type BrowseSortKey =
  | { by: "reading"; desc?: boolean }
  | { by: "kind"; order: readonly string[]; desc?: boolean }
  | {
      by: "fact";
      index: number;
      order?: readonly string[];
      desc?: boolean;
    }
  | { by: "factTime"; index: number; desc?: boolean }
  | {
      by: "swatch";
      channel: "hue" | "lightness";
      achromaticKind?: string;
      desc?: boolean;
    };

/** ラジオボタンの組の選択肢。 */
export interface BrowseChoice {
  value: string;
  label: string;
}

/** 並び順の選択肢。 */
export interface BrowseSort extends BrowseChoice {
  /** 先頭の値から順に比べる。どの値も同じ項目は渡された順のまま並ぶので、空なら渡された順。 */
  keys: readonly BrowseSortKey[];
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
  const names = [item.name, ...(item.readings ?? [])]
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

type SortValue = number | KanaCollationKey | undefined;

function rank(
  order: readonly string[],
  value: string | undefined,
): number | undefined {
  const position = value === undefined ? -1 : order.indexOf(value);
  return position === -1 ? undefined : position;
}

function factNumber(text: string): number | undefined {
  const digits = text.replace(/[^0-9]/g, "");
  return digits === "" ? undefined : Number(digits);
}

function sortValue(item: BrowseItem, key: BrowseSortKey): SortValue {
  switch (key.by) {
    case "reading": {
      const reading = item.readings?.[0];
      return reading === undefined ? undefined : kanaCollationKey(reading);
    }
    case "kind":
      return rank(key.order, item.kind);
    case "fact": {
      const text = item.facts?.[key.index]?.text;
      if (text === undefined) return undefined;
      return key.order ? rank(key.order, text) : factNumber(text);
    }
    case "factTime": {
      const time = Date.parse(item.facts?.[key.index]?.dateTime ?? "");
      return Number.isNaN(time) ? undefined : time;
    }
    case "swatch": {
      if (item.swatch === undefined) return undefined;
      if (key.channel === "lightness") return hexToOklch(item.swatch).l;
      return item.kind !== undefined && item.kind === key.achromaticKind
        ? undefined
        : hexToOklch(item.swatch).h;
    }
  }
}

const FULL_TURN = 360;

/** 色相の起点。色相を円に並べたとき、最も大きくあいた所の後ろの色相。 */
function hueOrigin(hues: readonly number[]): number {
  const sorted = [...hues].sort((a, b) => a - b);
  let origin = sorted[0] ?? 0;
  let widestGap = -1;
  sorted.forEach((hue, i) => {
    const next = sorted[i + 1] ?? sorted[0] + FULL_TURN;
    if (next - hue > widestGap) {
      widestGap = next - hue;
      origin = next % FULL_TURN;
    }
  });
  return origin;
}

/**
 * 並べる全件の、1つの比べる値。色相は同じ種別の項目の色相から起点を決めるので、全件を見てから組む。ほかの値は
 * 項目ごとに組む。
 */
function sortValues(
  items: readonly BrowseItem[],
  key: BrowseSortKey,
): SortValue[] {
  const values = items.map((item) => sortValue(item, key));
  if (key.by !== "swatch" || key.channel !== "hue") return values;
  const huesByKind = new Map<string | undefined, number[]>();
  items.forEach((item, i) => {
    const hue = values[i];
    if (typeof hue !== "number") return;
    huesByKind.set(item.kind, [...(huesByKind.get(item.kind) ?? []), hue]);
  });
  const origins = new Map(
    [...huesByKind].map(([kind, hues]) => [kind, hueOrigin(hues)]),
  );
  return values.map((hue, i) =>
    typeof hue === "number"
      ? (hue - (origins.get(items[i].kind) ?? 0) + FULL_TURN) % FULL_TURN
      : hue,
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
  a: readonly SortValue[],
  b: readonly SortValue[],
  keys: readonly BrowseSortKey[],
): number {
  for (let i = 0; i < keys.length; i++) {
    const x = a[i];
    const y = b[i];
    // 値を持たない項目は、その並び順で後ろに回す。
    if (x === undefined && y === undefined) continue;
    if (x === undefined) return 1;
    if (y === undefined) return -1;
    const order = compareValues(x, y);
    if (order !== 0) return keys[i].desc ? -order : order;
  }
  return 0;
}

/**
 * 並び順で並べる。比べる値は行の値から組み、数は数の大小で、読みは仮名の辞書の並び（kanaCollationKey）で
 * 比べる。比べる値が同じ項目は、渡された順のまま並ぶ（安定な並べ替え）。
 */
export function sortBrowseItems<T extends BrowseItem>(
  items: readonly T[],
  sort: BrowseSort,
): T[] {
  const valuesByKey = sort.keys.map((key) => sortValues(items, key));
  return items
    .map((item, index) => ({
      item,
      index,
      values: valuesByKey.map((values) => values[index]),
    }))
    .sort(
      (a, b) => compareKeys(a.values, b.values, sort.keys) || a.index - b.index,
    )
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

/** 並び順の語を文節に分ける。どの並び順も「○○順」か「○○の○○順」の形なので、「の」の後ろで切る。 */
function sortLabelWords(sortLabel: string): string[] {
  return sortLabel.split(/(?<=の)/);
}

/**
 * 件数の行の文（§7）を、途中で折らない語に分けたもの。全体の件数をいつも言い、絞っている間は該当の件数も言う。
 * ページ送りがあるときは表示している範囲を、並び順の組が無いときはその並び順を後ろに添える。
 *
 * 行は語の切れ目でだけ折る。数と単位（「1,110字目」）は1語、並び順と0件の文は文節ごとの語
 * （「読みの」「五十音順」、「条件に合う」「字は」「ありません」）にする。行頭に置かない「・」は前の語に付ける。
 */
export function statusWords(options: {
  total: number;
  matched: number;
  filtering: boolean;
  unit: BrowseUnit;
  /** ページ送りがあるときの、表示している範囲（1 から数える）。 */
  range?: { start: number; end: number };
  /** 並び順の組が無いときの、既定の並び順の語。 */
  sortLabel?: string;
}): string[] {
  const { total, matched, filtering, unit, range, sortLabel } = options;
  const all = `全${count(total, unit)}`;
  if (filtering && matched === 0) {
    return ["条件に合う", `${unitNoun(unit)}は`, "ありません", `（${all}）`];
  }
  const words = filtering ? [count(matched, unit), `（${all}）`] : [all];
  if (range) {
    words.push("のうち");
    if (range.start !== range.end) {
      words.push(`${numberFormat.format(range.start)}〜`);
    }
    words.push(`${count(range.end, unit)}目`);
  }
  if (sortLabel) {
    words[words.length - 1] += "・";
    words.push(...sortLabelWords(sortLabel));
  }
  return words;
}

/** 件数の行の文を1つの文にしたもの。 */
export function statusText(options: Parameters<typeof statusWords>[0]): string {
  return statusWords(options).join("");
}
