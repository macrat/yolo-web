import { describe, expect, test } from "vitest";
import kanjiData from "@/data/kanji-data.json";
import {
  canSetInZenAntique,
  charsMissingFromZenAntique,
} from "@/lib/zen-antique-charset";

describe("canSetInZenAntique", () => {
  test("Zen Antique が持つ和文は組める", () => {
    expect(canSetInZenAntique("漢字の辞典——読みと意味……")).toBe(true);
  });

  test("U+0000-007F は Plex が組むので、和文と混ざっても組める", () => {
    expect(canSetInZenAntique("SQL チートシート 2026")).toBe(true);
  });

  test("Zen Antique に無い字を含むと組めない", () => {
    expect(canSetInZenAntique("𠮟る")).toBe(false);
    expect(charsMissingFromZenAntique("𠮟る𠮟")).toEqual(["𠮟"]);
  });
});

describe("漢字辞典の見出しの字", () => {
  const missing = charsMissingFromZenAntique(
    kanjiData.map((entry) => entry.character).join(""),
  );

  test("Zen Antique に無い字を見つける", () => {
    expect(missing).toContain("𠮟");
  });

  // 表か辞典のデータが変わったら、見出しの組み方を見直すために差分を確かめる。
  test("Zen Antique に無い字の一覧", () => {
    expect(missing).toMatchInlineSnapshot(`
      [
        "𠮟",
        "剝",
        "塡",
        "頰",
      ]
    `);
  });
});
