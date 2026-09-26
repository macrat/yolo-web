import { describe, expect, test } from "vitest";
import { TOOL_CATEGORIES, toolCategoryLabel } from "@/tools/categories";
import { allToolMetas } from "@/tools/registry";
import { TOOL_KINDS, toolListItems } from "../tool-list";

describe("ツールの種別", () => {
  test("種別は文章・数値・データ・画像・色の5つで、この順が種別順である", () => {
    expect(TOOL_CATEGORIES.map((choice) => choice.label)).toEqual([
      "文章",
      "数値",
      "データ",
      "画像",
      "色",
    ]);
    expect(TOOL_KINDS).toEqual(
      TOOL_CATEGORIES.map(({ value, label }) => ({ value, label })),
    );
  });

  test("どの種別にもツールがあり、どのツールも5つの種別のどれかに入る", () => {
    const values = TOOL_CATEGORIES.map((choice) => choice.value);
    for (const tool of allToolMetas) {
      expect(values).toContain(tool.category);
    }
    for (const value of values) {
      expect(allToolMetas.some((tool) => tool.category === value)).toBe(true);
    }
  });
});

describe("toolListItems", () => {
  test("全ツールを、種別の語・公開日・説明を持つ項目にする", () => {
    const items = toolListItems();
    expect(items).toHaveLength(allToolMetas.length);
    for (const tool of allToolMetas) {
      const item = items.find((candidate) => candidate.slug === tool.slug);
      expect(item?.name).toBe(tool.name);
      expect(item?.description).toBe(tool.shortDescription);
      expect(item?.kind).toBe(toolCategoryLabel(tool.category));
      expect(item?.facts?.[0]?.dateTime).toBe(tool.publishedAt);
    }
  });
});
