import { describe, it, expect } from "vitest";
import { getEstimatedTime } from "../introBadges";

describe("getEstimatedTime", () => {
  it("5問以下は「約1分」を返す", () => {
    expect(getEstimatedTime(5)).toBe("約1分");
    expect(getEstimatedTime(1)).toBe("約1分");
  });

  it("6〜8問は「約1〜2分」を返す", () => {
    expect(getEstimatedTime(6)).toBe("約1〜2分");
    expect(getEstimatedTime(7)).toBe("約1〜2分");
    expect(getEstimatedTime(8)).toBe("約1〜2分");
  });

  it("9問以上は「約2分」を返す", () => {
    expect(getEstimatedTime(9)).toBe("約2分");
    expect(getEstimatedTime(10)).toBe("約2分");
    expect(getEstimatedTime(20)).toBe("約2分");
  });
});
