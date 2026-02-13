import { describe, test, expect } from "vitest";
import {
  parseHex,
  parseRgb,
  parseHsl,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  formatRgb,
  formatHsl,
} from "../logic";

describe("parseHex", () => {
  test("parses 6-digit hex", () => {
    const r = parseHex("#3498db");
    expect(r.success).toBe(true);
    expect(r.hex).toBe("#3498db");
    expect(r.rgb).toEqual({ r: 52, g: 152, b: 219 });
  });

  test("parses 3-digit hex shorthand", () => {
    const r = parseHex("#fff");
    expect(r.success).toBe(true);
    expect(r.hex).toBe("#ffffff");
    expect(r.rgb).toEqual({ r: 255, g: 255, b: 255 });
  });

  test("parses without # prefix", () => {
    const r = parseHex("000000");
    expect(r.success).toBe(true);
    expect(r.rgb).toEqual({ r: 0, g: 0, b: 0 });
  });

  test("returns error for invalid hex", () => {
    expect(parseHex("xyz").success).toBe(false);
  });
});

describe("parseRgb", () => {
  test("parses rgb(R, G, B) format", () => {
    const r = parseRgb("rgb(255, 0, 128)");
    expect(r.success).toBe(true);
    expect(r.rgb).toEqual({ r: 255, g: 0, b: 128 });
  });

  test("parses comma-separated format", () => {
    const r = parseRgb("52, 152, 219");
    expect(r.success).toBe(true);
    expect(r.rgb).toEqual({ r: 52, g: 152, b: 219 });
  });

  test("clamps values to 0-255", () => {
    const r = parseRgb("300, 0, 128");
    expect(r.success).toBe(true);
    expect(r.rgb?.r).toBe(255);
  });

  test("returns error for invalid format", () => {
    expect(parseRgb("not a color").success).toBe(false);
  });
});

describe("parseHsl", () => {
  test("parses hsl(H, S%, L%) format", () => {
    const r = parseHsl("hsl(210, 68%, 53%)");
    expect(r.success).toBe(true);
    expect(r.hsl).toEqual({ h: 210, s: 68, l: 53 });
  });

  test("parses without hsl() wrapper", () => {
    const r = parseHsl("0, 100, 50");
    expect(r.success).toBe(true);
    expect(r.hsl).toEqual({ h: 0, s: 100, l: 50 });
  });

  test("returns error for invalid format", () => {
    expect(parseHsl("invalid").success).toBe(false);
  });
});

describe("rgbToHex", () => {
  test("converts black", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
  });

  test("converts white", () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#ffffff");
  });
});

describe("rgbToHsl / hslToRgb roundtrip", () => {
  test("pure red roundtrip", () => {
    const rgb = { r: 255, g: 0, b: 0 };
    const hsl = rgbToHsl(rgb);
    expect(hsl).toEqual({ h: 0, s: 100, l: 50 });
    const back = hslToRgb(hsl);
    expect(back).toEqual(rgb);
  });

  test("gray roundtrip", () => {
    const rgb = { r: 128, g: 128, b: 128 };
    const hsl = rgbToHsl(rgb);
    expect(hsl.s).toBe(0);
    const back = hslToRgb(hsl);
    expect(back).toEqual(rgb);
  });
});

describe("formatRgb", () => {
  test("formats correctly", () => {
    expect(formatRgb({ r: 52, g: 152, b: 219 })).toBe("rgb(52, 152, 219)");
  });
});

describe("formatHsl", () => {
  test("formats correctly", () => {
    expect(formatHsl({ h: 210, s: 68, l: 53 })).toBe("hsl(210, 68%, 53%)");
  });
});
