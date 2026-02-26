import { describe, test, expect } from "vitest";
import { evaluateGuess, isValidKanji, lookupKanji } from "../engine";
import type { KanjiEntry } from "../types";

// Test fixtures
const target: KanjiEntry = {
  character: "山",
  radical: "山",
  radicalGroup: 46,
  strokeCount: 3,
  grade: 1,
  onYomi: ["サン", "セン"],
  kunYomi: ["やま"],
  meanings: ["mountain"],
  category: "nature",
  examples: ["山脈", "火山", "登山"],
};

const exactMatch: KanjiEntry = {
  character: "山",
  radical: "山",
  radicalGroup: 46,
  strokeCount: 3,
  grade: 1,
  onYomi: ["サン", "セン"],
  kunYomi: ["やま"],
  meanings: ["mountain"],
  category: "nature",
  examples: ["山脈", "火山", "登山"],
};

const partialMatch: KanjiEntry = {
  character: "川",
  radical: "川",
  radicalGroup: 47,
  strokeCount: 3,
  grade: 1,
  onYomi: ["セン"],
  kunYomi: ["かわ"],
  meanings: ["river"],
  category: "water",
  examples: ["河川", "川岸", "小川"],
};

const noMatch: KanjiEntry = {
  character: "学",
  radical: "子",
  radicalGroup: 39,
  strokeCount: 8,
  grade: 1,
  onYomi: ["ガク"],
  kunYomi: ["まなぶ"],
  meanings: ["learn", "study"],
  category: "language",
  examples: ["学校", "大学", "学生"],
};

const kanjiData: KanjiEntry[] = [target, partialMatch, noMatch];

describe("evaluateGuess", () => {
  test("returns all correct for exact match", () => {
    const feedback = evaluateGuess(exactMatch, target);
    expect(feedback.guess).toBe("山");
    expect(feedback.radical).toBe("correct");
    expect(feedback.strokeCount).toBe("correct");
    expect(feedback.grade).toBe("correct");
    expect(feedback.onYomi).toBe("correct");
    expect(feedback.category).toBe("correct");
  });

  test("radical is binary: wrong when different", () => {
    const feedback = evaluateGuess(partialMatch, target);
    // 川 (radical 川, group 47) vs 山 (radical 山, group 46) -> wrong (binary only)
    expect(feedback.radical).toBe("wrong");
  });

  test("strokeCount is correct when equal", () => {
    const feedback = evaluateGuess(partialMatch, target);
    // Both have 3 strokes
    expect(feedback.strokeCount).toBe("correct");
  });

  test("strokeCount is close when within +/-2", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      strokeCount: 5,
    };
    const feedback = evaluateGuess(guess, target);
    // 5 vs 3 = diff of 2 -> close
    expect(feedback.strokeCount).toBe("close");
  });

  test("strokeCount is wrong when diff > 2", () => {
    const feedback = evaluateGuess(noMatch, target);
    // 8 vs 3 = diff of 5 -> wrong
    expect(feedback.strokeCount).toBe("wrong");
  });

  test("grade is correct when equal", () => {
    const feedback = evaluateGuess(partialMatch, target);
    // Both grade 1
    expect(feedback.grade).toBe("correct");
  });

  test("grade is close when within +/-1", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      grade: 2,
    };
    const feedback = evaluateGuess(guess, target);
    // 2 vs 1 = diff of 1 -> close
    expect(feedback.grade).toBe("close");
  });

  test("grade is wrong when diff > 1", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      grade: 5,
    };
    const feedback = evaluateGuess(guess, target);
    // 5 vs 1 = diff of 4 -> wrong
    expect(feedback.grade).toBe("wrong");
  });

  test("onYomi is correct when sharing at least one reading", () => {
    const feedback = evaluateGuess(partialMatch, target);
    // 川 has ["セン"], 山 has ["サン", "セン"] -> shares "セン" -> correct
    expect(feedback.onYomi).toBe("correct");
  });

  test("onYomi is wrong when no readings match", () => {
    const feedback = evaluateGuess(noMatch, target);
    // 学 has ["ガク"], 山 has ["サン", "セン"] -> no match -> wrong
    expect(feedback.onYomi).toBe("wrong");
  });

  test("onYomi is wrong when both have empty arrays", () => {
    const guessEmpty: KanjiEntry = {
      ...target,
      character: "A",
      onYomi: [],
    };
    const targetEmpty: KanjiEntry = { ...target, character: "B", onYomi: [] };
    const feedback = evaluateGuess(guessEmpty, targetEmpty);
    expect(feedback.onYomi).toBe("wrong");
  });

  test("category is correct when same category", () => {
    const feedback = evaluateGuess(exactMatch, target);
    expect(feedback.category).toBe("correct");
  });

  test("category is close when in same super-group", () => {
    const feedback = evaluateGuess(partialMatch, target);
    // "water" and "nature" are both in "elements" super-group -> close
    expect(feedback.category).toBe("close");
  });

  test("category is wrong when unrelated", () => {
    const feedback = evaluateGuess(noMatch, target);
    // "language" is in "human", "nature" is in "elements" -> wrong
    expect(feedback.category).toBe("wrong");
  });
});

describe("isValidKanji", () => {
  test("returns true for a character in the dataset", () => {
    expect(isValidKanji("山", kanjiData)).toBe(true);
  });

  test("returns false for a character not in the dataset", () => {
    expect(isValidKanji("猫", kanjiData)).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(isValidKanji("", kanjiData)).toBe(false);
  });

  test("returns false for non-kanji character", () => {
    expect(isValidKanji("a", kanjiData)).toBe(false);
  });
});

describe("lookupKanji", () => {
  test("returns entry for existing character", () => {
    const entry = lookupKanji("山", kanjiData);
    expect(entry).toBeDefined();
    expect(entry?.character).toBe("山");
    expect(entry?.strokeCount).toBe(3);
  });

  test("returns undefined for non-existent character", () => {
    expect(lookupKanji("猫", kanjiData)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(lookupKanji("", kanjiData)).toBeUndefined();
  });
});
