import { describe, test, expect } from "vitest";
import { replaceText } from "../logic";

describe("replaceText - plain text", () => {
  test("replaces all occurrences", () => {
    const r = replaceText("foo bar foo", "foo", "baz");
    expect(r.success).toBe(true);
    expect(r.output).toBe("baz bar baz");
    expect(r.count).toBe(2);
  });

  test("replaces first occurrence only when globalReplace=false", () => {
    const r = replaceText("foo bar foo", "foo", "baz", {
      useRegex: false,
      caseSensitive: true,
      globalReplace: false,
    });
    expect(r.output).toBe("baz bar foo");
    expect(r.count).toBe(1);
  });

  test("case insensitive replace", () => {
    const r = replaceText("Hello HELLO hello", "hello", "hi", {
      useRegex: false,
      caseSensitive: false,
      globalReplace: true,
    });
    expect(r.output).toBe("hi hi hi");
    expect(r.count).toBe(3);
  });

  test("returns unchanged when search not found", () => {
    const r = replaceText("abc", "xyz", "123");
    expect(r.output).toBe("abc");
    expect(r.count).toBe(0);
  });

  test("handles empty search", () => {
    const r = replaceText("abc", "", "x");
    expect(r.output).toBe("abc");
    expect(r.count).toBe(0);
  });

  test("handles empty input", () => {
    const r = replaceText("", "a", "b");
    expect(r.output).toBe("");
    expect(r.count).toBe(0);
  });

  test("escapes regex special characters in plain mode", () => {
    const r = replaceText("price is $10.00", "$10.00", "$20.00");
    expect(r.output).toBe("price is $20.00");
    expect(r.count).toBe(1);
  });
});

describe("replaceText - regex mode", () => {
  test("replaces with regex", () => {
    const r = replaceText("foo123bar456", "\\d+", "NUM", {
      useRegex: true,
      caseSensitive: true,
      globalReplace: true,
    });
    expect(r.output).toBe("fooNUMbarNUM");
    expect(r.count).toBe(2);
  });

  test("supports capture groups in replacement", () => {
    const r = replaceText(
      "2026-02-14",
      "(\\d{4})-(\\d{2})-(\\d{2})",
      "$2/$3/$1",
      {
        useRegex: true,
        caseSensitive: true,
        globalReplace: true,
      },
    );
    expect(r.output).toBe("02/14/2026");
  });

  test("returns error for invalid regex", () => {
    const r = replaceText("test", "[invalid", "x", {
      useRegex: true,
      caseSensitive: true,
      globalReplace: true,
    });
    expect(r.success).toBe(false);
    expect(r.error).toBeDefined();
  });
});
