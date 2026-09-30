import { describe, expect, test } from "vitest";
import { toGraphemes, wordStartsOf } from "@/lib/word-starts";

describe("wordStartsOf", () => {
  test("語の頭を字の番号で返し、片仮名の続きの中は組み直した語の頭だけを返す", () => {
    expect([...wordStartsOf("メールアドレスバリデーター")]).toEqual([7]);
    expect([...wordStartsOf("フィルタリングパイプライン")]).toEqual([7]);
    expect([...wordStartsOf("リファクタリング")]).toEqual([]);
  });

  test("続きの前からかかる語との境目は残す", () => {
    expect([...wordStartsOf("省エネモード")]).toContain(3);
  });

  test("番号は書記素で数える", () => {
    const text = "👨‍👩‍👧メールアドレスバリデーター";
    expect(toGraphemes(text)[1]).toBe("メ");
    expect([...wordStartsOf(text)]).toContain(8);
  });
});
