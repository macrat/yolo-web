import { describe, expect, test } from "vitest";
import {
  ciede2000,
  colorDifference,
  calculateRoundScore,
  calculateTotalScore,
  getRank,
  getRankLabel,
  getScoreEmoji,
} from "../engine";

describe("ciede2000", () => {
  test("identical colors have deltaE of 0", () => {
    expect(ciede2000(50, 25, 10, 50, 25, 10)).toBeCloseTo(0, 5);
  });

  test("very similar colors have small deltaE", () => {
    const dE = ciede2000(50, 25, 10, 50, 25.5, 10.5);
    expect(dE).toBeLessThan(1);
  });

  test("very different colors have large deltaE", () => {
    // Black vs white
    const dE = ciede2000(0, 0, 0, 100, 0, 0);
    expect(dE).toBeGreaterThan(50);
  });

  test("reference pair 1 from Sharma et al. 2005", () => {
    // Test pair from the supplementary data
    // L1=50.0000, a1=2.6772, b1=-79.7751
    // L2=50.0000, a2=0.0000, b2=-82.7485
    const dE = ciede2000(50.0, 2.6772, -79.7751, 50.0, 0.0, -82.7485);
    expect(dE).toBeCloseTo(2.0425, 3);
  });

  test("reference pair from Sharma - different lightness", () => {
    // L1=50.0000, a1=0.0000, b1=0.0000
    // L2=73.0000, a2=25.0000, b2=-18.0000
    const dE = ciede2000(50.0, 0.0, 0.0, 73.0, 25.0, -18.0);
    expect(dE).toBeGreaterThan(20);
  });
});

describe("colorDifference", () => {
  test("identical HSL colors have zero difference", () => {
    const dE = colorDifference(180, 50, 50, 180, 50, 50);
    expect(dE).toBeCloseTo(0, 3);
  });

  test("slightly different HSL colors have small difference", () => {
    const dE = colorDifference(180, 50, 50, 182, 51, 50);
    expect(dE).toBeLessThan(5);
  });

  test("very different HSL colors have large difference", () => {
    const dE = colorDifference(0, 100, 50, 180, 100, 50);
    expect(dE).toBeGreaterThan(30);
  });
});

describe("calculateRoundScore", () => {
  test("perfect match gives 100", () => {
    expect(calculateRoundScore(0)).toBe(100);
  });

  test("deltaE of 25 gives 50", () => {
    expect(calculateRoundScore(25)).toBe(50);
  });

  test("deltaE of 50 gives 0", () => {
    expect(calculateRoundScore(50)).toBe(0);
  });

  test("deltaE greater than 50 is capped at 0", () => {
    expect(calculateRoundScore(100)).toBe(0);
  });
});

describe("calculateTotalScore", () => {
  test("averages scores", () => {
    expect(calculateTotalScore([100, 80, 60, 40, 20])).toBe(60);
  });

  test("returns 0 for empty array", () => {
    expect(calculateTotalScore([])).toBe(0);
  });
});

describe("getRank", () => {
  test("returns S for 95+", () => {
    expect(getRank(95)).toBe("S");
    expect(getRank(100)).toBe("S");
  });

  test("returns A for 85-94", () => {
    expect(getRank(85)).toBe("A");
    expect(getRank(94)).toBe("A");
  });

  test("returns B for 70-84", () => {
    expect(getRank(70)).toBe("B");
    expect(getRank(84)).toBe("B");
  });

  test("returns C for 50-69", () => {
    expect(getRank(50)).toBe("C");
    expect(getRank(69)).toBe("C");
  });

  test("returns D for below 50", () => {
    expect(getRank(0)).toBe("D");
    expect(getRank(49)).toBe("D");
  });
});

describe("getRankLabel", () => {
  test("returns Japanese label for each rank", () => {
    expect(getRankLabel("S")).toContain("\u9054\u4EBA");
    expect(getRankLabel("D")).toContain("\u7DF4\u7FD2");
  });
});

describe("getScoreEmoji", () => {
  test("returns emoji for each score range", () => {
    expect(getScoreEmoji(95)).toBe("\uD83D\uDFE9");
    expect(getScoreEmoji(50)).toBe("\uD83D\uDFE7");
    expect(getScoreEmoji(10)).toBe("\uD83D\uDFE5");
  });
});
