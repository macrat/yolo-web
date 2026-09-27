import { describe, test, expect } from "vitest";
import yojiData from "@/data/yoji-data.json";
import { charsMissingFromZenAntique } from "@/lib/zen-antique-charset";

/**
 * 解き終えた画面は、答えの四字熟語を結果の見出しとして見出しの書体（Zen Antique）で組む。答えの字はブラウザで
 * 字の表を引かずに組むので、出題するどの四字熟語の字も Zen Antique にあることを、ここで確かめる（DESIGN.md §3）。
 */
describe("answer yoji characters", () => {
  test("every character of every yoji is in Zen Antique", () => {
    const missing = yojiData.flatMap(({ yoji }) =>
      charsMissingFromZenAntique(yoji).map((char) => `${yoji}: ${char}`),
    );
    expect(missing).toEqual([]);
  });
});
