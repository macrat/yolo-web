import { describe, expect, test } from "vitest";
import {
  listPageCount,
  listPageFromParam,
  listPageFromPath,
  listPageHref,
  listPageStaticParams,
  listPageTitle,
  parseListPage,
} from "@/lib/list-pages";

// 1ページの件数×2＋1件は3ページになる。
const PER_PAGE = 50;
const TOTAL = PER_PAGE * 2 + 1;

describe("listPageStaticParams", () => {
  test("2ページ目から最後のページまでを返す", () => {
    expect(listPageStaticParams(TOTAL, PER_PAGE)).toEqual([
      { page: "2" },
      { page: "3" },
    ]);
  });

  test("1ページに収まる一覧は何も返さない", () => {
    expect(listPageStaticParams(PER_PAGE, PER_PAGE)).toEqual([]);
    expect(listPageStaticParams(0, PER_PAGE)).toEqual([]);
  });
});

describe("listPageCount", () => {
  test("項目が無くても1ページ", () => {
    expect(listPageCount(0, PER_PAGE)).toBe(1);
    expect(listPageCount(TOTAL, PER_PAGE)).toBe(3);
  });
});

describe("parseListPage・listPageFromParam", () => {
  test("2ページ目と3ページ目は番号になる", () => {
    expect(parseListPage("2", TOTAL, PER_PAGE)).toBe(2);
    expect(listPageFromParam("3", TOTAL, PER_PAGE)).toBe(3);
  });

  test.each(["4", "1", "0", "abc", "02", "-2", "2.0", ""])(
    "「%s」は範囲の外として 404 にする",
    (param) => {
      expect(parseListPage(param, TOTAL, PER_PAGE)).toBeNull();
      expect(() => listPageFromParam(param, TOTAL, PER_PAGE)).toThrow(
        "NEXT_HTTP_ERROR_FALLBACK;404",
      );
    },
  );
});

describe("listPageHref", () => {
  test("1ページ目は元のパス、ほかは /page/n", () => {
    expect(listPageHref("/blog", 1)).toBe("/blog");
    expect(listPageHref("/blog", 2)).toBe("/blog/page/2");
  });
});

describe("listPageFromPath", () => {
  test("元のパスは1、/page/n は n", () => {
    expect(listPageFromPath("/blog", "/blog")).toBe(1);
    expect(listPageFromPath("/blog/", "/blog")).toBe(1);
    expect(listPageFromPath("/blog/page/3", "/blog")).toBe(3);
  });

  test("百分率符号化されたパスも同じパスとして読む", () => {
    expect(
      listPageFromPath(
        "/blog/tag/Web%E9%96%8B%E7%99%BA/page/2",
        "/blog/tag/Web開発",
      ),
    ).toBe(2);
  });

  test("ほかのパスと /page/1・/page/0 は null", () => {
    expect(listPageFromPath("/blog/some-post", "/blog")).toBeNull();
    expect(listPageFromPath("/blog/page/1", "/blog")).toBeNull();
    expect(listPageFromPath("/blog/page/0", "/blog")).toBeNull();
    expect(listPageFromPath("/tools", "/blog")).toBeNull();
  });
});

describe("listPageTitle", () => {
  test("2ページ目からはページの番号を添える", () => {
    expect(listPageTitle("ツール", 1)).toBe("ツール | yolos.net");
    expect(listPageTitle("ツール", 2)).toBe("ツール（2ページ目） | yolos.net");
  });
});
