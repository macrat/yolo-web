import { describe, test, expect } from "vitest";
import {
  parseCsv,
  toCsv,
  toTsv,
  toJson,
  toMarkdown,
  parseJson,
  parseMarkdown,
  convert,
} from "../logic";

describe("parseCsv", () => {
  test("parses simple CSV", () => {
    const rows = parseCsv("a,b,c\n1,2,3");
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  test("handles quoted fields", () => {
    const rows = parseCsv('"hello, world",b\n"line1\nline2",d');
    expect(rows[0][0]).toBe("hello, world");
    expect(rows[1][0]).toBe("line1\nline2");
  });

  test("handles escaped double quotes", () => {
    const rows = parseCsv('"say ""hello""",b');
    expect(rows[0][0]).toBe('say "hello"');
  });

  test("handles CRLF line endings", () => {
    const rows = parseCsv("a,b\r\n1,2");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  test("handles empty input", () => {
    expect(parseCsv("")).toEqual([]);
  });

  test("handles single field", () => {
    expect(parseCsv("hello")).toEqual([["hello"]]);
  });

  test("handles trailing newline", () => {
    const rows = parseCsv("a,b\n1,2\n");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  test("parses TSV with tab delimiter", () => {
    const rows = parseCsv("a\tb\tc\n1\t2\t3", "\t");
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });
});

describe("toCsv", () => {
  test("serializes simple rows", () => {
    expect(
      toCsv([
        ["a", "b"],
        ["1", "2"],
      ]),
    ).toBe("a,b\n1,2");
  });

  test("quotes fields containing commas", () => {
    expect(toCsv([["hello, world"]])).toBe('"hello, world"');
  });

  test("escapes double quotes", () => {
    expect(toCsv([['say "hello"']])).toBe('"say ""hello"""');
  });

  test("handles empty rows", () => {
    expect(toCsv([])).toBe("");
  });
});

describe("toTsv", () => {
  test("serializes with tabs", () => {
    expect(
      toTsv([
        ["a", "b"],
        ["1", "2"],
      ]),
    ).toBe("a\tb\n1\t2");
  });

  test("quotes fields containing tabs", () => {
    const result = toTsv([["has\ttab"]]);
    expect(result).toContain('"');
  });
});

describe("toJson", () => {
  test("converts rows to JSON array of objects", () => {
    const json = toJson([
      ["name", "age"],
      ["Alice", "30"],
    ]);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([{ name: "Alice", age: "30" }]);
  });

  test("handles empty rows", () => {
    expect(toJson([])).toBe("[]");
  });

  test("uses column1, column2 for empty headers", () => {
    const json = toJson([
      ["", "b"],
      ["1", "2"],
    ]);
    const parsed = JSON.parse(json);
    expect(parsed[0]).toHaveProperty("column1");
  });
});

describe("toMarkdown", () => {
  test("converts rows to markdown table", () => {
    const md = toMarkdown([
      ["Name", "Age"],
      ["Alice", "30"],
    ]);
    expect(md).toContain("| Name | Age |");
    expect(md).toContain("| --- | --- |");
    expect(md).toContain("| Alice | 30 |");
  });

  test("escapes pipe characters", () => {
    const md = toMarkdown([["a|b"], ["c|d"]]);
    expect(md).toContain("a\\|b");
  });

  test("handles empty rows", () => {
    expect(toMarkdown([])).toBe("");
  });
});

describe("parseJson", () => {
  test("parses JSON array of objects", () => {
    const rows = parseJson('[{"name":"Alice","age":"30"}]');
    expect(rows).toEqual([
      ["name", "age"],
      ["Alice", "30"],
    ]);
  });

  test("throws on non-array JSON", () => {
    expect(() => parseJson('{"key":"value"}')).toThrow();
  });

  test("handles empty array", () => {
    expect(parseJson("[]")).toEqual([]);
  });
});

describe("parseMarkdown", () => {
  test("parses markdown table", () => {
    const md = "| Name | Age |\n| --- | --- |\n| Alice | 30 |";
    const rows = parseMarkdown(md);
    expect(rows).toEqual([
      ["Name", "Age"],
      ["Alice", "30"],
    ]);
  });

  test("throws on invalid table", () => {
    expect(() => parseMarkdown("not a table")).toThrow();
  });
});

describe("convert", () => {
  test("csv to json", () => {
    const r = convert("name,age\nAlice,30", "csv", "json");
    expect(r.success).toBe(true);
    expect(JSON.parse(r.output)).toEqual([{ name: "Alice", age: "30" }]);
  });

  test("csv to tsv", () => {
    const r = convert("a,b\n1,2", "csv", "tsv");
    expect(r.success).toBe(true);
    expect(r.output).toBe("a\tb\n1\t2");
  });

  test("csv to markdown", () => {
    const r = convert("Name,Age\nAlice,30", "csv", "markdown");
    expect(r.success).toBe(true);
    expect(r.output).toContain("| Name | Age |");
  });

  test("json to csv", () => {
    const r = convert('[{"name":"Alice","age":"30"}]', "json", "csv");
    expect(r.success).toBe(true);
    expect(r.output).toContain("name,age");
  });

  test("handles empty input", () => {
    const r = convert("", "csv", "json");
    expect(r.success).toBe(true);
    expect(r.output).toBe("");
  });

  test("returns error for invalid JSON", () => {
    const r = convert("not json", "json", "csv");
    expect(r.success).toBe(false);
    expect(r.error).toBeDefined();
  });

  test("returns error for oversized input", () => {
    const r = convert("a".repeat(500_001), "csv", "json");
    expect(r.success).toBe(false);
  });
});
