import { describe, expect, test } from "vitest";
import { joinDashes } from "@/lib/phrase-dashes";

const NBSP = " ";
const WJ = "⁠";

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

  test("ダッシュの無い文と1つだけの「-」はそのまま返す", () => {
    expect(joinDashes("生年月日（必須）")).toBe("生年月日（必須）");
    expect(joinDashes("UTF-8 の文字")).toBe("UTF-8 の文字");
  });

  test("文の頭のダッシュの前には何も置かない", () => {
    expect(joinDashes("──続き")).toBe(`─${WJ}─続き`);
  });

  test("字を消さず、語結合子を除けば元の文に戻る（空白は折れない空白に替わるだけ）", () => {
    const text = "見出し — その先 ── さらに -- 終わり";
    expect(joinDashes(text).replaceAll(WJ, "").replaceAll(NBSP, " ")).toBe(
      text,
    );
  });
});
