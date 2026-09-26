import { describe, expect, test } from "vitest";
import { getDefinitionPreview } from "../definition-preview";

describe("getDefinitionPreview", () => {
  test("最初の句点までを返す", () => {
    expect(getDefinitionPreview("一文目。二文目。")).toBe("一文目。");
  });

  test("句点が無ければ全文を返す", () => {
    expect(getDefinitionPreview("句点の無い語義")).toBe("句点の無い語義");
  });
});
