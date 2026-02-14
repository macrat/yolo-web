import { describe, test, expect } from "vitest";
import { formatYaml, validateYaml, yamlToJson, jsonToYaml } from "../logic";

describe("formatYaml", () => {
  test("formats basic YAML", () => {
    const input = "name: test\nage: 30";
    const result = formatYaml(input);
    expect(result).toContain("name: test");
    expect(result).toContain("age: 30");
  });

  test("formats with indent 4", () => {
    const input = "parent:\n  child: value";
    const result = formatYaml(input, 4);
    expect(result).toContain("parent:");
    expect(result).toContain("    child: value");
  });

  test("throws on invalid YAML", () => {
    expect(() => formatYaml("{invalid: yaml: content}")).toThrow();
  });
});

describe("validateYaml", () => {
  test("validates correct YAML", () => {
    const result = validateYaml("name: test\nlist:\n  - item1\n  - item2");
    expect(result.valid).toBe(true);
  });

  test("detects invalid YAML", () => {
    const result = validateYaml("{invalid: yaml: content}");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("reports empty input as invalid", () => {
    const result = validateYaml("");
    expect(result.valid).toBe(false);
  });

  test("reports whitespace-only input as invalid", () => {
    const result = validateYaml("   ");
    expect(result.valid).toBe(false);
  });
});

describe("yamlToJson", () => {
  test("converts basic YAML to JSON", () => {
    const input = "name: test\nage: 30";
    const result = yamlToJson(input);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ name: "test", age: 30 });
  });

  test("converts YAML array to JSON array", () => {
    const input = "- item1\n- item2\n- item3";
    const result = yamlToJson(input);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual(["item1", "item2", "item3"]);
  });

  test("converts nested YAML", () => {
    const input = "parent:\n  child:\n    key: value";
    const result = yamlToJson(input);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ parent: { child: { key: "value" } } });
  });
});

describe("input size limit", () => {
  const oversizedInput = "a".repeat(1_000_001);

  test("formatYaml throws on input exceeding 1,000,000 characters", () => {
    expect(() => formatYaml(oversizedInput)).toThrow("入力が大きすぎます");
  });

  test("yamlToJson throws on input exceeding 1,000,000 characters", () => {
    expect(() => yamlToJson(oversizedInput)).toThrow("入力が大きすぎます");
  });

  test("validateYaml returns error on input exceeding 1,000,000 characters", () => {
    const result = validateYaml(oversizedInput);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("入力が大きすぎます");
  });

  test("jsonToYaml throws on input exceeding 1,000,000 characters", () => {
    expect(() => jsonToYaml(oversizedInput)).toThrow("入力が大きすぎます");
  });
});

describe("jsonToYaml", () => {
  test("converts basic JSON to YAML", () => {
    const input = '{"name": "test", "age": 30}';
    const result = jsonToYaml(input);
    expect(result).toContain("name: test");
    expect(result).toContain("age: 30");
  });

  test("throws on invalid JSON", () => {
    expect(() => jsonToYaml("{invalid json}")).toThrow();
  });
});
