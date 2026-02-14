import { describe, test, expect } from "vitest";
import { evaluateGuess, isValidYojiInput } from "../engine";

describe("evaluateGuess", () => {
  test("returns all correct for exact match", () => {
    const feedback = evaluateGuess("一期一会", "一期一会");
    expect(feedback.guess).toBe("一期一会");
    expect(feedback.charFeedbacks).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  test("returns all absent when no characters match", () => {
    const feedback = evaluateGuess("春夏秋冬", "一期一会");
    expect(feedback.charFeedbacks).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
    ]);
  });

  test("returns present when character exists at wrong position", () => {
    // target: 一期一会, guess: 会一期一
    // 会: not at pos 0 in target (target[0]=一), but exists at pos 3 -> present
    // 一: not at pos 1 in target (target[1]=期), but exists at pos 0 or 2 -> present
    // 期: not at pos 2 in target (target[2]=一), but exists at pos 1 -> present
    // 一: not at pos 3 in target (target[3]=会), but exists at pos 2 -> present
    const feedback = evaluateGuess("会一期一", "一期一会");
    expect(feedback.charFeedbacks).toEqual([
      "present",
      "present",
      "present",
      "present",
    ]);
  });

  test("handles duplicate characters correctly (target=一期一会, guess=一一一一)", () => {
    const feedback = evaluateGuess("一一一一", "一期一会");
    // Position 0: correct (一 matches target[0])
    // Position 1: absent (一 != 期, and target pos 2 is next available 一)
    // Position 2: correct (一 matches target[2])
    // Position 3: absent (no more 一 in target)
    expect(feedback.charFeedbacks).toEqual([
      "correct",
      "absent",
      "correct",
      "absent",
    ]);
  });

  test("correct takes priority over present for duplicates", () => {
    // target: 一二三一, guess: 三一一二
    // pos 0: 三 != 一, 三 exists at pos 2 -> present
    // pos 1: 一 != 二, 一 exists at pos 0 or 3 -> present (uses pos 0)
    // pos 2: 一 != 三, 一 exists at pos 3 -> present (uses pos 3)
    // pos 3: 二 != 一, 二 exists at pos 1 -> present
    const feedback = evaluateGuess("三一一二", "一二三一");
    expect(feedback.charFeedbacks).toEqual([
      "present",
      "present",
      "present",
      "present",
    ]);
  });

  test("mixed correct, present, and absent", () => {
    // target: 花鳥風月, guess: 花月雨鳥
    // pos 0: 花 = 花 -> correct
    // pos 1: 月 != 鳥, 月 exists at pos 3 -> present
    // pos 2: 雨 not in target -> absent
    // pos 3: 鳥 != 月, 鳥 exists at pos 1 -> present
    const feedback = evaluateGuess("花月雨鳥", "花鳥風月");
    expect(feedback.charFeedbacks).toEqual([
      "correct",
      "present",
      "absent",
      "present",
    ]);
  });
});

describe("isValidYojiInput", () => {
  test("returns true for valid 4-kanji input", () => {
    expect(isValidYojiInput("一期一会")).toBe(true);
  });

  test("returns false for 3 characters", () => {
    expect(isValidYojiInput("一期一")).toBe(false);
  });

  test("returns false for 5 characters", () => {
    expect(isValidYojiInput("一期一会花")).toBe(false);
  });

  test("returns false for input containing hiragana", () => {
    expect(isValidYojiInput("一期い会")).toBe(false);
  });

  test("returns false for input containing alphabet", () => {
    expect(isValidYojiInput("ABCd")).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(isValidYojiInput("")).toBe(false);
  });

  test("returns true for CJK Extension A characters", () => {
    // U+3400 is a valid CJK Extension A character
    expect(isValidYojiInput("\u3400\u3401\u3402\u3403")).toBe(true);
  });

  test("returns false for input containing katakana", () => {
    expect(isValidYojiInput("一期ア会")).toBe(false);
  });
});
