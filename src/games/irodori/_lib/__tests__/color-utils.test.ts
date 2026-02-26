import { describe, expect, test } from "vitest";
import {
  hslToRgb,
  rgbToHex,
  hslToHex,
  rgbToLab,
  hslToLab,
} from "../color-utils";

describe("hslToRgb", () => {
  test("pure red (h=0, s=100, l=50)", () => {
    const [r, g, b] = hslToRgb(0, 100, 50);
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  test("pure green (h=120, s=100, l=50)", () => {
    const [r, g, b] = hslToRgb(120, 100, 50);
    expect(r).toBe(0);
    expect(g).toBe(255);
    expect(b).toBe(0);
  });

  test("pure blue (h=240, s=100, l=50)", () => {
    const [r, g, b] = hslToRgb(240, 100, 50);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(255);
  });

  test("white (h=0, s=0, l=100)", () => {
    const [r, g, b] = hslToRgb(0, 0, 100);
    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
  });

  test("black (h=0, s=0, l=0)", () => {
    const [r, g, b] = hslToRgb(0, 0, 0);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  test("gray (h=0, s=0, l=50)", () => {
    const [r, g, b] = hslToRgb(0, 0, 50);
    expect(r).toBe(128);
    expect(g).toBe(128);
    expect(b).toBe(128);
  });
});

describe("rgbToHex", () => {
  test("converts RGB to hex", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
    expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });
});

describe("hslToHex", () => {
  test("converts HSL to hex", () => {
    expect(hslToHex(0, 100, 50)).toBe("#ff0000");
    expect(hslToHex(120, 100, 50)).toBe("#00ff00");
    expect(hslToHex(240, 100, 50)).toBe("#0000ff");
  });
});

describe("rgbToLab", () => {
  test("white has L close to 100", () => {
    const [L] = rgbToLab(255, 255, 255);
    expect(L).toBeCloseTo(100, 0);
  });

  test("black has L close to 0", () => {
    const [L] = rgbToLab(0, 0, 0);
    expect(L).toBeCloseTo(0, 0);
  });

  test("gray has a and b close to 0", () => {
    const [, a, b] = rgbToLab(128, 128, 128);
    expect(Math.abs(a)).toBeLessThan(1);
    expect(Math.abs(b)).toBeLessThan(1);
  });
});

describe("hslToLab", () => {
  test("converts HSL to Lab consistently", () => {
    const [L, a, b] = hslToLab(0, 100, 50);
    // Red should have positive a* (toward red)
    expect(a).toBeGreaterThan(0);
    expect(L).toBeGreaterThan(40);
    expect(L).toBeLessThan(60);
    // b* for pure red is typically positive
    expect(b).toBeGreaterThan(0);
  });
});
