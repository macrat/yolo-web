import { describe, expect, test } from "vitest";
import {
  ALL,
  browseItems,
  browseSearch,
  controlsLabel,
  defaultBrowseState,
  isDefaultBrowseState,
  isFiltered,
  kanaCollationKey,
  matchDegree,
  normalizeSearchText,
  readBrowseState,
  slicePage,
  sortBrowseItems,
  statusText,
  statusWords,
  type BrowseItem,
  type BrowseSort,
  type BrowseSpec,
  type BrowseState,
} from "@/lib/list-browse";
import { getAllYoji } from "@/dictionary/_lib/yoji";

function item(name: string, extra: Partial<BrowseItem> = {}): BrowseItem {
  return { name, ...extra };
}

const KIND_ORDER = ["文章", "データ"];
const BY_READING: BrowseSort = {
  value: "reading",
  label: "五十音順",
  keys: [{ by: "reading" }],
};

const spec: BrowseSpec = {
  kinds: [
    { value: "text", label: "文章" },
    { value: "data", label: "データ" },
  ],
  sorts: [
    {
      value: "kind",
      label: "種別順",
      keys: [
        { by: "kind", order: KIND_ORDER },
        { by: "fact", index: 0, desc: true },
      ],
    },
    {
      value: "new",
      label: "新しい順",
      keys: [{ by: "fact", index: 0, desc: true }],
    },
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
    readings: ["スイ", "みず"],
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

  test("読みが1つの項目も、名前と読みに一致を見る", () => {
    const entry = item("一期一会", { readings: ["いちごいちえ"] });
    expect(matchDegree(entry, "いちごいちえ")).toBe(0);
    expect(matchDegree(entry, "一期")).toBe(1);
  });
});

describe("sortBrowseItems", () => {
  function day(text: string): Partial<BrowseItem> {
    return { facts: [{ text }] };
  }

  test("行の値から比べる値を組み、先頭から順に、値ごとの向きで比べる", () => {
    const items = [
      item("a", { kind: "データ", ...day("2026-01-01") }),
      item("b", { kind: "文章", ...day("2025-01-01") }),
      item("c", { kind: "文章", ...day("2026-01-01") }),
    ];
    expect(
      sortBrowseItems(items, spec.sorts[0]).map((entry) => entry.name),
    ).toEqual(["c", "b", "a"]);
  });

  test("比べる値が同じ項目は渡された順のまま並び、比べる値が無ければ渡された順", () => {
    const items = ["a", "b", "c", "d"].map((name) =>
      item(name, day("2026-02-13")),
    );
    expect(
      sortBrowseItems(items, spec.sorts[1]).map((entry) => entry.name),
    ).toEqual(["a", "b", "c", "d"]);
    const reversed = [...items].reverse();
    expect(
      sortBrowseItems(reversed, {
        value: "given",
        label: "渡した順",
        keys: [],
      }),
    ).toEqual(reversed);
  });

  test("補助情報は文の中の数字で比べ、order があればその並びの位置で比べる", () => {
    const strokes = ["12画", "4画", "5画"].map((text) =>
      item(text, { facts: [{ text }] }),
    );
    expect(
      sortBrowseItems(strokes, {
        value: "stroke",
        label: "画数順",
        keys: [{ by: "fact", index: 0 }],
      }).map((entry) => entry.name),
    ).toEqual(["4画", "5画", "12画"]);
    const levels = ["上級", "初級", "中級"].map((text) =>
      item(text, { facts: [{ text }] }),
    );
    expect(
      sortBrowseItems(levels, {
        value: "easy",
        label: "やさしい順",
        keys: [{ by: "fact", index: 0, order: ["初級", "中級", "上級"] }],
      }).map((entry) => entry.name),
    ).toEqual(["初級", "中級", "上級"]);
  });

  test("補助情報の日時で比べる", () => {
    const items = [
      "2026-02-13T09:00:00+09:00",
      "2026-02-13T18:00:00+09:00",
      "2026-02-12T23:00:00+09:00",
    ].map((dateTime) =>
      item(dateTime, { facts: [{ text: dateTime.slice(0, 10), dateTime }] }),
    );
    expect(
      sortBrowseItems(items, {
        value: "newest",
        label: "新しい順",
        keys: [{ by: "factTime", index: 0, desc: true }],
      }).map((entry) => entry.name),
    ).toEqual([
      "2026-02-13T18:00:00+09:00",
      "2026-02-13T09:00:00+09:00",
      "2026-02-12T23:00:00+09:00",
    ]);
  });

  test("色見本の色を OKLCH にして、色みの順の中を色相で、無彩色を明るい順で並べる", () => {
    const colors = [
      item("白", { kind: "無彩色", swatch: "#ffffff" }),
      item("青", { kind: "寒色", swatch: "#0000ff" }),
      item("黒", { kind: "無彩色", swatch: "#000000" }),
      item("赤", { kind: "暖色", swatch: "#ff0000" }),
      item("灰", { kind: "無彩色", swatch: "#808080" }),
      item("黄", { kind: "暖色", swatch: "#ffff00" }),
    ];
    const byHue: BrowseSort = {
      value: "hue",
      label: "色み順",
      keys: [
        { by: "kind", order: ["暖色", "寒色", "無彩色"] },
        { by: "swatch", channel: "hue", achromaticKind: "無彩色" },
        { by: "swatch", channel: "lightness", desc: true },
      ],
    };
    expect(sortBrowseItems(colors, byHue).map((entry) => entry.name)).toEqual([
      "赤",
      "黄",
      "青",
      "白",
      "灰",
      "黒",
    ]);
    const byLightness: BrowseSort = {
      value: "light",
      label: "明るい順",
      keys: [{ by: "swatch", channel: "lightness", desc: true }],
    };
    expect(
      sortBrowseItems(colors, byLightness).map((entry) => entry.name),
    ).toEqual(["白", "黄", "赤", "灰", "青", "黒"]);
  });

  test("彩度が achromaticChroma に満たない色は、同じ種別の中で色相を持つ色の後ろに明るい順で並ぶ", () => {
    // OKLCH の C: #fffffb は 0.005、#4f4f48 は 0.011、#707c74 は 0.019。
    const colors = [
      item("溝鼠", { kind: "黄系", swatch: "#4f4f48" }),
      item("黄", { kind: "黄系", swatch: "#ffff00" }),
      item("胡粉", { kind: "黄系", swatch: "#fffffb" }),
      item("山吹", { kind: "黄系", swatch: "#f8b500" }),
      item("利休鼠", { kind: "緑系", swatch: "#707c74" }),
      item("緑", { kind: "緑系", swatch: "#00ff00" }),
    ];
    const keys: BrowseSort["keys"] = [
      { by: "kind", order: ["黄系", "緑系"] },
      { by: "swatch", channel: "hue", achromaticChroma: 0.015 },
      { by: "swatch", channel: "lightness", desc: true },
    ];
    expect(
      sortBrowseItems(colors, { value: "hue", label: "色み順", keys }).map(
        (entry) => entry.name,
      ),
    ).toEqual(["山吹", "黄", "胡粉", "溝鼠", "緑", "利休鼠"]);

    // 閾値を渡さなければ、ほとんど色を持たない色も色相で並ぶ。
    expect(
      sortBrowseItems(colors, {
        value: "hue",
        label: "色み順",
        keys: [keys[0], { by: "swatch", channel: "hue" }],
      }).map((entry) => entry.name),
    ).toEqual(["山吹", "胡粉", "溝鼠", "黄", "緑", "利休鼠"]);
  });

  test("色相は、種別ごとに色相の最も大きくあいた所の後ろから数え、0度をまたぐ種別を割らない", () => {
    const hueKeys: BrowseSort["keys"] = [
      { by: "kind", order: ["赤系", "紫系"] },
      { by: "swatch", channel: "hue" },
    ];
    // OKLCH の色相: #c00060 は 2.0、#ff0040 は 20.8、#ff0000 は 29.2、#8000ff は 293.9、#ff00ff は 328.4、
    // #ff0080 は 2.5。
    const colors = [
      item("#ff0080", { kind: "紫系", swatch: "#ff0080" }),
      item("#ff0000", { kind: "赤系", swatch: "#ff0000" }),
      item("#ff00ff", { kind: "紫系", swatch: "#ff00ff" }),
      item("#c00060", { kind: "赤系", swatch: "#c00060" }),
      item("#8000ff", { kind: "紫系", swatch: "#8000ff" }),
      item("#ff0040", { kind: "赤系", swatch: "#ff0040" }),
    ];
    expect(
      sortBrowseItems(colors, {
        value: "hue",
        label: "色み順",
        keys: hueKeys,
      }).map((entry) => entry.name),
    ).toEqual([
      "#c00060",
      "#ff0040",
      "#ff0000",
      "#8000ff",
      "#ff00ff",
      "#ff0080",
    ]);

    // 種別を持たない項目（分類のページ）は、並べる全件で1つの起点を持つ。
    const purples = ["#ff0080", "#ff00ff", "#8000ff"].map((hex) =>
      item(hex, { swatch: hex }),
    );
    expect(
      sortBrowseItems(purples, {
        value: "hue",
        label: "色相順",
        keys: [{ by: "swatch", channel: "hue" }],
      }).map((entry) => entry.name),
    ).toEqual(["#8000ff", "#ff00ff", "#ff0080"]);
  });

  test("最初の読みで比べ、値を持たない項目は向きによらず後ろに回す", () => {
    const items = [
      item("無し"),
      item("水", { readings: ["スイ", "みず"] }),
      item("火", { readings: ["カ", "ひ"] }),
      item("種別外", { kind: "画像" }),
    ];
    expect(
      sortBrowseItems(items, BY_READING).map((entry) => entry.name),
    ).toEqual(["火", "水", "無し", "種別外"]);
    expect(
      sortBrowseItems(items, {
        value: "kind",
        label: "種別順",
        keys: [{ by: "kind", order: KIND_ORDER, desc: true }],
      }).map((entry) => entry.name),
    ).toEqual(["無し", "水", "火", "種別外"]);
  });

  test("仮名の読みは辞書の五十音順に並ぶ（清音と濁音・半濁音を同じ位置に並べる）", () => {
    const readings = [
      "かんぜんむけつ",
      "がりょうてんせい",
      "かいき",
      "ぎょう",
      "きよう",
      "きょう",
      "ぱぱ",
      "ばば",
      "はば",
      "はは",
      "じょう",
      "しよう",
      "しょう",
    ];
    const items = readings.map((name) => item(name, { readings: [name] }));
    expect(
      sortBrowseItems(items, BY_READING).map((entry) => entry.name),
    ).toEqual([
      "かいき",
      "がりょうてんせい",
      "かんぜんむけつ",
      "きょう",
      "きよう",
      "ぎょう",
      "しょう",
      "しよう",
      "じょう",
      "はは",
      "はば",
      "ばば",
      "ぱぱ",
    ]);
  });

  test("濁点の差を語全体で先に比べ、同じなら長音符 → 小書き → 並の順に比べる（日本語の照合と同じ）", () => {
    const collator = new Intl.Collator("ja");
    const expectedOrders = [
      ["はーと", "はあと", "はあど"],
      ["きつか", "きっが"],
      ["かー", "かぁ", "かあ"],
      ["かー", "がー", "があ"],
      ["はぁ", "ばあ", "ぱー"],
      ["かが", "がか"],
    ];
    for (const expected of expectedOrders) {
      const items = [...expected]
        .reverse()
        .map((name) => item(name, { readings: [name] }));
      const sorted = sortBrowseItems(items, BY_READING).map(
        (entry) => entry.name,
      );
      expect(sorted).toEqual(expected);
      expect(sorted).toEqual([...expected].sort(collator.compare));
    }
  });

  test("四字熟語の全件の読みが、日本語の照合（Intl.Collator）と同じ順に並ぶ", () => {
    const readings = getAllYoji().map((entry) => entry.reading);
    const items = readings.map((name) => item(name, { readings: [name] }));
    const sorted = sortBrowseItems(items, BY_READING).map(
      (entry) => entry.name,
    );
    expect(sorted).toEqual([...readings].sort(new Intl.Collator("ja").compare));
  });
});

describe("kanaCollationKey", () => {
  test("1段目は濁点・半濁点を外し、小書きの仮名を並に寄せ、長音符を母音にする", () => {
    expect(kanaCollationKey("ガッコウ")[0]).toBe("かつこう");
    expect(kanaCollationKey("ぱーてぃー")[0]).toBe("はあていい");
  });

  test("2段目は字ごとの濁点・半濁点、3段目は字ごとの長音符・小書き・並の重み", () => {
    expect(kanaCollationKey("ガッコウ")).toEqual(["かつこう", "1000", "2122"]);
    expect(kanaCollationKey("ぱーてぃー")).toEqual([
      "はあていい",
      "20000",
      "20210",
    ]);
  });
});

describe("browseItems", () => {
  const items = [
    item("文字数カウント", {
      kind: "文章",
      facts: [{ text: "3" }],
      searchTexts: ["文字数を数える"],
    }),
    item("JSON整形", {
      kind: "データ",
      facts: [{ text: "2" }],
      searchTexts: ["JSON を読みやすく"],
    }),
    item("テキスト置換", {
      kind: "文章",
      facts: [{ text: "1" }],
      searchTexts: ["文字を置き換える"],
    }),
    item("json から CSV", {
      kind: "データ",
      facts: [{ text: "0" }],
      filterValues: { level: "2" },
    }),
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

  test("表示している範囲が1件なら、その1つの番号だけを言う", () => {
    expect(
      statusText({
        total: 101,
        matched: 101,
        filtering: false,
        unit: "語",
        range: { start: 101, end: 101 },
      }),
    ).toBe("全101語のうち101語目");
  });

  test("数と単位を1語にし、範囲は「〜」の後ろで分ける", () => {
    expect(
      statusWords({
        total: 1110,
        matched: 1110,
        filtering: false,
        unit: "字",
        range: { start: 1101, end: 1110 },
      }),
    ).toEqual(["全1,110字", "のうち", "1,101〜", "1,110字目"]);
    expect(
      statusWords({ total: 86, matched: 12, filtering: true, unit: "件" }),
    ).toEqual(["12件", "（全86件）"]);
  });

  test("並び順は「・」を前の語に付け、文節ごとの語に分ける", () => {
    expect(
      statusWords({
        total: 10,
        matched: 10,
        filtering: false,
        unit: "色",
        sortLabel: "明るい順",
      }),
    ).toEqual(["全10色・", "明るい順"]);
    expect(
      statusWords({
        total: 6,
        matched: 6,
        filtering: false,
        unit: "字",
        sortLabel: "読みの五十音順",
      }),
    ).toEqual(["全6字・", "読みの", "五十音順"]);
    expect(
      statusWords({
        total: 118,
        matched: 118,
        filtering: false,
        unit: "字",
        range: { start: 101, end: 118 },
        sortLabel: "画数順",
      }),
    ).toEqual(["全118字", "のうち", "101〜", "118字目・", "画数順"]);
  });

  test("0件の文は文節ごとの語に分け、全体の件数を1語で続ける", () => {
    expect(
      statusWords({ total: 2136, matched: 0, filtering: true, unit: "字" }),
    ).toEqual(["条件に合う", "字は", "ありません", "（全2,136字）"]);
    expect(
      statusWords({ total: 86, matched: 0, filtering: true, unit: "件" }),
    ).toEqual(["条件に合う", "ものは", "ありません", "（全86件）"]);
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
