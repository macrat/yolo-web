import { describe, expect, test } from "vitest";
import {
  ALL,
  browseItems,
  browseSearch,
  controlsLabel,
  defaultBrowseState,
  isDefaultBrowseState,
  isFiltered,
  matchDegree,
  normalizeSearchText,
  readBrowseState,
  slicePage,
  sortBrowseItems,
  statusText,
  type BrowseItem,
  type BrowseSpec,
  type BrowseState,
} from "@/lib/list-browse";

function item(
  name: string,
  extra: Partial<BrowseItem> = {},
  sortKeys: BrowseItem["sortKeys"] = {},
): BrowseItem {
  return { name, slug: name, sortKeys, ...extra };
}

const spec: BrowseSpec = {
  kinds: [
    { value: "text", label: "文章" },
    { value: "data", label: "データ" },
  ],
  sorts: [
    { value: "kind", label: "種別順", directions: ["asc", "desc"] },
    { value: "new", label: "新しい順", directions: ["desc"] },
  ],
  filterGroups: [
    {
      param: "level",
      legend: "難易度",
      options: [
        { value: "1", label: "初級" },
        { value: "2", label: "中級" },
      ],
    },
  ],
};

function state(change: Partial<BrowseState> = {}): BrowseState {
  return { ...defaultBrowseState(spec), ...change };
}

describe("normalizeSearchText", () => {
  test("片仮名を平仮名に寄せる", () => {
    expect(normalizeSearchText("スイ")).toBe("すい");
    expect(normalizeSearchText("ヴァ")).toBe("ゔぁ");
  });

  test("NFKC で全角の英数字と半角の片仮名を揃え、小文字にする", () => {
    expect(normalizeSearchText("ＪＳＯＮ")).toBe("json");
    expect(normalizeSearchText("JSON")).toBe("json");
    expect(normalizeSearchText("ｽｲ")).toBe("すい");
  });

  test("平仮名に対応の無い片仮名（ヷ）は残す", () => {
    expect(normalizeSearchText("ヷ")).toBe("ヷ");
  });
});

describe("matchDegree", () => {
  const water = item("水", {
    matchNames: ["水", "スイ", "みず"],
    searchTexts: ["水道", "water"],
  });

  test("名前か読みが一致すると 0", () => {
    expect(matchDegree(water, "水")).toBe(0);
    expect(matchDegree(water, normalizeSearchText("スイ"))).toBe(0);
    expect(matchDegree(water, "すい")).toBe(0);
  });

  test("打った字で始まると 1、含むと 2", () => {
    expect(matchDegree(water, "み")).toBe(1);
    expect(matchDegree(water, "ず")).toBe(2);
  });

  test("名前と読みで当たらずほかの値で当たると 3、どれにも当たらなければ null", () => {
    expect(matchDegree(water, "水道")).toBe(3);
    expect(matchDegree(water, "fire")).toBeNull();
  });

  test("matchNames が無ければ名前と読みを見る", () => {
    const entry = item("一期一会", { reading: "いちごいちえ" });
    expect(matchDegree(entry, "いちごいちえ")).toBe(0);
    expect(matchDegree(entry, "一期")).toBe(1);
  });
});

describe("sortBrowseItems", () => {
  test("比べる値を先頭から順に、向きに従って比べる", () => {
    const items = [
      item("a", {}, { kind: [2, 20260101] }),
      item("b", {}, { kind: [1, 20250101] }),
      item("c", {}, { kind: [1, 20260101] }),
    ];
    expect(
      sortBrowseItems(items, spec.sorts[0]).map((entry) => entry.name),
    ).toEqual(["c", "b", "a"]);
  });

  test("比べる値が同じ項目は渡された順のまま並ぶ", () => {
    const items = ["a", "b", "c", "d"].map((name) =>
      item(name, {}, { new: [20260213] }),
    );
    expect(
      sortBrowseItems(items, spec.sorts[1]).map((entry) => entry.name),
    ).toEqual(["a", "b", "c", "d"]);
  });

  test("文字列は符号位置で比べ、平仮名の読みが五十音の順に並ぶ", () => {
    const items = ["さくら", "あお", "かき"].map((name) =>
      item(name, {}, { reading: [name] }),
    );
    expect(
      sortBrowseItems(items, { value: "reading", label: "五十音順" }).map(
        (entry) => entry.name,
      ),
    ).toEqual(["あお", "かき", "さくら"]);
  });
});

describe("browseItems", () => {
  const items = [
    item(
      "文字数カウント",
      { kind: "文章", searchTexts: ["文字数を数える"] },
      { kind: [1, 3], new: [3] },
    ),
    item(
      "JSON整形",
      { kind: "データ", searchTexts: ["JSON を読みやすく"] },
      { kind: [2, 2], new: [2] },
    ),
    item(
      "テキスト置換",
      { kind: "文章", searchTexts: ["文字を置き換える"] },
      { kind: [1, 1], new: [1] },
    ),
    item(
      "json から CSV",
      { kind: "データ", filterValues: { level: "2" } },
      { kind: [2, 1], new: [0] },
    ),
  ];

  test("既定の状態では既定の並び順で全件", () => {
    expect(browseItems(items, state(), spec).map((e) => e.name)).toEqual([
      "文字数カウント",
      "テキスト置換",
      "JSON整形",
      "json から CSV",
    ]);
  });

  test("種別で絞る", () => {
    expect(
      browseItems(items, state({ kind: "data" }), spec).map((e) => e.name),
    ).toEqual(["JSON整形", "json から CSV"]);
  });

  test("道具ごとの組で絞る", () => {
    expect(
      browseItems(items, state({ filters: { level: "2" } }), spec).map(
        (e) => e.name,
      ),
    ).toEqual(["json から CSV"]);
  });

  test("名前で絞ると一致の近い順に並び、同じ度合いの中は選んでいる並び順に従う", () => {
    // 「json」はどちらも名前の頭に当たる（度合い 1）ので、新しい順のまま並ぶ。
    expect(
      browseItems(items, state({ query: "ＪＳＯＮ", sort: "new" }), spec).map(
        (e) => e.name,
      ),
    ).toEqual(["JSON整形", "json から CSV"]);
    // 「文字」は名前の頭（度合い 1）と、ほかの値（度合い 3）に当たる。
    expect(
      browseItems(items, state({ query: "文字" }), spec).map((e) => e.name),
    ).toEqual(["文字数カウント", "テキスト置換"]);
  });

  test("前後の空白は条件に含めない", () => {
    expect(browseItems(items, state({ query: "  " }), spec)).toHaveLength(4);
  });
});

describe("slicePage", () => {
  const numbers = Array.from({ length: 101 }, (_, i) => i + 1);

  test("ページを切り出し、範囲を 1 から数える", () => {
    expect(slicePage(numbers, 2, 50)).toMatchObject({
      page: 2,
      pageCount: 3,
      start: 51,
      end: 100,
    });
    expect(slicePage(numbers, 3, 50).items).toEqual([101]);
  });

  test("範囲の外のページは端のページとして切り出す", () => {
    expect(slicePage(numbers, 9, 50).page).toBe(3);
    expect(slicePage(numbers, 0, 50).page).toBe(1);
  });

  test("項目が無ければ1ページで、範囲は 0", () => {
    expect(slicePage([], 1, 50)).toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      start: 0,
      end: 0,
    });
  });
});

describe("URL のクエリとの読み書き", () => {
  test("既定の状態はクエリを持たない", () => {
    expect(browseSearch(state(), spec)).toBe("");
    expect(isDefaultBrowseState(state(), spec)).toBe(true);
  });

  test("既定と違う値だけを書き、読むと同じ状態に戻る", () => {
    const written = state({
      query: "水 道",
      kind: "data",
      sort: "new",
      filters: { level: "1" },
      page: 3,
    });
    const search = browseSearch(written, spec);
    expect(search).toBe(
      "?q=%E6%B0%B4+%E9%81%93&kind=data&level=1&sort=new&page=3",
    );
    expect(readBrowseState(search, spec)).toEqual(written);
  });

  test("範囲の外の値は既定の値として読む", () => {
    expect(
      readBrowseState("?kind=none&sort=old&level=9&page=abc", spec),
    ).toEqual(state());
    expect(readBrowseState("?page=0", spec).page).toBe(1);
  });

  test("並び順だけを変えた状態は、絞っていないが既定でもない", () => {
    const sorted = state({ sort: "new" });
    expect(isFiltered(sorted)).toBe(false);
    expect(isDefaultBrowseState(sorted, spec)).toBe(false);
  });

  test("種別か道具ごとの組を選ぶと絞っている", () => {
    expect(isFiltered(state({ kind: "text" }))).toBe(true);
    expect(isFiltered(state({ filters: { level: "2" } }))).toBe(true);
    expect(isFiltered(state({ filters: { level: ALL } }))).toBe(false);
  });
});

describe("controlsLabel", () => {
  test("組が並び順だけなら「並び順（…）」", () => {
    expect(
      controlsLabel({
        hasFilterGroups: false,
        selectedFilters: [],
        sortLabel: "新しい順",
      }),
    ).toBe("並び順（新しい順）");
  });

  test("どの組も絞っていなければ選択を「すべて」の1語で言う", () => {
    expect(
      controlsLabel({
        hasFilterGroups: true,
        selectedFilters: [],
        sortLabel: "種別順",
      }),
    ).toBe("絞り込みと並び順（すべて、種別順）");
  });

  test("絞っている組の値を「、」でつなぐ", () => {
    expect(
      controlsLabel({
        hasFilterGroups: true,
        selectedFilters: ["人生", "初級"],
        sortLabel: "読みの五十音順",
      }),
    ).toBe("絞り込みと並び順（人生、初級、読みの五十音順）");
  });

  test("並び順の組が無ければ「絞り込み（…）」", () => {
    expect(
      controlsLabel({ hasFilterGroups: true, selectedFilters: ["データ"] }),
    ).toBe("絞り込み（データ）");
  });
});

describe("statusText", () => {
  test("絞り込みが無いときは全体の件数", () => {
    expect(
      statusText({ total: 86, matched: 86, filtering: false, unit: "件" }),
    ).toBe("全86件");
  });

  test("絞り込み中は該当の件数も言う", () => {
    expect(
      statusText({ total: 86, matched: 12, filtering: true, unit: "件" }),
    ).toBe("12件（全86件）");
  });

  test("並び順の組が無いときは並び順を添える", () => {
    expect(
      statusText({
        total: 30,
        matched: 30,
        filtering: false,
        unit: "語",
        sortLabel: "五十音順",
      }),
    ).toBe("全30語・五十音順");
  });

  test("ページ送りがあるときは表示している範囲を言い、桁を区切る", () => {
    expect(
      statusText({
        total: 2136,
        matched: 2136,
        filtering: false,
        unit: "字",
        range: { start: 1001, end: 1100 },
      }),
    ).toBe("全2,136字のうち1,001〜1,100字目");
  });

  test("該当が0件のときは、条件に合うものが無いことと全体の件数を言う", () => {
    expect(
      statusText({ total: 250, matched: 0, filtering: true, unit: "色" }),
    ).toBe("条件に合う色はありません（全250色）");
    expect(
      statusText({ total: 86, matched: 0, filtering: true, unit: "件" }),
    ).toBe("条件に合うものはありません（全86件）");
  });
});
