import { describe, expect, test } from "vitest";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import { guessLabel } from "../guessLabel";
import { difficultyNames } from "../constants";
import { MAX_GUESSES, type Difficulty } from "../types";

const DIFFICULTIES = Object.keys(difficultyNames) as Difficulty[];
const REMAINING = Array.from({ length: MAX_GUESSES }, (_, i) => i + 1);

describe("guessLabel", () => {
  test("難易度と残りの回数のどの組でも、並びが文節の区切りの禁則を満たす", () => {
    for (const difficulty of DIFFICULTIES) {
      for (const remaining of REMAINING) {
        expect(
          followsPhraseRules(guessLabel(difficulty, remaining)),
          `${difficulty} ${remaining}`,
        ).toBe(true);
      }
    }
  });

  test("並びをつなぐと、難易度と残りの回数を言う1続きの名前になる", () => {
    expect(guessLabel("beginner", MAX_GUESSES).join("")).toBe(
      "初級の四字熟語を入力（あと6回）",
    );
  });
});
