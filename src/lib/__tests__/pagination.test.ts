import { describe, test, expect } from "vitest";
import { generatePageNumbers, TOOLS_PER_PAGE } from "@/lib/pagination";

describe("pagination constants", () => {
  test("TOOLS_PER_PAGE is 24", () => {
    expect(TOOLS_PER_PAGE).toBe(24);
  });
});

describe("generatePageNumbers", () => {
  test("returns all pages when totalPages <= 7", () => {
    expect(generatePageNumbers(1, 1)).toEqual([1]);
    expect(generatePageNumbers(1, 3)).toEqual([1, 2, 3]);
    expect(generatePageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(generatePageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("shows ellipsis at end when on first page with many pages", () => {
    const result = generatePageNumbers(1, 10);
    expect(result).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
  });

  test("shows ellipsis at start when on last page with many pages", () => {
    const result = generatePageNumbers(10, 10);
    expect(result).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });

  test("shows ellipsis on both sides when in the middle", () => {
    const result = generatePageNumbers(5, 10);
    expect(result).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  test("keeps the start window while the next page is inside it", () => {
    expect(generatePageNumbers(4, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
  });

  test("keeps the end window while the previous page is inside it", () => {
    expect(generatePageNumbers(7, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });

  test("works with totalPages of 8", () => {
    expect(generatePageNumbers(4, 8)).toEqual([1, 2, 3, 4, 5, "ellipsis", 8]);
    expect(generatePageNumbers(5, 8)).toEqual([1, "ellipsis", 4, 5, 6, 7, 8]);
  });

  test("always has 7 entries when not every page fits", () => {
    for (let total = 8; total <= 20; total++) {
      for (let current = 1; current <= total; current++) {
        expect(generatePageNumbers(current, total)).toHaveLength(7);
      }
    }
  });

  test("always includes the pages next to the current page", () => {
    for (let total = 1; total <= 20; total++) {
      for (let current = 1; current <= total; current++) {
        const result = generatePageNumbers(current, total);
        if (current > 1) expect(result).toContain(current - 1);
        if (current < total) expect(result).toContain(current + 1);
      }
    }
  });

  test("returns unique entries (no duplicate page numbers)", () => {
    // Test various positions to ensure no duplicates
    for (let total = 1; total <= 15; total++) {
      for (let current = 1; current <= total; current++) {
        const result = generatePageNumbers(current, total);
        const numbers = result.filter((x) => typeof x === "number");
        const uniqueNumbers = new Set(numbers);
        expect(uniqueNumbers.size).toBe(numbers.length);
      }
    }
  });

  test("always includes first and last page for large totals", () => {
    for (let current = 1; current <= 20; current++) {
      const result = generatePageNumbers(current, 20);
      const numbers = result.filter((x) => typeof x === "number") as number[];
      expect(numbers[0]).toBe(1);
      expect(numbers[numbers.length - 1]).toBe(20);
    }
  });

  test("always includes current page", () => {
    for (let total = 1; total <= 15; total++) {
      for (let current = 1; current <= total; current++) {
        const result = generatePageNumbers(current, total);
        expect(result).toContain(current);
      }
    }
  });
});
