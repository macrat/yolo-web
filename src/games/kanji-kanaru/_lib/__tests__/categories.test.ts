import { describe, test, expect } from "vitest";
import { radicalGroupNames } from "../categories";

describe("radicalGroupNames", () => {
  test("contains 20 radical group names", () => {
    expect(Object.keys(radicalGroupNames)).toHaveLength(20);
  });

  test("all 20 radical groups (1-20) have names", () => {
    for (let i = 1; i <= 20; i++) {
      expect(radicalGroupNames[i]).toBeDefined();
      expect(typeof radicalGroupNames[i]).toBe("string");
      expect(radicalGroupNames[i].length).toBeGreaterThan(0);
    }
  });
});
