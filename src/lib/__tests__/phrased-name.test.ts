import { describe, expect, test } from "vitest";
import { phrasedNameText } from "@/lib/phrased-name";

describe("phrasedNameText", () => {
  test("区切りの並びは1続きの文にし、文字列はそのまま返す", () => {
    expect(phrasedNameText(["品質の", "目安"])).toBe("品質の目安");
    expect(phrasedNameText("品質")).toBe("品質");
  });
});
