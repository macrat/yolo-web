import { describe, test, expect } from "vitest";
import {
  formatJson,
  minifyJson,
  isValidJson,
  findJsonErrorPosition,
} from "../logic";

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

describe("isValidJson", () => {
  test.each(['{"key": "value"}', "[1, 2, 3]", '"hello"', "42", "true", "null"])(
    "%s は正しい",
    (input) => {
      expect(isValidJson(input)).toBe(true);
    },
  );

  test.each(["", "{bad}"])("%j は正しくない", (input) => {
    expect(isValidJson(input)).toBe(false);
  });
});

describe("findJsonErrorPosition", () => {
  test.each([
    ["Python の True", '{"a": True}', 1, 7],
    ["Python の None", '{"a": None}', 1, 7],
    ["undefined", '{"a": undefined}', 1, 7],
    ["NaN", '{"a": NaN}', 1, 7],
    ["行のコメント", '{\n  // 説明\n  "a": 1\n}', 2, 3],
    ["範囲のコメント", '{"a": 1 /* 説明 */}', 1, 9],
    ["配列の末尾のカンマ", "[1, 2,]", 1, 7],
    ["オブジェクトの末尾のカンマ", '{\n  "a": 1,\n}', 3, 1],
    ["引用符の無い鍵", "{a: 1}", 1, 2],
    ["引用符の無い値", '{"a": abc}', 1, 7],
    ["単引用符", "{'a': 1}", 1, 2],
    ["打ち誤りのリテラル", '{"a": tru}', 1, 10],
    ["閉じていない文字列", '{"a": "abc', 1, 11],
    ["文字列の中の改行", '{"a": "ab\ncd"}', 1, 10],
    ["閉じていないオブジェクト", '{"a": 1', 1, 8],
    ["カンマの抜け", '{"a": 1 "b": 2}', 1, 9],
    ["先頭の0", "[01]", 1, 3],
    ["誤った逃がし", '["\\x"]', 1, 4],
    ["値のあとの余計な字", '{"a": 1} x', 1, 10],
  ])("%s は、合わない最初の字の行と字を返す", (_, input, line, column) => {
    expect(isValidJson(input)).toBe(false);
    expect(findJsonErrorPosition(input)).toEqual({ line, column });
  });

  test("字はコードポイントで数え、絵文字も1字にする", () => {
    expect(findJsonErrorPosition('["😀", x]')).toEqual({ line: 1, column: 7 });
  });

  test.each([
    '{"a": [1, 2.5e-3, -0, "\\u00e9\\n"], "b": {"c": null}}',
    ' \n\t{"深い": [[[{"x": true}]]]}\r\n',
  ])("正しい JSON では null を返す", (input) => {
    expect(isValidJson(input)).toBe(true);
    expect(findJsonErrorPosition(input)).toBeNull();
  });
});
