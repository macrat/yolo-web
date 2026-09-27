import { describe, expect, test } from "vitest";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import {
  DEFAULT_READING_HEADING_PHRASES,
  standardReadingHeadings,
} from "../readingHeadings";

describe("既定の読みものの小見出し", () => {
  test("書き手が分けた区切りは、見出しの区切りの禁則を満たす", () => {
    for (const phrases of Object.values(DEFAULT_READING_HEADING_PHRASES)) {
      expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    }
  });

  test("言い替えないときの小見出しの文には、どれも書き手が分けた区切りがある", () => {
    for (const text of Object.values(standardReadingHeadings())) {
      expect(DEFAULT_READING_HEADING_PHRASES[text]?.join("")).toBe(text);
    }
  });

  test("診断が言い替えた小見出しは、その文を使う", () => {
    expect(
      standardReadingHeadings({ traitsHeading: "この思考タイプの持ち味" })
        .traits,
    ).toBe("この思考タイプの持ち味");
  });
});
