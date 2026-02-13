import { describe, test, expect } from "vitest";
import { formatJson, minifyJson, validateJson } from "../logic";

describe("formatJson", () => {
  test("formats JSON with 2 spaces", () => {
    const input = '{"a":1,"b":2}';
    const expected = '{\n  "a": 1,\n  "b": 2\n}';
    expect(formatJson(input, "2")).toBe(expected);
  });

  test("formats JSON with 4 spaces", () => {
    const input = '{"a":1}';
    const expected = '{\n    "a": 1\n}';
    expect(formatJson(input, "4")).toBe(expected);
  });

  test("formats JSON with tabs", () => {
    const input = '{"a":1}';
    const expected = '{\n\t"a": 1\n}';
    expect(formatJson(input, "tab")).toBe(expected);
  });

  test("throws on invalid JSON", () => {
    expect(() => formatJson("{invalid}")).toThrow();
  });
});

describe("minifyJson", () => {
  test("minifies formatted JSON", () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}';
    expect(minifyJson(input)).toBe('{"a":1,"b":2}');
  });

  test("throws on invalid JSON", () => {
    expect(() => minifyJson("{invalid}")).toThrow();
  });
});

describe("validateJson", () => {
  test("returns valid for correct JSON", () => {
    const result = validateJson('{"key": "value"}');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("returns invalid with error message for bad JSON", () => {
    const result = validateJson("{bad}");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("validates arrays", () => {
    expect(validateJson("[1, 2, 3]").valid).toBe(true);
  });

  test("validates primitives", () => {
    expect(validateJson('"hello"').valid).toBe(true);
    expect(validateJson("42").valid).toBe(true);
    expect(validateJson("true").valid).toBe(true);
    expect(validateJson("null").valid).toBe(true);
  });

  test("rejects empty string", () => {
    expect(validateJson("").valid).toBe(false);
  });
});
