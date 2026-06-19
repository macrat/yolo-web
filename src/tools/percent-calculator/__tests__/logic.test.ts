import { describe, test, expect } from "vitest";
import {
  percentOf,
  whatPercent,
  adjustByPercent,
  percentChange,
  formatResult,
} from "../logic";

describe("percentOf — XのY%はいくつ？", () => {
  test("2500の15%は375", () => {
    const result = percentOf(2500, 15);
    expect(result).not.toBeNull();
    expect(result!.value).toBe(375);
  });

  test("200の50%は100", () => {
    const result = percentOf(200, 50);
    expect(result!.value).toBe(100);
  });

  test("100の0%は0", () => {
    const result = percentOf(100, 0);
    expect(result!.value).toBe(0);
  });

  test("0のY%は0", () => {
    const result = percentOf(0, 50);
    expect(result!.value).toBe(0);
  });

  test("小数を扱える（33.33の10%）", () => {
    const result = percentOf(33.33, 10);
    expect(result!.value).toBe(3.333);
  });

  test("マイナスの値を扱える", () => {
    const result = percentOf(-100, 20);
    expect(result!.value).toBe(-20);
  });

  test("Infinityはnullを返す", () => {
    expect(percentOf(Infinity, 10)).toBeNull();
    expect(percentOf(100, Infinity)).toBeNull();
  });

  test("NaNはnullを返す", () => {
    expect(percentOf(NaN, 10)).toBeNull();
  });

  test("計算式の文字列が含まれる", () => {
    const result = percentOf(2500, 15);
    expect(result!.formula).toContain("2500");
    expect(result!.formula).toContain("15");
    expect(result!.formula).toContain("375");
  });
});

describe("whatPercent — AはBの何%？", () => {
  test("80は200の40%", () => {
    const result = whatPercent(80, 200);
    expect(result!.value).toBe(40);
  });

  test("100は100の100%", () => {
    const result = whatPercent(100, 100);
    expect(result!.value).toBe(100);
  });

  test("1は3の約33.3333%", () => {
    const result = whatPercent(1, 3);
    expect(result!.value).toBeCloseTo(33.3333, 3);
  });

  test("Bが0のときはnull（0除算）", () => {
    expect(whatPercent(50, 0)).toBeNull();
  });

  test("Aが0のときは0%", () => {
    const result = whatPercent(0, 100);
    expect(result!.value).toBe(0);
  });

  test("計算式に%が含まれる", () => {
    const result = whatPercent(80, 200);
    expect(result!.formula).toContain("%");
  });
});

describe("adjustByPercent — XをY%増減するといくつ？", () => {
  test("3000を20%減らすと2400", () => {
    const result = adjustByPercent(3000, 20, "decrease");
    expect(result!.value).toBe(2400);
  });

  test("1000を10%増やすと1100", () => {
    const result = adjustByPercent(1000, 10, "increase");
    expect(result!.value).toBe(1100);
  });

  test("500を0%増やすと500", () => {
    const result = adjustByPercent(500, 0, "increase");
    expect(result!.value).toBe(500);
  });

  test("100を100%減らすと0", () => {
    const result = adjustByPercent(100, 100, "decrease");
    expect(result!.value).toBe(0);
  });

  test("Xが0のときは結果も0", () => {
    const result = adjustByPercent(0, 50, "increase");
    expect(result!.value).toBe(0);
  });

  test("Infinityはnullを返す", () => {
    expect(adjustByPercent(Infinity, 10, "increase")).toBeNull();
  });

  test("increase の計算式に + が含まれる", () => {
    const result = adjustByPercent(1000, 10, "increase");
    expect(result!.formula).toContain("+");
  });

  test("decrease の計算式に - が含まれる", () => {
    const result = adjustByPercent(1000, 10, "decrease");
    expect(result!.formula).toContain("-");
  });
});

describe("percentChange — AからBへの変化率", () => {
  test("800から1000への変化は+25%", () => {
    const result = percentChange(800, 1000);
    expect(result!.value).toBe(25);
  });

  test("1000から800への変化は-20%", () => {
    const result = percentChange(1000, 800);
    expect(result!.value).toBe(-20);
  });

  test("100から100への変化は0%", () => {
    const result = percentChange(100, 100);
    expect(result!.value).toBe(0);
  });

  test("50から100への変化は+100%", () => {
    const result = percentChange(50, 100);
    expect(result!.value).toBe(100);
  });

  test("Aが0のときはnull（0除算）", () => {
    expect(percentChange(0, 100)).toBeNull();
  });

  test("負の変化率の計算式にマイナスが含まれる", () => {
    const result = percentChange(1000, 800);
    expect(result!.formula).toContain("-20");
  });

  test("正の変化率の計算式にプラスが含まれる", () => {
    const result = percentChange(800, 1000);
    expect(result!.formula).toContain("+25");
  });
});

describe("formatResult", () => {
  test("整数はそのまま表示", () => {
    expect(formatResult(375)).toBe("375");
  });

  test("小数点以下の末尾ゼロを除去", () => {
    expect(formatResult(3.3)).toBe("3.3");
  });

  test("0はそのまま表示", () => {
    expect(formatResult(0)).toBe("0");
  });
});
