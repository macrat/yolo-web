import { describe, expect, test } from "vitest";
import { pickResultSymbol, pickResultWairoColor } from "../resultVisual";

describe("pickResultSymbol — 記号面の1字", () => {
  test("通常タイトルは先頭書記素をそのまま採る", () => {
    expect(pickResultSymbol("締切3分前に5手先を読む炎の策士")).toBe("締");
    expect(pickResultSymbol("炎の詩人")).toBe("炎");
  });

  test("開き鉤括弧「始まりは中身の最初の漢字/かなに着地する", () => {
    // character-personality の実タイトル9件（会話引用始まり）。
    expect(
      pickResultSymbol("「うーん、なんか違う」を1000回繰り返す美の追求者"),
    ).toBe("う");
    expect(
      pickResultSymbol(
        "「みんなが幸せな世界」を毎晩脳内で丁寧に設計する夢想家",
      ),
    ).toBe("み");
    expect(
      pickResultSymbol("「悪用できる穴」を見つけて自分で塞ぐ戦略的安全係"),
    ).toBe("悪");
    expect(
      pickResultSymbol("「王道でいく理由ある?」と言いながら意図的に外す曲者"),
    ).toBe("王");
    expect(
      pickResultSymbol("「大丈夫?」と聞きながら自分が一番疲れている守護芸術家"),
    ).toBe("大");
    expect(pickResultSymbol("「考えるより動け」を文字通り実践する覇王")).toBe(
      "考",
    );
    expect(
      pickResultSymbol(
        "「もう少し調べてから」と言って気づいたら10年経っていた博士",
      ),
    ).toBe("も");
    expect(
      pickResultSymbol(
        "「いつかやる」と言いながら脳内では47回旅立っている妄想家",
      ),
    ).toBe("い");
    expect(
      pickResultSymbol("「よし行くぞ！」と叫んで3秒後に空を見上げる炎の詩人"),
    ).toBe("よ");
  });

  test("他の開き括弧・引用符も飛ばす", () => {
    expect(pickResultSymbol("『論語』を諳んじる人")).toBe("論");
    expect(pickResultSymbol("（補足）ながら屋")).toBe("補");
    expect(pickResultSymbol('"quoted"')).toBe("q");
  });

  test("括弧の後に空白があっても最初の意味のある字に着地する", () => {
    expect(pickResultSymbol("「 空白始まり」の人")).toBe("空");
    expect(pickResultSymbol("　全角空白始まり")).toBe("全");
  });

  test("全字がスキップ対象という異常時は先頭書記素へフォールバック（空を返さない）", () => {
    expect(pickResultSymbol("「（〈")).toBe("「");
    expect(pickResultSymbol("「")).toBe("「");
  });

  test("空文字/空白のみは空を返す", () => {
    expect(pickResultSymbol("")).toBe("");
    expect(pickResultSymbol("   ")).toBe("");
  });

  test("サロゲートペア（結合文字なし）は書記素安全に扱う", () => {
    // 数学記号など BMP 外の1字。開き括弧でなければそのまま採る。
    expect(pickResultSymbol("𠮷野家の人")).toBe("𠮷");
  });
});

describe("pickResultWairoColor — id から決定的に和色を選ぶ", () => {
  test("同じ id は常に同じ色", () => {
    expect(pickResultWairoColor("blazing-strategist")).toBe(
      pickResultWairoColor("blazing-strategist"),
    );
  });
});
