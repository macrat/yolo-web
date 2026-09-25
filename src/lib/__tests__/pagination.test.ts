import { describe, test, expect } from "vitest";
import {
  paginate,
  generatePageNumbers,
  BLOG_POSTS_PER_PAGE,
  TOOLS_PER_PAGE,
} from "@/lib/pagination";

describe("pagination constants", () => {
  test("BLOG_POSTS_PER_PAGE is 12", () => {
    expect(BLOG_POSTS_PER_PAGE).toBe(12);
  });

  test("TOOLS_PER_PAGE is 24", () => {
    expect(TOOLS_PER_PAGE).toBe(24);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => `item-${i + 1}`);

  test("returns first page correctly", () => {
    const result = paginate(items, 1, 10);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.totalItems).toBe(25);
    expect(result.items).toHaveLength(10);
    expect(result.items[0]).toBe("item-1");
    expect(result.items[9]).toBe("item-10");
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPrevPage).toBe(false);
  });

  test("returns middle page correctly", () => {
    const result = paginate(items, 2, 10);
    expect(result.currentPage).toBe(2);
    expect(result.items).toHaveLength(10);
    expect(result.items[0]).toBe("item-11");
    expect(result.items[9]).toBe("item-20");
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPrevPage).toBe(true);
  });

  test("returns last page correctly with partial items", () => {
    const result = paginate(items, 3, 10);
    expect(result.currentPage).toBe(3);
    expect(result.items).toHaveLength(5);
    expect(result.items[0]).toBe("item-21");
    expect(result.items[4]).toBe("item-25");
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(true);
  });

  test("handles empty array", () => {
    const result = paginate([], 1, 10);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(0);
    expect(result.items).toHaveLength(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });

  test("handles single item", () => {
    const result = paginate(["only"], 1, 10);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(1);
    expect(result.items).toEqual(["only"]);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });

  test("handles items exactly filling one page", () => {
    const exactItems = Array.from({ length: 10 }, (_, i) => i);
    const result = paginate(exactItems, 1, 10);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(10);
    expect(result.hasNextPage).toBe(false);
  });

  test("clamps page number below 1 to 1", () => {
    const result = paginate(items, 0, 10);
    expect(result.currentPage).toBe(1);
    expect(result.items[0]).toBe("item-1");
  });

  test("clamps negative page number to 1", () => {
    const result = paginate(items, -5, 10);
    expect(result.currentPage).toBe(1);
  });

  test("clamps page number above totalPages to last page", () => {
    const result = paginate(items, 100, 10);
    expect(result.currentPage).toBe(3);
    expect(result.items[0]).toBe("item-21");
  });

  test("works with perPage of 1", () => {
    const smallItems = ["a", "b", "c"];
    const result = paginate(smallItems, 2, 1);
    expect(result.totalPages).toBe(3);
    expect(result.items).toEqual(["b"]);
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
