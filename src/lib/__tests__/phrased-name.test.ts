import { describe, expect, test } from "vitest";
import { phrasedNamePhrases, phrasedNameText } from "@/lib/phrased-name";

describe("phrasedNameText", () => {
  test("区切りの並びは1続きの文にし、文字列はそのまま返す", () => {
    expect(phrasedNameText(["品質の", "目安"])).toBe("品質の目安");
    expect(phrasedNameText("品質")).toBe("品質");
  });
});

describe("phrasedNamePhrases", () => {
  test("区切りの並びはそのまま返し、文字列は1つの文節の並びにする", () => {
    expect(phrasedNamePhrases(["品質の", "目安"])).toEqual(["品質の", "目安"]);
    expect(phrasedNamePhrases("品質")).toEqual(["品質"]);
  });
});
