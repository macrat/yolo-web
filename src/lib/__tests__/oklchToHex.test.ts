import { describe, expect, test } from "vitest";
import { oklchToHex, parseOklch } from "../oklchToHex";

describe("oklchToHex", () => {
  test("無彩の L を sRGB の灰に変える", () => {
    expect(oklchToHex(0, 0, 0)).toBe("#000000");
    expect(oklchToHex(1, 0, 0)).toBe("#ffffff");
    expect(oklchToHex(0.99, 0, 0)).toBe("#fcfcfc");
  });
});

describe("parseOklch", () => {
  test("L C H を取り出す", () => {
    expect(parseOklch("oklch(0.5 0.17 18)")).toEqual({
      l: 0.5,
      c: 0.17,
      h: 18,
    });
  });
  test("alpha 付きは先頭3値だけ取る", () => {
    expect(parseOklch("oklch(0.51 0.16 32 / 0.12)")).toEqual({
      l: 0.51,
      c: 0.16,
      h: 32,
    });
  });
  test("非 oklch は null", () => {
    expect(parseOklch("#ffffff")).toBeNull();
  });
});
