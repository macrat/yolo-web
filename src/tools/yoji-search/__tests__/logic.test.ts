import { describe, it, expect } from "vitest";
import {
  browseItems,
  defaultBrowseState,
  type BrowseState,
} from "@/lib/list-browse";
import {
  YOJI_COUNT,
  YOJI_SEARCH_ITEMS,
  YOJI_SEARCH_SPEC,
  type YojiSearchItem,
} from "../logic";

function search(change: Partial<BrowseState>): YojiSearchItem[] {
  return browseItems(
    YOJI_SEARCH_ITEMS,
    { ...defaultBrowseState(YOJI_SEARCH_SPEC), ...change },
    YOJI_SEARCH_SPEC,
  );
}

function names(items: YojiSearchItem[]): string[] {
  return items.map((item) => item.name);
}

describe("yoji-search の一覧", () => {
  it("全件を読みの五十音順で持つ", () => {
    expect(YOJI_SEARCH_ITEMS).toHaveLength(YOJI_COUNT);
    const readings = YOJI_SEARCH_ITEMS.map((item) => item.entry.reading);
    const collator = new Intl.Collator("ja");
    expect(readings).toEqual([...readings].sort(collator.compare));
  });

  it("語・読み（片仮名でも）・意味・例文で探せる", () => {
    expect(names(search({ query: "一期一会" }))[0]).toBe("一期一会");
    expect(names(search({ query: "イチゴイチエ" }))[0]).toBe("一期一会");
    const entry = YOJI_SEARCH_ITEMS.find(
      (item) => item.name === "一期一会",
    )!.entry;
    expect(names(search({ query: entry.meaning }))).toContain("一期一会");
    expect(names(search({ query: entry.example }))).toContain("一期一会");
    expect(search({ query: "zzzzznonexistent" })).toHaveLength(0);
  });

  it("語や読みが打った字と一致する行を、ほかの値で当たった行より前に並べる", () => {
    const results = search({ query: "いち" });
    const firstOther = results.findIndex(
      (item) =>
        !item.name.includes("いち") && !item.entry.reading.includes("いち"),
    );
    const lastByReading = results.findLastIndex((item) =>
      item.entry.reading.includes("いち"),
    );
    expect(firstOther === -1 || lastByReading < firstOther).toBe(true);
  });

  it("カテゴリ・難易度・出典で絞れる", () => {
    const life = search({ kind: "life" });
    expect(life.length).toBeGreaterThan(0);
    expect(life.every((item) => item.entry.category === "life")).toBe(true);

    const easyFromJapan = search({ filters: { level: "1", origin: "日本" } });
    expect(easyFromJapan.length).toBeGreaterThan(0);
    expect(
      easyFromJapan.every(
        (item) => item.entry.difficulty === 1 && item.entry.origin === "日本",
      ),
    ).toBe(true);
  });

  it("やさしい順は、初級・中級・上級の順に並べる", () => {
    const levels = search({ sort: "easy" }).map(
      (item) => item.entry.difficulty,
    );
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
  });
});
