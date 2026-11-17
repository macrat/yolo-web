import { describe, expect, test } from "vitest";
import {
  forwardedListPageHref,
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

// 1ページ 20 件の区切りでは、同じ件数が6ページになる。4〜6ページ目が、いまのページへ送る番号。
const FORWARDING = { basePath: "/list", perPage: 20 };

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

  test("送る番号を持つ一覧は、最後のページの後ろに、送る区切りの最後の番号までを続ける", () => {
    expect(
      listPageStaticParams(TOTAL, PER_PAGE, FORWARDING).map(({ page }) => page),
    ).toEqual(["2", "3", "4", "5", "6"]);
    expect(listPageStaticParams(PER_PAGE, PER_PAGE, FORWARDING)).toEqual([
      { page: "2" },
      { page: "3" },
    ]);
  });

  test("送る区切りでも1ページに収まる一覧は何も返さない", () => {
    expect(
      listPageStaticParams(FORWARDING.perPage, PER_PAGE, FORWARDING),
    ).toEqual([]);
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

describe("送る番号", () => {
  test("ページの項目が載っている、いまのページの URL へ送る", () => {
    // 20 件区切りの2ページ目は 21〜40 件目、4ページ目は 61〜80 件目、6ページ目は 101 件目だけ。
    expect(forwardedListPageHref(2, TOTAL, PER_PAGE, FORWARDING)).toBe("/list");
    expect(forwardedListPageHref(4, TOTAL, PER_PAGE, FORWARDING)).toBe(
      "/list/page/2",
    );
    expect(forwardedListPageHref(6, TOTAL, PER_PAGE, FORWARDING)).toBe(
      "/list/page/3",
    );
  });

  test("項目がいまの2つのページにまたがるときは、多くが載っているほうへ送る", () => {
    // 20 件区切りの3ページ目（41〜60 件目）は、いまの1ページ目と2ページ目に 10 件ずつ載る。同じ数なら前のページ。
    expect(forwardedListPageHref(3, TOTAL, PER_PAGE, FORWARDING)).toBe("/list");
    // 12 件区切りの5ページ目（49〜60 件目）は、いまの1ページ目に 2 件、2ページ目に 10 件載る。
    expect(
      forwardedListPageHref(5, TOTAL, PER_PAGE, {
        basePath: "/list",
        perPage: 12,
      }),
    ).toBe("/list/page/2");
    // 30 件区切りの2ページ目（31〜60 件目）は、いまの1ページ目に 20 件、2ページ目に 10 件載る。
    expect(
      forwardedListPageHref(2, TOTAL, PER_PAGE, {
        basePath: "/list",
        perPage: 30,
      }),
    ).toBe("/list");
  });

  test.each([
    ["4", "/list/page/2"],
    ["6", "/list/page/3"],
  ])(
    "最後のページより後ろの「%s」は %s へ 308 で送る",
    (param, destination) => {
      expect(() =>
        listPageFromParam(param, TOTAL, PER_PAGE, FORWARDING),
      ).toThrow(
        expect.objectContaining({
          digest: `NEXT_REDIRECT;replace;${destination};308;`,
        }),
      );
    },
  );

  test("いまもあるページは送らずに番号を返す", () => {
    expect(listPageFromParam("2", TOTAL, PER_PAGE, FORWARDING)).toBe(2);
    expect(listPageFromParam("3", TOTAL, PER_PAGE, FORWARDING)).toBe(3);
  });

  test.each(["7", "99999", "1", "0", "abc", "04", "-4", "4.0", ""])(
    "送る区切りにも無い「%s」は 404 にする",
    (param) => {
      expect(() =>
        listPageFromParam(param, TOTAL, PER_PAGE, FORWARDING),
      ).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
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
