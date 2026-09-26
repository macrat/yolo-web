import { describe, expect, test } from "vitest";
import { BASE_URL } from "@/lib/constants";
import {
  browseItems,
  readBrowseState,
  slicePage,
  type BrowseSpec,
} from "@/lib/list-browse";
import {
  getKanjiByChar,
  getKanjiGrades,
  getKanjiRadicals,
  getKanjiStrokeCounts,
} from "../kanji";
import {
  KANJI_LIST_PER_PAGE,
  kanjiIndexEntries,
  kanjiListItems,
  kanjiListMetadata,
  kanjiListPageParams,
  kanjiListSorts,
  kanjiReadings,
  type KanjiListScope,
} from "../kanji-list";

const allScopes = (): KanjiListScope[] => [
  { type: "all" },
  ...getKanjiGrades().map((grade): KanjiListScope => ({
    type: "grade",
    grade: Number(grade),
  })),
  ...getKanjiRadicals().map((radical): KanjiListScope => ({
    type: "radical",
    radical,
  })),
  ...getKanjiStrokeCounts().map((strokeCount): KanjiListScope => ({
    type: "stroke",
    strokeCount,
  })),
];

function specOf(scope: KanjiListScope): BrowseSpec {
  return { kinds: [], sorts: kanjiListSorts(scope), filterGroups: [] };
}

describe("kanjiReadings", () => {
  test("同じ読みを1つにまとめ、音読み・訓読みの順に並べる", () => {
    const sei = getKanjiByChar("生");
    expect(sei).toBeDefined();
    const readings = kanjiReadings(sei!);
    expect(new Set(readings).size).toBe(readings.length);
    expect(readings.slice(0, 2)).toEqual(["セイ", "ショウ"]);
    expect(readings.filter((reading) => reading === "なま")).toHaveLength(1);
  });

  test("どの範囲の行も、音訓に同じ読みが重ならない", () => {
    for (const item of kanjiListItems({ type: "all" })) {
      const readings = item.readings ?? [];
      expect(new Set(readings).size, item.name).toBe(readings.length);
    }
  });
});

describe("kanjiListItems", () => {
  test("トップは2,136字を学年順（同じ学年の中は画数順）で並べる", () => {
    const items = kanjiListItems({ type: "all" });
    expect(items).toHaveLength(2136);
    const keys = items.map((item) => {
      const kanji = getKanjiByChar(item.name)!;
      return [kanji.grade, kanji.strokeCount];
    });
    for (let i = 1; i < keys.length; i++) {
      const [gradeA, strokeA] = keys[i - 1];
      const [gradeB, strokeB] = keys[i];
      expect(gradeA < gradeB || (gradeA === gradeB && strokeA <= strokeB)).toBe(
        true,
      );
    }
  });

  test("項目は行に見せる値と熟語だけを持ち、リンク先の slug を持たない（字そのものが名前）", () => {
    const keys = new Set(
      kanjiListItems({ type: "all" }).flatMap((item) => Object.keys(item)),
    );
    expect([...keys].sort()).toEqual(
      ["facts", "kind", "name", "readings", "searchTexts"].sort(),
    );
  });

  test("どの範囲のどの並び順も、学年・画数・最初の読みで並べた順と同じ", () => {
    const valueOf = (name: string, key: "grade" | "stroke" | "reading") => {
      const kanji = getKanjiByChar(name)!;
      if (key === "grade") return kanji.grade;
      if (key === "stroke") return kanji.strokeCount;
      return kanjiReadings(kanji)[0];
    };
    const thenOf: Record<
      string,
      Record<string, "grade" | "stroke" | "reading">
    > = {
      all: { grade: "stroke", stroke: "grade" },
      grade: { stroke: "reading" },
      radical: { grade: "stroke", stroke: "grade" },
      stroke: { grade: "reading" },
    };
    const collator = new Intl.Collator("ja");
    for (const scope of allScopes()) {
      const spec = specOf(scope);
      for (const sort of spec.sorts) {
        const shown = browseItems(
          kanjiListItems(scope),
          readBrowseState(`?sort=${sort.value}`, spec),
          spec,
        ).map((item) => item.name);
        const order = sort.value as "grade" | "stroke" | "reading";
        const then = thenOf[scope.type][order];
        const compare = (a: string, b: string) => {
          for (const key of then ? [order, then] : [order]) {
            const x = valueOf(a, key);
            const y = valueOf(b, key);
            const diff =
              typeof x === "number" && typeof y === "number"
                ? x - y
                : collator.compare(String(x), String(y));
            if (diff !== 0) return diff;
          }
          return 0;
        };
        for (let i = 1; i < shown.length; i++) {
          expect(
            compare(shown[i - 1], shown[i]),
            `${JSON.stringify(scope)} ${sort.value} ${shown[i - 1]} ${shown[i]}`,
          ).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  test("学年のページは学年を行に出さず、画数のページは画数を補助情報に出さない", () => {
    expect(
      kanjiListItems({ type: "grade", grade: 1 }).every(
        (item) => item.kind === undefined,
      ),
    ).toBe(true);
    expect(
      kanjiListItems({ type: "stroke", strokeCount: 4 }).every(
        (item) => item.facts === undefined,
      ),
    ).toBe(true);
  });

  test("「水」と打つと、字が「水」の行が先頭に来て、熟語に「水」を含む字が後ろに続く", () => {
    for (const scope of [
      { type: "all" },
      { type: "radical", radical: "水" },
    ] as KanjiListScope[]) {
      const spec = specOf(scope);
      const shown = browseItems(
        kanjiListItems(scope),
        readBrowseState("?q=水", spec),
        spec,
      );
      expect(shown[0].name).toBe("水");
      expect(shown.length).toBeGreaterThan(1);
    }
  });

  test("読みの平仮名で、片仮名の音読みに当たる", () => {
    const scope: KanjiListScope = { type: "grade", grade: 1 };
    const spec = specOf(scope);
    const shown = browseItems(
      kanjiListItems(scope),
      readBrowseState("?q=すい", spec),
      spec,
    );
    expect(shown[0].name).toBe("水");
  });

  test("英語の意味では探さない", () => {
    const scope: KanjiListScope = { type: "all" };
    const spec = specOf(scope);
    expect(
      browseItems(
        kanjiListItems(scope),
        readBrowseState("?q=water", spec),
        spec,
      ),
    ).toHaveLength(0);
  });
});

describe("kanjiListSorts", () => {
  test("範囲ごとの既定とほかの並び順", () => {
    const labels = (scope: KanjiListScope) =>
      kanjiListSorts(scope).map((sort) => sort.label);
    expect(labels({ type: "all" })).toEqual([
      "学年順",
      "画数順",
      "読みの五十音順",
    ]);
    expect(labels({ type: "grade", grade: 7 })).toEqual([
      "画数順",
      "読みの五十音順",
    ]);
    expect(labels({ type: "radical", radical: "水" })).toEqual([
      "画数順",
      "学年順",
      "読みの五十音順",
    ]);
    expect(labels({ type: "stroke", strokeCount: 10 })).toEqual([
      "学年順",
      "読みの五十音順",
    ]);
  });

  test("学年が1つしかない範囲は、学年で並べる順を持たない", () => {
    for (const scope of allScopes()) {
      if (scope.type !== "radical" && scope.type !== "stroke") continue;
      const grades = new Set(kanjiListItems(scope).map((item) => item.kind));
      const hasGradeSort = kanjiListSorts(scope).some(
        (sort) => sort.value === "grade",
      );
      expect(hasGradeSort).toBe(grades.size > 1);
    }
  });
});

describe("kanjiListPageParams", () => {
  test("学年7は12ページで、1〜11ページ目に100字、12ページ目に10字", () => {
    const scope: KanjiListScope = { type: "grade", grade: 7 };
    expect(kanjiListPageParams(scope).map(({ page }) => page)).toEqual(
      Array.from({ length: 11 }, (_, i) => String(i + 2)),
    );
    const items = kanjiListItems(scope);
    for (let page = 1; page <= 11; page++) {
      expect(slicePage(items, page, KANJI_LIST_PER_PAGE).items).toHaveLength(
        100,
      );
    }
    expect(slicePage(items, 12, KANJI_LIST_PER_PAGE).items).toHaveLength(10);
  });

  test("2ページ目からのページは、トップ21・学年17・部首2・画数14の計54", () => {
    const count = (scopes: KanjiListScope[]) =>
      scopes.reduce((sum, scope) => sum + kanjiListPageParams(scope).length, 0);
    const scopes = allScopes();
    expect(count(scopes.filter((scope) => scope.type === "all"))).toBe(21);
    expect(count(scopes.filter((scope) => scope.type === "grade"))).toBe(17);
    expect(count(scopes.filter((scope) => scope.type === "radical"))).toBe(2);
    expect(count(scopes.filter((scope) => scope.type === "stroke"))).toBe(14);
    expect(kanjiListPageParams({ type: "grade", grade: 1 })).toEqual([]);
  });
});

describe("kanjiListMetadata", () => {
  test("2ページ目からは題にページを添え、自分を canonical にする", () => {
    const first = kanjiListMetadata({ type: "all" }, 1);
    const second = kanjiListMetadata({ type: "all" }, 2);
    expect(first.title).toBe("漢字辞典 | yolos.net");
    expect(second.title).toBe("漢字辞典（2ページ目） | yolos.net");
    expect(second.alternates?.canonical).toBe(
      `${BASE_URL}/dictionary/kanji/page/2`,
    );
    const radical = kanjiListMetadata({ type: "radical", radical: "水" }, 2);
    expect(radical.title).toBe(
      "部首「水」の漢字一覧 - 漢字辞典（2ページ目） | yolos.net",
    );
    expect(radical.alternates?.canonical).toBe(
      `${BASE_URL}/dictionary/kanji/radical/${encodeURIComponent("水")}/page/2`,
    );
  });
});

describe("kanjiIndexEntries", () => {
  test("学年7・部首198・画数24を持ち、部首は部首の画数の少ない順に区切る", () => {
    const { grades, radicals, strokes } = kanjiIndexEntries();
    expect(grades).toHaveLength(7);
    expect(strokes).toHaveLength(24);
    expect(radicals.flatMap((group) => group.items)).toHaveLength(198);
    const counts = radicals.map((group) => Number.parseInt(group.heading, 10));
    expect(counts).toEqual([...counts].sort((a, b) => a - b));
  });

  test("部首の字の画数は、常用漢字ならその字の画数、ほかは康熙字典の画数", () => {
    const { radicals } = kanjiIndexEntries();
    const groupOf = (radical: string) =>
      radicals.find((group) =>
        group.items.some((item) => item.label === radical),
      )?.heading;
    expect(groupOf("一")).toBe("1画");
    expect(groupOf("水")).toBe("4画");
    expect(groupOf("麦")).toBe("7画");
    expect(groupOf("辵")).toBe("7画");
    expect(groupOf("黃")).toBe("12画");
  });
});
