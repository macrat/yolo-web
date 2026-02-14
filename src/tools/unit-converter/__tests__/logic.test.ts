import { describe, test, expect } from "vitest";
import { convert, getAllCategories } from "../logic";

describe("convert (length)", () => {
  test("m -> km", () => {
    expect(convert(1000, "meter", "kilometer", "length")).toBeCloseTo(1);
  });

  test("inch -> cm", () => {
    expect(convert(1, "inch", "centimeter", "length")).toBeCloseTo(2.54);
  });

  test("mile -> km", () => {
    expect(convert(1, "mile", "kilometer", "length")).toBeCloseTo(1.60934, 4);
  });

  test("shaku -> m", () => {
    expect(convert(1, "shaku", "meter", "length")).toBeCloseTo(10 / 33, 5);
  });
});

describe("convert (weight)", () => {
  test("kg -> lb", () => {
    expect(convert(1, "kilogram", "pound", "weight")).toBeCloseTo(2.20462, 4);
  });

  test("oz -> g", () => {
    expect(convert(1, "ounce", "gram", "weight")).toBeCloseTo(28.3495, 3);
  });
});

describe("convert (temperature)", () => {
  test("0 C -> 32 F", () => {
    expect(convert(0, "celsius", "fahrenheit", "temperature")).toBeCloseTo(32);
  });

  test("100 C -> 212 F", () => {
    expect(convert(100, "celsius", "fahrenheit", "temperature")).toBeCloseTo(
      212,
    );
  });

  test("32 F -> 0 C", () => {
    expect(convert(32, "fahrenheit", "celsius", "temperature")).toBeCloseTo(0);
  });

  test("0 C -> 273.15 K", () => {
    expect(convert(0, "celsius", "kelvin", "temperature")).toBeCloseTo(273.15);
  });
});

describe("convert (area)", () => {
  test("tsubo -> sqmeter", () => {
    expect(convert(1, "tsubo", "sqmeter", "area")).toBeCloseTo(400 / 121, 4);
  });

  test("ha -> sqmeter", () => {
    expect(convert(1, "hectare", "sqmeter", "area")).toBeCloseTo(10000);
  });
});

describe("convert (speed)", () => {
  test("km/h -> m/s", () => {
    expect(convert(3.6, "kmph", "mps", "speed")).toBeCloseTo(1);
  });

  test("mph -> km/h", () => {
    expect(convert(1, "mph", "kmph", "speed")).toBeCloseTo(1.60934, 4);
  });
});

describe("convert (edge cases)", () => {
  test("zero input returns zero", () => {
    expect(convert(0, "meter", "kilometer", "length")).toBe(0);
  });

  test("negative values convert correctly", () => {
    expect(convert(-40, "celsius", "fahrenheit", "temperature")).toBeCloseTo(
      -40,
    );
  });
});

describe("getAllCategories", () => {
  test("returns 5 categories", () => {
    expect(getAllCategories()).toHaveLength(5);
  });

  test("each category has units", () => {
    for (const cat of getAllCategories()) {
      expect(cat.units.length).toBeGreaterThan(0);
    }
  });
});
