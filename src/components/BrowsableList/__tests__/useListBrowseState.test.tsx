import { afterEach, describe, expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useListBrowseState } from "@/components/BrowsableList/useListBrowseState";
import type { BrowseItem, BrowseSpec } from "@/lib/list-browse";

const PATH = "/tools/sample";

const SPEC: BrowseSpec = {
  kinds: [
    { value: "a", label: "甲" },
    { value: "b", label: "乙" },
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
  sorts: [
    { value: "given", label: "渡した順", keys: [] },
    {
      value: "name",
      label: "名前の逆順",
      keys: [{ by: "reading", desc: true }],
    },
  ],
};

const ITEMS: BrowseItem[] = Array.from({ length: 30 }, (_, index) => ({
  name: `語${String(index + 1).padStart(2, "0")}`,
  readings: [`ご${index + 1}`],
  kind: index % 2 === 0 ? "甲" : "乙",
  filterValues: { level: index < 10 ? "1" : "2" },
}));

function visit(search: string) {
  window.history.replaceState(null, "", `${PATH}${search}`);
}

function renderBrowse() {
  return renderHook(() =>
    useListBrowseState({ items: ITEMS, spec: SPEC, unit: "語", perPage: 10 }),
  );
}

afterEach(() => {
  visit("");
});

describe("useListBrowseState（パスにページを持たない一覧）", () => {
  test("既定の状態でも、ページはいまのパスのクエリに書く", () => {
    visit("");
    const { result } = renderBrowse();
    act(() => result.current.setPage(2));
    expect(window.location.pathname).toBe(PATH);
    expect(window.location.search).toBe("?page=2");
    expect(result.current.slice.page).toBe(2);
    expect(result.current.pageLinks).toBe(false);
  });

  test("道具ごとの組をクエリに書き、「絞り込みを外す」で組も外して並び順を残す", () => {
    visit("?sort=name");
    const { result } = renderBrowse();
    act(() => result.current.setFilter("level", "1"));
    act(() => result.current.setKind("a"));
    expect(window.location.search).toBe("?kind=a&level=1&sort=name");
    expect(result.current.matched).toBe(5);
    act(() => result.current.clear());
    expect(window.location.search).toBe("?sort=name");
    expect(result.current.matched).toBe(30);
  });
});
