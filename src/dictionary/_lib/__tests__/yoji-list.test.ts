import { describe, expect, test } from "vitest";
import { BASE_URL } from "@/lib/constants";
import {
  browseItems,
  readBrowseState,
  sortBrowseItems,
  type BrowseSpec,
} from "@/lib/list-browse";
import { getYojiCategories } from "../yoji";
import {
  YOJI_LIST_SORTS,
  yojiIndexEntries,
  yojiListItems,
  yojiListMetadata,
  yojiListPageParams,
  type YojiListScope,
} from "../yoji-list";

const spec: BrowseSpec = {
  kinds: [],
  sorts: YOJI_LIST_SORTS,
  filterGroups: [],
};

describe("yojiListItems", () => {
  test("トップは400語を持ち、カテゴリを種別に、難易度を補助情報に出す", () => {
    const items = yojiListItems({ type: "all" });
    expect(items).toHaveLength(400);
    expect(items.every((item) => item.kind !== undefined)).toBe(true);
    expect(
      items.every((item) =>
        ["初級", "中級", "上級"].includes(item.facts?.[0]?.text ?? ""),
      ),
    ).toBe(true);
  });

  test("カテゴリのページは種別を出さない", () => {
    expect(
      yojiListItems({ type: "category", category: "life" }).every(
        (item) => item.kind === undefined,
      ),
    ).toBe(true);
  });

  test("やさしい順は、初級・中級・上級の順で、同じ難易度の中は読みの五十音順", () => {
    const easy = sortBrowseItems(
      yojiListItems({ type: "all" }),
      YOJI_LIST_SORTS[1],
    );
    const levels = easy.map((item) => item.facts?.[0]?.text);
    expect(levels.indexOf("中級")).toBeGreaterThan(levels.lastIndexOf("初級"));
    expect(levels.indexOf("上級")).toBeGreaterThan(levels.lastIndexOf("中級"));
    const beginners = easy.filter((item) => item.facts?.[0]?.text === "初級");
    expect(beginners).toEqual(sortBrowseItems(beginners, YOJI_LIST_SORTS[0]));
  });

  test("読みの平仮名で当たり、意味と例文でも探せる", () => {
    const items = yojiListItems({ type: "all" });
    const byReading = browseItems(
      items,
      readBrowseState("?q=いちごいちえ", spec),
      spec,
    );
    expect(byReading[0].name).toBe("一期一会");
    const byMeaning = browseItems(
      items,
      readBrowseState("?q=一生に一度の出会い", spec),
      spec,
    );
    expect(byMeaning.map((item) => item.name)).toContain("一期一会");
  });
});

describe("yojiListPageParams", () => {
  test("トップは8ページ、life は2ページで、ほかのカテゴリは1ページ", () => {
    expect(yojiListPageParams({ type: "all" })).toHaveLength(7);
    const scopes = getYojiCategories().map((category): YojiListScope => ({
      type: "category",
      category,
    }));
    const pages = scopes.reduce(
      (sum, scope) => sum + yojiListPageParams(scope).length,
      0,
    );
    expect(pages).toBe(1);
    expect(yojiListPageParams({ type: "category", category: "life" })).toEqual([
      { page: "2" },
    ]);
  });
});

describe("yojiListMetadata", () => {
  test("2ページ目からは題にページを添え、自分を canonical にする", () => {
    expect(yojiListMetadata({ type: "all" }, 1).title).toBe(
      "四字熟語辞典 | yolos.net",
    );
    const life = yojiListMetadata({ type: "category", category: "life" }, 2);
    expect(life.title).toBe(
      "人生の四字熟語一覧 - 四字熟語辞典（2ページ目） | yolos.net",
    );
    expect(life.alternates?.canonical).toBe(
      `${BASE_URL}/dictionary/yoji/category/life/page/2`,
    );
  });
});

describe("yojiIndexEntries", () => {
  test("10のカテゴリを語の多い順に並べ、語の数を添える", () => {
    const entries = yojiIndexEntries();
    expect(entries).toHaveLength(10);
    const counts = entries.map((entry) => entry.count ?? 0);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(400);
  });
});
