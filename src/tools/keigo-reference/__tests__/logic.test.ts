import { describe, test, expect } from "vitest";
import {
  browseItems,
  defaultBrowseState,
  type BrowseState,
} from "@/lib/list-browse";
import {
  getAllEntries,
  getKeigoCategories,
  getEntriesByCategory,
  getCommonMistakes,
  getMistakesByType,
  KEIGO_LIST_ITEMS,
  KEIGO_LIST_SPEC,
  type KeigoListItem,
} from "../logic";

function search(change: Partial<BrowseState>): KeigoListItem[] {
  return browseItems(
    KEIGO_LIST_ITEMS,
    { ...defaultBrowseState(KEIGO_LIST_SPEC), ...change },
    KEIGO_LIST_SPEC,
  );
}

function casuals(items: KeigoListItem[]): string[] {
  return items.map((item) => item.entry.casual);
}

describe("getAllEntries", () => {
  test("returns 50 or more entries", () => {
    expect(getAllEntries().length).toBeGreaterThanOrEqual(50);
  });

  test("each entry has required fields", () => {
    for (const entry of getAllEntries()) {
      expect(entry.id).toBeTruthy();
      expect(entry.casual).toBeTruthy();
      expect(entry.sonkeigo).toBeTruthy();
      expect(entry.kenjogo).toBeTruthy();
      expect(entry.teineigo).toBeTruthy();
      expect(entry.category).toBeTruthy();
    }
  });

  test("each entry has at least one example", () => {
    for (const entry of getAllEntries()) {
      expect(entry.examples.length).toBeGreaterThanOrEqual(1);
    }
  });

  test("all entry IDs are unique", () => {
    const ids = getAllEntries().map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getKeigoCategories", () => {
  test("returns 3 categories", () => {
    expect(getKeigoCategories()).toHaveLength(3);
  });

  test("includes basic, business, service", () => {
    const ids = getKeigoCategories().map((c) => c.id);
    expect(ids).toContain("basic");
    expect(ids).toContain("business");
    expect(ids).toContain("service");
  });
});

describe("getEntriesByCategory", () => {
  test("returns entries for each category", () => {
    expect(getEntriesByCategory("basic").length).toBeGreaterThan(0);
    expect(getEntriesByCategory("business").length).toBeGreaterThan(0);
    expect(getEntriesByCategory("service").length).toBeGreaterThan(0);
  });

  test("all entries belong to the specified category", () => {
    for (const entry of getEntriesByCategory("basic")) {
      expect(entry.category).toBe("basic");
    }
    for (const entry of getEntriesByCategory("business")) {
      expect(entry.category).toBe("business");
    }
    for (const entry of getEntriesByCategory("service")) {
      expect(entry.category).toBe("service");
    }
  });
});

describe("早見表の一覧", () => {
  test("普通語と、尊敬語・謙譲語・丁寧語で探せる", () => {
    expect(casuals(search({ query: "言う" }))[0]).toBe("言う");
    expect(casuals(search({ query: "おっしゃる" }))).toContain("言う");
    expect(casuals(search({ query: "申す" }))).toContain("言う");
    expect(casuals(search({ query: "行きます" }))).toContain("行く");
    expect(search({ query: "XXXXXX" })).toHaveLength(0);
  });

  test("普通語で当たった行を、敬語の形で当たった行より前に並べる", () => {
    const results = search({ query: "言" });
    const firstByForm = results.findIndex(
      (item) => !item.entry.casual.includes("言"),
    );
    const lastByCasual = results.findLastIndex((item) =>
      item.entry.casual.includes("言"),
    );
    expect(firstByForm === -1 || lastByCasual < firstByForm).toBe(true);
  });

  test("分類で絞れる", () => {
    const business = search({ kind: "business" });
    expect(business.length).toBeGreaterThan(0);
    expect(business.every((item) => item.entry.category === "business")).toBe(
      true,
    );
  });

  test("並び順は分類順だけで、分類の中はデータの順のまま", () => {
    expect(KEIGO_LIST_SPEC.sorts.map((sort) => sort.label)).toEqual(["分類順"]);
    const order = getKeigoCategories().map((category) => category.id);
    const expected = order.flatMap((category) =>
      getEntriesByCategory(category).map((entry) => entry.id),
    );
    expect(search({}).map((item) => item.entry.id)).toEqual(expected);
  });

  test("行の種別は分類の名前", () => {
    const names = getKeigoCategories().map((category) => category.name);
    expect(KEIGO_LIST_ITEMS.every((item) => names.includes(item.kind!))).toBe(
      true,
    );
  });
});

describe("getCommonMistakes", () => {
  test("returns 10 or more mistakes", () => {
    expect(getCommonMistakes().length).toBeGreaterThanOrEqual(10);
  });

  test("each mistake has required fields", () => {
    for (const mistake of getCommonMistakes()) {
      expect(mistake.id).toBeTruthy();
      expect(mistake.wrong).toBeTruthy();
      expect(mistake.correct).toBeTruthy();
      expect(mistake.explanation).toBeTruthy();
      expect(mistake.mistakeType).toBeTruthy();
    }
  });

  test("all mistake IDs are unique", () => {
    const ids = getCommonMistakes().map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("getMistakesByType", () => {
  test("returns mistakes for each type", () => {
    expect(getMistakesByType("double-keigo").length).toBeGreaterThan(0);
    expect(getMistakesByType("wrong-direction").length).toBeGreaterThan(0);
    expect(getMistakesByType("baito-keigo").length).toBeGreaterThan(0);
  });

  test("all mistakes belong to the specified type", () => {
    for (const mistake of getMistakesByType("double-keigo")) {
      expect(mistake.mistakeType).toBe("double-keigo");
    }
    for (const mistake of getMistakesByType("wrong-direction")) {
      expect(mistake.mistakeType).toBe("wrong-direction");
    }
    for (const mistake of getMistakesByType("baito-keigo")) {
      expect(mistake.mistakeType).toBe("baito-keigo");
    }
  });
});
