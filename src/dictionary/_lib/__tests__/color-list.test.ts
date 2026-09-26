import { describe, expect, test } from "vitest";
import { BASE_URL } from "@/lib/constants";
import { hexToOklch } from "@/lib/hexToOklch";
import { sortBrowseItems } from "@/lib/list-browse";
import {
  colorIndexEntries,
  colorListCategories,
  colorListItems,
  colorListMetadata,
  colorListPageParams,
  colorListSorts,
  type ColorListScope,
} from "../color-list";

const lightness = (hex: string | undefined) => hexToOklch(hex ?? "").l;

describe("colorListItems", () => {
  test("トップは250色を持ち、色みを種別に、カラーコードを補助情報に出す", () => {
    const items = colorListItems({ type: "all" });
    expect(items).toHaveLength(250);
    expect(items.every((item) => item.kind !== undefined)).toBe(true);
    expect(items.every((item) => item.facts?.[0]?.text === item.swatch)).toBe(
      true,
    );
  });

  test("色み順は、赤系から無彩色まで色みの順に並び、無彩色の中は明るい順", () => {
    const items = colorListItems({ type: "all" });
    const kinds = items.map((item) => item.kind);
    expect([...new Set(kinds)]).toEqual([
      "赤系",
      "橙系",
      "黄系",
      "緑系",
      "青系",
      "紫系",
      "無彩色",
    ]);
    const achromatic = items
      .filter((item) => item.kind === "無彩色")
      .map((item) => lightness(item.swatch));
    expect(achromatic).toEqual([...achromatic].sort((a, b) => b - a));
  });

  test("色み順と色相順では、ほとんど色を持たない色が、その色みの最後に明るい順で並ぶ", () => {
    const all = colorListItems({ type: "all" });
    const last = (kind: string, count: number) =>
      all
        .filter((item) => item.kind === kind)
        .map((item) => item.name)
        .slice(-count);
    expect(last("黄系", 3)).toEqual(["胡粉", "白練", "溝鼠"]);
    expect(last("緑系", 1)).toEqual(["白鼠"]);
    expect(last("青系", 2)).toEqual(["銀鼠", "黒橡"]);
    expect(
      colorListItems({ type: "category", category: "yellow" })
        .map((item) => item.name)
        .slice(-3),
    ).toEqual(["胡粉", "白練", "溝鼠"]);
  });

  test("紫系は、0度をまたぐ色相でも一続きに並ぶ", () => {
    const hues = colorListItems({ type: "category", category: "purple" }).map(
      (item) => hexToOklch(item.swatch ?? "").h,
    );
    const firstLow = hues.findIndex((hue) => hue < 90);
    expect(firstLow).toBeGreaterThan(0);
    expect(hues.slice(firstLow).every((hue) => hue < 90)).toBe(true);
  });

  test("明るい順では、白に近い色が先頭、黒に近い色が末尾に来る", () => {
    const scope: ColorListScope = { type: "all" };
    const sorted = sortBrowseItems(
      colorListItems(scope),
      colorListSorts(scope)[1],
    );
    const values = sorted.map((item) => lightness(item.swatch));
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(values[0]).toBeGreaterThan(0.95);
    expect(values[values.length - 1]).toBeLessThan(0.2);
  });
});

describe("colorListSorts", () => {
  test("トップは色み順・明るい順、色みは色相順・明るい順、無彩色は明るい順だけ", () => {
    const labels = (scope: ColorListScope) =>
      colorListSorts(scope).map((sort) => sort.label);
    expect(labels({ type: "all" })).toEqual(["色み順", "明るい順"]);
    expect(labels({ type: "category", category: "red" })).toEqual([
      "色相順",
      "明るい順",
    ]);
    expect(labels({ type: "category", category: "achromatic" })).toEqual([
      "明るい順",
    ]);
  });
});

describe("colorListPageParams", () => {
  test("トップは3ページ、色みはどれも1ページ", () => {
    expect(colorListPageParams({ type: "all" })).toEqual([
      { page: "2" },
      { page: "3" },
    ]);
    for (const category of colorListCategories()) {
      expect(colorListPageParams({ type: "category", category })).toEqual([]);
    }
  });
});

describe("colorListMetadata", () => {
  test("2ページ目からは題にページを添え、自分を canonical にする", () => {
    expect(colorListMetadata({ type: "all" }, 1).title).toBe(
      "日本の伝統色 - 250色一覧 | yolos.net",
    );
    const second = colorListMetadata({ type: "all" }, 2);
    expect(second.alternates?.canonical).toBe(
      `${BASE_URL}/dictionary/colors/page/2`,
    );
  });
});

describe("colorIndexEntries", () => {
  test("7つの色みを赤系から無彩色までの順に並べ、数を添えない", () => {
    const entries = colorIndexEntries();
    expect(entries.map((entry) => entry.label)).toEqual([
      "赤系",
      "橙系",
      "黄系",
      "緑系",
      "青系",
      "紫系",
      "無彩色",
    ]);
    expect(entries.every((entry) => entry.count === undefined)).toBe(true);
  });
});
