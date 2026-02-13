import { describe, test, expect } from "vitest";
import { convertBase, formatBinary, formatHex } from "../logic";

describe("convertBase", () => {
  test("converts decimal 255 to all bases", () => {
    const r = convertBase("255", 10);
    expect(r.success).toBe(true);
    expect(r.binary).toBe("11111111");
    expect(r.octal).toBe("377");
    expect(r.decimal).toBe("255");
    expect(r.hexadecimal).toBe("ff");
  });

  test("converts binary 1010 to all bases", () => {
    const r = convertBase("1010", 2);
    expect(r.success).toBe(true);
    expect(r.decimal).toBe("10");
    expect(r.hexadecimal).toBe("a");
    expect(r.octal).toBe("12");
  });

  test("converts hex ff to all bases", () => {
    const r = convertBase("ff", 16);
    expect(r.success).toBe(true);
    expect(r.decimal).toBe("255");
    expect(r.binary).toBe("11111111");
  });

  test("converts octal 77 to all bases", () => {
    const r = convertBase("77", 8);
    expect(r.success).toBe(true);
    expect(r.decimal).toBe("63");
  });

  test("handles zero", () => {
    const r = convertBase("0", 10);
    expect(r.success).toBe(true);
    expect(r.binary).toBe("0");
    expect(r.octal).toBe("0");
    expect(r.decimal).toBe("0");
    expect(r.hexadecimal).toBe("0");
  });

  test("handles negative numbers", () => {
    const r = convertBase("-10", 10);
    expect(r.success).toBe(true);
    expect(r.binary).toBe("-1010");
    expect(r.hexadecimal).toBe("-a");
  });

  test("handles large numbers (BigInt)", () => {
    const r = convertBase("18446744073709551615", 10);
    expect(r.success).toBe(true);
    expect(r.hexadecimal).toBe("ffffffffffffffff");
    expect(r.binary).toBe(
      "1111111111111111111111111111111111111111111111111111111111111111",
    );
  });

  test("returns error for invalid binary input", () => {
    const r = convertBase("123", 2);
    expect(r.success).toBe(false);
    expect(r.error).toBeDefined();
  });

  test("returns error for invalid hex input", () => {
    const r = convertBase("xyz", 16);
    expect(r.success).toBe(false);
  });

  test("returns error for invalid octal input", () => {
    const r = convertBase("89", 8);
    expect(r.success).toBe(false);
  });

  test("handles empty input", () => {
    const r = convertBase("", 10);
    expect(r.success).toBe(true);
    expect(r.binary).toBe("");
  });

  test("handles case insensitive hex", () => {
    const r = convertBase("FF", 16);
    expect(r.success).toBe(true);
    expect(r.decimal).toBe("255");
  });
});

describe("formatBinary", () => {
  test("formats with spaces every 4 digits", () => {
    expect(formatBinary("11111111")).toBe("1111 1111");
  });

  test("pads to multiple of 4", () => {
    expect(formatBinary("1010")).toBe("1010");
  });

  test("handles zero", () => {
    expect(formatBinary("0")).toBe("0");
  });

  test("handles empty", () => {
    expect(formatBinary("")).toBe("");
  });

  test("handles negative", () => {
    expect(formatBinary("-1010")).toBe("-1010");
  });
});

describe("formatHex", () => {
  test("formats with spaces every 2 digits", () => {
    expect(formatHex("aabbcc")).toBe("aa bb cc");
  });

  test("pads odd-length", () => {
    expect(formatHex("abc")).toBe("0a bc");
  });

  test("handles zero", () => {
    expect(formatHex("0")).toBe("0");
  });
});
