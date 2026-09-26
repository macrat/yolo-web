import { describe, expect, test } from "vitest";
import { BASE_URL } from "@/lib/constants";
import { getAllEntries } from "../../data";
import {
  HUMOR_LIST_SORTS,
  humorListItems,
  humorListMetadata,
  humorListPageParams,
} from "../humor-list";

describe("humorListItems", () => {
  test("全件を持ち、行は語と読み・語義の冒頭の一文を持つ", () => {
    const items = humorListItems();
    expect(items).toHaveLength(getAllEntries().length);
    const monday = items.find((item) => item.slug === "monday");
    expect(monday?.name).toBe("月曜日");
    expect(monday?.readings).toEqual(["げつようび"]);
    expect(monday?.description?.endsWith("。")).toBe(true);
  });

  test("並び順は五十音順だけ", () => {
    expect(HUMOR_LIST_SORTS.map((sort) => sort.label)).toEqual(["五十音順"]);
  });
});

describe("humorListPageParams・humorListMetadata", () => {
  test("いまは1ページで、1ページ目の題は辞典の名前", () => {
    expect(humorListPageParams()).toEqual([]);
    const metadata = humorListMetadata(1);
    expect(metadata.title).toBe("ユーモア辞典 | yolos.net");
    expect(metadata.alternates?.canonical).toBe(`${BASE_URL}/dictionary/humor`);
  });
});
