/**
 * POST /api/kanji-kanaru/evaluate
 *
 * Server-side evaluation of a kanji guess. The target kanji is determined
 * on the server from the puzzle date and difficulty, so it is never exposed
 * to the client during gameplay. Target kanji details are only returned
 * when the game ends (correct guess or final turn).
 */

import { NextResponse } from "next/server";
import type {
  KanjiEntry,
  Difficulty,
  GuessFeedback,
  PuzzleScheduleEntry,
} from "@/play/games/kanji-kanaru/_lib/types";
import {
  DIFFICULTY_GRADE_MAX,
  MAX_GUESSES,
} from "@/play/games/kanji-kanaru/_lib/types";
import {
  evaluateGuess,
  lookupKanji,
} from "@/play/games/kanji-kanaru/_lib/engine";
import { getTodaysPuzzle } from "@/play/games/kanji-kanaru/_lib/daily";
import kanjiDataJson from "@/data/kanji-data.json";
import beginnerSchedule from "@/play/games/kanji-kanaru/data/puzzle-schedule-beginner.json";
import intermediateSchedule from "@/play/games/kanji-kanaru/data/puzzle-schedule-intermediate.json";
import advancedSchedule from "@/play/games/kanji-kanaru/data/puzzle-schedule-advanced.json";

/** All 2,136 kanji entries for guess lookup (any kanji can be guessed). */
const allKanjiData = kanjiDataJson as KanjiEntry[];

/** Puzzle schedules indexed by difficulty. */
const schedulesByDifficulty: Record<Difficulty, PuzzleScheduleEntry[]> = {
  beginner: beginnerSchedule as PuzzleScheduleEntry[],
  intermediate: intermediateSchedule as PuzzleScheduleEntry[],
  advanced: advancedSchedule as PuzzleScheduleEntry[],
};

/** Valid difficulty values for request validation. */
const VALID_DIFFICULTIES = new Set<string>([
  "beginner",
  "intermediate",
  "advanced",
]);

/** Date format regex: YYYY-MM-DD */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Response type for an in-progress game. */
interface EvaluateResponsePlaying {
  feedback: GuessFeedback;
  isCorrect: false;
}

/** Subset of KanjiEntry fields returned to the client on game end. */
interface TargetKanjiInfo {
  character: string;
  onYomi: string[];
  kunYomi: string[];
  meanings: string[];
  examples: string[];
}

/** Response type for a completed game (correct guess or final turn). */
interface EvaluateResponseGameOver {
  feedback: GuessFeedback;
  isCorrect: boolean;
  targetKanji: TargetKanjiInfo;
}

/**
 * Filter kanji data by difficulty (grade constraint).
 */
function filterByDifficulty(
  data: KanjiEntry[],
  difficulty: Difficulty,
): KanjiEntry[] {
  const maxGrade = DIFFICULTY_GRADE_MAX[difficulty];
  return data.filter((k) => k.grade <= maxGrade);
}

/**
 * Resolve the target kanji for a given date and difficulty.
 */
function resolveTarget(
  puzzleDate: string,
  difficulty: Difficulty,
): { kanji: KanjiEntry; puzzleNumber: number } {
  const pool = filterByDifficulty(allKanjiData, difficulty);
  const schedule = schedulesByDifficulty[difficulty];
  // Create a Date object from the puzzle date string for getTodaysPuzzle
  const date = new Date(puzzleDate + "T00:00:00+09:00");
  return getTodaysPuzzle(pool, schedule, date);
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate request shape
  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 },
    );
  }

  const { guess, puzzleDate, difficulty, guessNumber } = body as Record<
    string,
    unknown
  >;

  // Validate guess: must be a single character string
  if (typeof guess !== "string" || [...guess].length !== 1) {
    return NextResponse.json(
      { error: "guess must be a single character" },
      { status: 400 },
    );
  }

  // Validate puzzleDate: must match YYYY-MM-DD format
  if (typeof puzzleDate !== "string" || !DATE_REGEX.test(puzzleDate)) {
    return NextResponse.json(
      { error: "puzzleDate must be a valid date string (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  // Validate difficulty
  if (typeof difficulty !== "string" || !VALID_DIFFICULTIES.has(difficulty)) {
    return NextResponse.json(
      { error: "difficulty must be one of: beginner, intermediate, advanced" },
      { status: 400 },
    );
  }

  // Validate guessNumber: must be a positive integer
  if (
    typeof guessNumber !== "number" ||
    !Number.isInteger(guessNumber) ||
    guessNumber < 1 ||
    guessNumber > MAX_GUESSES
  ) {
    return NextResponse.json(
      { error: `guessNumber must be an integer between 1 and ${MAX_GUESSES}` },
      { status: 400 },
    );
  }

  // Look up the guessed kanji in the full dataset
  const guessEntry = lookupKanji(guess, allKanjiData);
  if (!guessEntry) {
    return NextResponse.json(
      { error: "Guessed character is not a valid joyo kanji" },
      { status: 400 },
    );
  }

  // Resolve the target kanji for this puzzle
  const { kanji: targetKanji } = resolveTarget(
    puzzleDate as string,
    difficulty as Difficulty,
  );

  // Compute feedback
  const feedback = evaluateGuess(guessEntry, targetKanji);
  const isCorrect = guess === targetKanji.character;
  const isGameOver = isCorrect || guessNumber >= MAX_GUESSES;

  if (isGameOver) {
    const response: EvaluateResponseGameOver = {
      feedback,
      isCorrect,
      targetKanji: {
        character: targetKanji.character,
        onYomi: targetKanji.onYomi,
        kunYomi: targetKanji.kunYomi,
        meanings: targetKanji.meanings,
        examples: targetKanji.examples,
      },
    };
    return NextResponse.json(response);
  }

  const response: EvaluateResponsePlaying = {
    feedback,
    isCorrect: false,
  };
  return NextResponse.json(response);
}
