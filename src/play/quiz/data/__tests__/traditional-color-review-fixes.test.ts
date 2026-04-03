/**
 * Tests for review-requested fixes on traditional-color data.
 *
 * MUST-1: 山吹色 colorMeaning should not contain「戦国武将が好んだ色」
 * MUST-2: 紺色 colorMeaning should not contain「武士道の精神」or「江戸好み」
 *          and should contain correct historical info about 勝色
 * MUST-3: 春 season count must be 3 or fewer (山吹色 should be 秋)
 * SHOULD-1: colorAdvice should use first-person tone from the color's perspective
 *            (at least 6 out of 8 should contain 私 or わたし or be speaking as the color)
 * MAY: 藍色 scenery should not contain「暗青色」
 */
import { describe, it, expect } from "vitest";
import type { TraditionalColorDetailedContent } from "../../types";
import traditionalColorQuiz from "../traditional-color";

const allResults = traditionalColorQuiz.results;

function getResult(id: string) {
  const r = allResults.find((r) => r.id === id);
  if (!r) throw new Error(`Result not found: ${id}`);
  return r;
}

function getDC(id: string): TraditionalColorDetailedContent {
  return getResult(id).detailedContent as TraditionalColorDetailedContent;
}

describe("MUST-1: 山吹色 colorMeaning historical accuracy", () => {
  it("should not contain「戦国武将が好んだ色」(unsubstantiated claim)", () => {
    const dc = getDC("yamabuki");
    expect(dc.colorMeaning).not.toContain("戦国武将が好んだ色");
  });

  it("colorMeaning should be within 80-150 chars", () => {
    const dc = getDC("yamabuki");
    expect(dc.colorMeaning.length).toBeGreaterThanOrEqual(80);
    expect(dc.colorMeaning.length).toBeLessThanOrEqual(150);
  });
});

describe("MUST-2: 紺色 colorMeaning historical accuracy", () => {
  it("should not contain「武士道の精神」(inaccurate framing)", () => {
    const dc = getDC("kon");
    expect(dc.colorMeaning).not.toContain("武士道の精神");
  });

  it("should not contain「江戸好み」(non-established term)", () => {
    const dc = getDC("kon");
    expect(dc.colorMeaning).not.toContain("江戸好み");
  });

  it("colorMeaning should be within 80-150 chars", () => {
    const dc = getDC("kon");
    expect(dc.colorMeaning.length).toBeGreaterThanOrEqual(80);
    expect(dc.colorMeaning.length).toBeLessThanOrEqual(150);
  });
});

describe("MUST-3: Season distribution — spring count must be 3 or fewer", () => {
  it("spring (春) count is 3 or fewer", () => {
    const springCount = allResults.filter(
      (r) =>
        (r.detailedContent as TraditionalColorDetailedContent).season === "春",
    ).length;
    expect(
      springCount,
      `Too many spring results: ${springCount}. Must be 3 or fewer.`,
    ).toBeLessThanOrEqual(3);
  });

  it("山吹色 season should be 秋 (natural for golden-yellow color)", () => {
    const dc = getDC("yamabuki");
    expect(dc.season).toBe("秋");
  });
});

describe("SHOULD-1: colorAdvice should use first-person tone from the color", () => {
  /**
   * At least 6 out of 8 colorAdvice texts should speak in first person
   * (色が擬人化して語りかけるトーン), using 私 or similar first-person indicators.
   */
  it("at least 6 out of 8 colorAdvice texts use first-person perspective (私/わたし)", () => {
    const FIRST_PERSON_PATTERN = /私|わたし/;
    const firstPersonAdvices = allResults.filter((r) =>
      FIRST_PERSON_PATTERN.test(getDC(r.id).colorAdvice),
    );

    expect(
      firstPersonAdvices.length,
      `Only ${firstPersonAdvices.length}/8 colorAdvices use first-person tone. Need at least 6.`,
    ).toBeGreaterThanOrEqual(6);
  });
});

describe("山吹色 scenery: 秋の風景として植物学的に正確であること", () => {
  it("scenery should not contain「山吹」(ヤマブキは春の植物であり秋の描写には不適切)", () => {
    const dc = getDC("yamabuki");
    expect(dc.scenery).not.toContain("山吹");
  });

  it("scenery should not contain「実り」(ヤマブキの実を秋に結びつける不正確な表現)", () => {
    const dc = getDC("yamabuki");
    expect(dc.scenery).not.toContain("実り");
  });

  it("scenery should be within 20-50 chars", () => {
    const dc = getDC("yamabuki");
    expect(dc.scenery.length).toBeGreaterThanOrEqual(20);
    expect(dc.scenery.length).toBeLessThanOrEqual(50);
  });
});

describe("MAY: 藍色 scenery should not contain「暗青色」", () => {
  it("scenery should not use「暗青色」", () => {
    const dc = getDC("ai");
    expect(dc.scenery).not.toContain("暗青色");
  });

  it("scenery should be within 20-50 chars", () => {
    const dc = getDC("ai");
    expect(dc.scenery.length).toBeGreaterThanOrEqual(20);
    expect(dc.scenery.length).toBeLessThanOrEqual(50);
  });
});
