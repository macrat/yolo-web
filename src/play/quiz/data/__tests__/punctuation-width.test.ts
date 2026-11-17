/**
 * 診断のデータの文（題・説明・FAQ・設問・結果・相性の文）の疑問符・感嘆符は全角で組み、文の途中のものの後ろは
 * 全角アキにする（DESIGN.md §4）。半角と全角が混ざると、同じ画面の中で約物の大きさとアキがそろわない。
 */
import { describe, expect, test } from "vitest";

const dataModules = import.meta.glob("../*.ts", { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

/** 値の中の文字列をすべて集める。同じ値を再び書き出すモジュールがあるので、一度見た値は飛ばす。 */
function collectStrings(value: unknown, seen: Set<unknown>, out: string[]) {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (typeof value !== "object" || value === null || seen.has(value)) return;
  seen.add(value);
  for (const child of Object.values(value)) collectStrings(child, seen, out);
}

/** 全角の疑問符・感嘆符の直後に、アキを置かずに続けてよい字。文の終わり・閉じ括弧・句読点・約物の連なり。 */
const ALLOWED_AFTER_MARK = /[」』）)】〕〉》"'、。，．・？！　\n]/;

const seen = new Set<unknown>();
const texts: string[] = [];
for (const exports of Object.values(dataModules)) {
  collectStrings(exports, seen, texts);
}

describe("診断のデータの疑問符・感嘆符", () => {
  test("データの文を読み込めている", () => {
    expect(texts.length).toBeGreaterThan(0);
  });

  test("半角の「?」「!」を持たない", () => {
    expect(texts.filter((text) => /[?!]/.test(text))).toEqual([]);
  });

  test("文の途中の「？」「！」の後ろは全角アキ", () => {
    const violations = texts.filter((text) =>
      [...text.matchAll(/[？！]/g)].some(({ index }) => {
        const next = text[index + 1];
        return next !== undefined && !ALLOWED_AFTER_MARK.test(next);
      }),
    );
    expect(violations).toEqual([]);
  });
});
