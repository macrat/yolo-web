import { describe, test, expect } from "vitest";
import {
  browseItems,
  defaultBrowseState,
  type BrowseState,
} from "@/lib/list-browse";
import { hexToOklch } from "@/lib/hexToOklch";
import { PALETTE_ITEMS, PALETTE_SPEC, type PaletteItem } from "../palette-list";

function search(change: Partial<BrowseState>): PaletteItem[] {
  return browseItems(
    PALETTE_ITEMS,
    { ...defaultBrowseState(PALETTE_SPEC), ...change },
    PALETTE_SPEC,
  );
}

describe("色の格子の一覧", () => {
  test("全色を持ち、既定は色み順で、色みの並びの順に並ぶ", () => {
    expect(PALETTE_ITEMS).toHaveLength(250);
    expect(PALETTE_SPEC.sorts.map((sort) => sort.label)).toEqual([
      "色み順",
      "明るい順",
    ]);
    const kindOrder = PALETTE_SPEC.kinds.map((kind) => kind.label);
    const positions = PALETTE_ITEMS.map((item) =>
      kindOrder.indexOf(item.kind!),
    );
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("色名とローマ字で探せる", () => {
    expect(search({ query: "鴇" })[0].color.slug).toBe("toki");
    expect(search({ query: "TOKI" })[0].color.slug).toBe("toki");
    expect(search({ query: "存在しない色" })).toHaveLength(0);
  });

  test("色の系統で絞れる", () => {
    const red = search({ kind: "red" });
    expect(red.length).toBeGreaterThan(0);
    expect(red.every((item) => item.color.category === "red")).toBe(true);
  });

  test("明るい順は、OKLCH の明るさの大きい順に並ぶ", () => {
    const lightness = search({ sort: "light" }).map(
      (item) => hexToOklch(item.color.hex).l,
    );
    expect(lightness).toEqual([...lightness].sort((a, b) => b - a));
  });
});
