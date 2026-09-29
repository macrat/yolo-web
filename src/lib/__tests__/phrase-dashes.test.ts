import { describe, expect, test } from "vitest";
import { joinDashes } from "@/lib/phrase-dashes";

const NBSP = "\u00A0";
const WJ = "\u2060";

describe("joinDashes", () => {
  test("「—」の前の空白を折れない空白にし、後ろの空白は残す", () => {
    expect(joinDashes("Cron式 早見表 — フィールド")).toBe(
      `Cron式 早見表${NBSP}— フィールド`,
    );
  });

  test("「──」の前の空白を折れない空白にし、ダッシュの字どうしのあいだに語結合子を置く", () => {
    expect(joinDashes("道具 ── 使い方")).toBe(`道具${NBSP}─${WJ}─ 使い方`);
  });

  test("「--」の前の空白を折れない空白にし、「-」どうしのあいだに語結合子を置く", () => {
    expect(joinDashes("効かない --")).toBe(`効かない${NBSP}-${WJ}-`);
  });

  test("空白の無いダッシュの前に語結合子を置く", () => {
    expect(joinDashes("ガイド──シェア")).toBe(`ガイド${WJ}─${WJ}─シェア`);
    expect(joinDashes("前—後")).toBe(`前${WJ}—後`);
    expect(joinDashes("a--b")).toBe(`a${WJ}-${WJ}-b`);
  });

  test("続く空白を1つの折れない空白にまとめる", () => {
    expect(joinDashes("前 \t — 後")).toBe(`前${NBSP}— 後`);
  });

  test("ハイフンで結んだ語は、ハイフンの後ろに語結合子を置き、そこで折らない", () => {
    expect(joinDashes("not-found.tsx")).toBe(`not-${WJ}found.tsx`);
    expect(joinDashes("marked-alert の導入")).toBe(`marked-${WJ}alert の導入`);
    expect(joinDashes("JSON-LDセキュリティ")).toBe(`JSON-${WJ}LDセキュリティ`);
    expect(joinDashes("global-not-found.js")).toBe(
      `global-${WJ}not-${WJ}found.js`,
    );
  });

  test("ハイフンの後ろが数字でも語結合子を置き、そこで折らない", () => {
    expect(joinDashes("UTF-8だけですか？")).toBe(`UTF-${WJ}8だけですか？`);
    expect(joinDashes("ISO-8601 の日付")).toBe(`ISO-${WJ}8601 の日付`);
  });

  test("ダッシュの無い文と、空白の隣の「-」はそのまま返す", () => {
    expect(joinDashes("生年月日（必須）")).toBe("生年月日（必須）");
    expect(joinDashes("a - b")).toBe("a - b");
    expect(joinDashes("-x")).toBe("-x");
  });

  test("文の頭のダッシュの前には何も置かない", () => {
    expect(joinDashes("──続き")).toBe(`─${WJ}─続き`);
  });

  test("字を消さず、語結合子を除けば元の文に戻る（空白は折れない空白に替わるだけ）", () => {
    const text = "見出し — その先 ── さらに -- 終わり not-found UTF-8";
    expect(joinDashes(text).replaceAll(WJ, "").replaceAll(NBSP, " ")).toBe(
      text,
    );
  });
});
