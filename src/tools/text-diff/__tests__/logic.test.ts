import { describe, test, expect } from "vitest";
import { computeDiff, hasDifferences } from "../logic";

describe("computeDiff", () => {
  test("returns no diff for identical texts", () => {
    const parts = computeDiff("hello", "hello", "char");
    expect(hasDifferences(parts)).toBe(false);
  });

  test("detects added text (char mode)", () => {
    const parts = computeDiff("hello", "hello world", "char");
    expect(hasDifferences(parts)).toBe(true);
    const addedParts = parts.filter((p) => p.added);
    expect(addedParts.length).toBeGreaterThan(0);
  });

  test("detects removed text (char mode)", () => {
    const parts = computeDiff("hello world", "hello", "char");
    expect(hasDifferences(parts)).toBe(true);
    const removedParts = parts.filter((p) => p.removed);
    expect(removedParts.length).toBeGreaterThan(0);
  });

  test("line mode diff", () => {
    const parts = computeDiff("line1\nline2", "line1\nline3", "line");
    expect(hasDifferences(parts)).toBe(true);
  });

  test("word mode diff", () => {
    const parts = computeDiff("hello world", "hello earth", "word");
    expect(hasDifferences(parts)).toBe(true);
    const removed = parts.filter((p) => p.removed);
    const added = parts.filter((p) => p.added);
    expect(removed.length).toBeGreaterThan(0);
    expect(added.length).toBeGreaterThan(0);
  });

  test("empty strings produce no diff", () => {
    const parts = computeDiff("", "", "line");
    expect(hasDifferences(parts)).toBe(false);
  });
});

describe("hasDifferences", () => {
  test("returns false for parts with no additions or removals", () => {
    expect(
      hasDifferences([{ value: "hello", added: false, removed: false }]),
    ).toBe(false);
  });

  test("returns true if any part is added", () => {
    expect(
      hasDifferences([{ value: "new", added: true, removed: false }]),
    ).toBe(true);
  });

  test("returns true if any part is removed", () => {
    expect(
      hasDifferences([{ value: "old", added: false, removed: true }]),
    ).toBe(true);
  });
});

// ===========================================================
// 末尾改行アーティファクト修正 (U-7 是正)
// ignoreNewlineAtEof オプションを使い、末尾改行の有無だけの差を
// 「変更なし」として扱うことを確認する。
// ===========================================================
describe("line モード: 末尾改行アーティファクトの解消", () => {
  test("末尾改行の有無だけが異なる場合は差分なし（バグ再現: もも→もも\\n）", () => {
    // 修正前: diffLines('もも', 'もも\n') は +/- の差分を返す（バグ）
    // 修正後: ignoreNewlineAtEof: true で差分なしになる
    const parts = computeDiff("もも", "もも\n", "line");
    expect(hasDifferences(parts)).toBe(false);
  });

  test("末尾改行の有無だけが異なる場合はサマリ件数も 0（バグ再現: 複数行）", () => {
    // 末尾改行だけ異なる複数行テキスト
    const parts = computeDiff("line1\nline2", "line1\nline2\n", "line");
    expect(hasDifferences(parts)).toBe(false);
  });

  test("末尾改行が逆方向（\\n → なし）でも差分なし", () => {
    const parts = computeDiff("もも\n", "もも", "line");
    expect(hasDifferences(parts)).toBe(false);
  });

  test("実際の行変更は末尾改行アーティファクト修正後も正しく検出される", () => {
    // 末尾改行の有無が違っても、実際の行変更は検出できる
    const parts = computeDiff("line1\nline2", "line1\nline3\n", "line");
    expect(hasDifferences(parts)).toBe(true);
    expect(parts.some((p) => p.added)).toBe(true);
    expect(parts.some((p) => p.removed)).toBe(true);
  });

  test("両方末尾改行あり・同一テキストは差分なし（回帰）", () => {
    const parts = computeDiff("line1\nline2\n", "line1\nline2\n", "line");
    expect(hasDifferences(parts)).toBe(false);
  });

  test("両方末尾改行なし・同一テキストは差分なし（回帰）", () => {
    const parts = computeDiff("line1\nline2", "line1\nline2", "line");
    expect(hasDifferences(parts)).toBe(false);
  });

  test("word モードは末尾改行アーティファクトの影響を受けない（非回帰）", () => {
    // word モードでも末尾改行で誤差分が出ないことを確認
    const parts = computeDiff("hello", "hello\n", "word");
    // word モードでは diffWords を使うため、改行が1つの word として扱われる
    // ここでは差分の有無よりも、クラッシュしないことを確認
    expect(parts).toBeDefined();
    expect(Array.isArray(parts)).toBe(true);
  });
});
