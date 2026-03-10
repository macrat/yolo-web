import type { KanjiEntry, GuessFeedback, FeedbackLevel } from "./types";
import { areCategoriesRelated } from "./categories";

/**
 * Evaluate a guess against the target kanji and return feedback for each attribute.
 *
 * Reviewer-applied rules:
 * - radical: binary correct/wrong only (no "close")
 * - onYomi: binary correct/wrong only ("correct" = shares at least one complete reading)
 * - strokeCount: correct / close (within +/-2) / wrong
 * - grade: correct / close (within +/-1) / wrong
 * - gradeDirection: "up" if target grade > guess grade, "down" if less, "equal" if same
 * - category: correct / close (same super-group) / wrong
 * - kunYomiCount: correct / close (within +/-1) / wrong
 */
export function evaluateGuess(
  guess: KanjiEntry,
  target: KanjiEntry,
): GuessFeedback {
  return {
    guess: guess.character,
    radical: evaluateRadical(guess, target),
    strokeCount: evaluateStrokeCount(guess.strokeCount, target.strokeCount),
    grade: evaluateGrade(guess.grade, target.grade),
    gradeDirection: evaluateGradeDirection(guess.grade, target.grade),
    onYomi: evaluateOnYomi(guess.onYomi, target.onYomi),
    category: evaluateCategory(guess.category, target.category),
    kunYomiCount: evaluateKunYomiCount(
      guess.kunYomi.length,
      target.kunYomi.length,
    ),
  };
}

/**
 * Radical feedback: binary correct/wrong only.
 */
function evaluateRadical(guess: KanjiEntry, target: KanjiEntry): FeedbackLevel {
  if (guess.radical === target.radical) return "correct";
  return "wrong";
}

/**
 * Stroke count feedback: correct if exact, close if within +/-2, otherwise wrong.
 */
function evaluateStrokeCount(
  guessCount: number,
  targetCount: number,
): FeedbackLevel {
  if (guessCount === targetCount) return "correct";
  if (Math.abs(guessCount - targetCount) <= 2) return "close";
  return "wrong";
}

/**
 * Grade feedback: correct if exact, close if within +/-1, otherwise wrong.
 */
function evaluateGrade(guessGrade: number, targetGrade: number): FeedbackLevel {
  if (guessGrade === targetGrade) return "correct";
  if (Math.abs(guessGrade - targetGrade) <= 1) return "close";
  return "wrong";
}

/**
 * Grade direction: indicates whether the target grade is higher, lower, or equal.
 * "up" = target is higher grade (harder), "down" = target is lower grade (easier).
 */
function evaluateGradeDirection(
  guessGrade: number,
  targetGrade: number,
): "up" | "down" | "equal" {
  if (guessGrade === targetGrade) return "equal";
  return targetGrade > guessGrade ? "up" : "down";
}

/**
 * On'yomi feedback: binary correct/wrong only.
 * "correct" = the guess and target share at least one complete on'yomi reading.
 */
function evaluateOnYomi(
  guessReadings: string[],
  targetReadings: string[],
): FeedbackLevel {
  for (const gr of guessReadings) {
    for (const tr of targetReadings) {
      if (gr === tr) return "correct";
    }
  }
  return "wrong";
}

/**
 * Category feedback: correct if exact match, close if in the same super-group, otherwise wrong.
 */
function evaluateCategory(
  guessCategory: KanjiEntry["category"],
  targetCategory: KanjiEntry["category"],
): FeedbackLevel {
  if (guessCategory === targetCategory) return "correct";
  if (areCategoriesRelated(guessCategory, targetCategory)) return "close";
  return "wrong";
}

/**
 * Kun'yomi count feedback: correct if exact, close if within +/-1, otherwise wrong.
 * Compares the number of kun'yomi readings between guess and target.
 */
export function evaluateKunYomiCount(
  guessCount: number,
  targetCount: number,
): FeedbackLevel {
  if (guessCount === targetCount) return "correct";
  if (Math.abs(guessCount - targetCount) <= 1) return "close";
  return "wrong";
}

/**
 * Check if a character is a valid kanji in the dataset.
 */
export function isValidKanji(char: string, kanjiData: KanjiEntry[]): boolean {
  return kanjiData.some((k) => k.character === char);
}

/**
 * Look up a kanji entry by character.
 */
export function lookupKanji(
  char: string,
  kanjiData: KanjiEntry[],
): KanjiEntry | undefined {
  return kanjiData.find((k) => k.character === char);
}
