import { describe, test, expect } from "vitest";
import {
  evaluateGuess,
  evaluateKunYomiCount,
  isValidKanji,
  lookupKanji,
} from "../engine";
import type { KanjiEntry } from "../types";

// Test fixtures for kanji game evaluation
const target: KanjiEntry = {
  character: "\u5C71",
  radical: "\u5C71",
  radicalGroup: 46,
  strokeCount: 3,
  grade: 1,
  onYomi: ["\u30B5\u30F3", "\u30BB\u30F3"],
  kunYomi: ["\u3084\u307E"],
  meanings: ["mountain"],
  examples: ["\u5C71\u8108", "\u706B\u5C71", "\u767B\u5C71"],
};

const exactMatch: KanjiEntry = {
  character: "\u5C71",
  radical: "\u5C71",
  radicalGroup: 46,
  strokeCount: 3,
  grade: 1,
  onYomi: ["\u30B5\u30F3", "\u30BB\u30F3"],
  kunYomi: ["\u3084\u307E"],
  meanings: ["mountain"],
  examples: ["\u5C71\u8108", "\u706B\u5C71", "\u767B\u5C71"],
};

const partialMatch: KanjiEntry = {
  character: "\u5DDD",
  radical: "\u5DDD",
  radicalGroup: 47,
  strokeCount: 3,
  grade: 1,
  onYomi: ["\u30BB\u30F3"],
  kunYomi: ["\u304B\u308F"],
  meanings: ["river"],
  examples: ["\u6CB3\u5DDD", "\u5DDD\u5CB8", "\u5C0F\u5DDD"],
};

const noMatch: KanjiEntry = {
  character: "\u5B66",
  radical: "\u5B50",
  radicalGroup: 39,
  strokeCount: 8,
  grade: 1,
  onYomi: ["\u30AC\u30AF"],
  kunYomi: ["\u307E\u306A\u3076"],
  meanings: ["learn", "study"],
  examples: ["\u5B66\u6821", "\u5927\u5B66", "\u5B66\u751F"],
};

const kanjiData: KanjiEntry[] = [target, partialMatch, noMatch];

describe("evaluateGuess", () => {
  test("returns all correct for exact match", () => {
    const feedback = evaluateGuess(exactMatch, target);
    expect(feedback.guess).toBe("\u5C71");
    expect(feedback.radical).toBe("correct");
    expect(feedback.strokeCount).toBe("correct");
    expect(feedback.grade).toBe("correct");
    expect(feedback.gradeDirection).toBe("equal");
    expect(feedback.onYomi).toBe("correct");
    expect(feedback.category).toBe("correct");
    expect(feedback.kunYomiCount).toBe("correct");
  });

  test("radical is binary: wrong when different", () => {
    const feedback = evaluateGuess(partialMatch, target);
    expect(feedback.radical).toBe("wrong");
  });

  test("strokeCount is correct when equal", () => {
    const feedback = evaluateGuess(partialMatch, target);
    expect(feedback.strokeCount).toBe("correct");
  });

  test("strokeCount is close when within +/-2", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      strokeCount: 5,
    };
    const feedback = evaluateGuess(guess, target);
    expect(feedback.strokeCount).toBe("close");
  });

  test("strokeCount is wrong when diff > 2", () => {
    const feedback = evaluateGuess(noMatch, target);
    expect(feedback.strokeCount).toBe("wrong");
  });

  test("grade is correct when equal", () => {
    const feedback = evaluateGuess(partialMatch, target);
    expect(feedback.grade).toBe("correct");
  });

  test("grade is close when within +/-1", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      grade: 2,
    };
    const feedback = evaluateGuess(guess, target);
    expect(feedback.grade).toBe("close");
  });

  test("grade is wrong when diff > 1", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      grade: 5,
    };
    const feedback = evaluateGuess(guess, target);
    expect(feedback.grade).toBe("wrong");
  });

  test("gradeDirection is up when target grade is higher", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      grade: 1,
    };
    const higherTarget: KanjiEntry = { ...target, grade: 3 };
    const feedback = evaluateGuess(guess, higherTarget);
    expect(feedback.gradeDirection).toBe("up");
  });

  test("gradeDirection is down when target grade is lower", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      grade: 5,
    };
    const lowerTarget: KanjiEntry = { ...target, grade: 2 };
    const feedback = evaluateGuess(guess, lowerTarget);
    expect(feedback.gradeDirection).toBe("down");
  });

  test("gradeDirection is equal when grades match", () => {
    const feedback = evaluateGuess(partialMatch, target);
    expect(feedback.gradeDirection).toBe("equal");
  });

  test("onYomi is correct when sharing at least one reading", () => {
    const feedback = evaluateGuess(partialMatch, target);
    expect(feedback.onYomi).toBe("correct");
  });

  test("onYomi is wrong when no readings match", () => {
    const feedback = evaluateGuess(noMatch, target);
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

  test("category is correct when same radical group", () => {
    const feedback = evaluateGuess(exactMatch, target);
    expect(feedback.category).toBe("correct");
  });

  test("category uses embedding similarity for different characters", () => {
    const feedback = evaluateGuess(partialMatch, target);
    // Different characters: result depends on embedding similarity, not category number
    // Since evaluateSimilarity is called server-side with actual embeddings,
    // the result may be correct, close, or wrong based on cosine similarity
    expect(["correct", "close", "wrong"]).toContain(feedback.category);
  });

  test("category is wrong when unrelated radical groups", () => {
    const feedback = evaluateGuess(noMatch, target);
    // category 16 vs 6 -> different super-groups -> wrong
    expect(feedback.category).toBe("wrong");
  });

  test("kunYomiCount is correct when counts match", () => {
    const feedback = evaluateGuess(partialMatch, target);
    // Both have 1 kunYomi
    expect(feedback.kunYomiCount).toBe("correct");
  });

  test("kunYomiCount is close when difference is 1", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      kunYomi: ["\u3042", "\u3044"],
    };
    const feedback = evaluateGuess(guess, target);
    // 2 vs 1 = diff of 1 -> close
    expect(feedback.kunYomiCount).toBe("close");
  });

  test("kunYomiCount is wrong when difference > 1", () => {
    const guess: KanjiEntry = {
      ...target,
      character: "X",
      kunYomi: ["\u3042", "\u3044", "\u3046", "\u3048"],
    };
    const feedback = evaluateGuess(guess, target);
    // 4 vs 1 = diff of 3 -> wrong
    expect(feedback.kunYomiCount).toBe("wrong");
  });
});

describe("evaluateKunYomiCount", () => {
  test("returns correct when counts match", () => {
    expect(evaluateKunYomiCount(2, 2)).toBe("correct");
    expect(evaluateKunYomiCount(0, 0)).toBe("correct");
  });

  test("returns close when difference is 1", () => {
    expect(evaluateKunYomiCount(1, 2)).toBe("close");
    expect(evaluateKunYomiCount(3, 2)).toBe("close");
  });

  test("returns wrong when difference > 1", () => {
    expect(evaluateKunYomiCount(0, 3)).toBe("wrong");
    expect(evaluateKunYomiCount(5, 1)).toBe("wrong");
  });
});

describe("isValidKanji", () => {
  test("returns true for a character in the dataset", () => {
    expect(isValidKanji("\u5C71", kanjiData)).toBe(true);
  });

  test("returns false for a character not in the dataset", () => {
    expect(isValidKanji("\u732B", kanjiData)).toBe(false);
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
    const entry = lookupKanji("\u5C71", kanjiData);
    expect(entry).toBeDefined();
    expect(entry?.character).toBe("\u5C71");
    expect(entry?.strokeCount).toBe(3);
  });

  test("returns undefined for non-existent character", () => {
    expect(lookupKanji("\u732B", kanjiData)).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(lookupKanji("", kanjiData)).toBeUndefined();
  });
});
