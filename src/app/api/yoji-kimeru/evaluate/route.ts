/**
 * POST /api/yoji-kimeru/evaluate
 *
 * Server-side evaluation of a yoji (4-character kanji compound) guess.
 * The target yoji is determined on the server from the puzzle date and
 * difficulty, so it is never exposed to the client during gameplay.
 * Target yoji details are only returned when the game ends (correct guess
 * or final turn).
 */

import { NextResponse } from "next/server";
import type {
  YojiEntry,
  Difficulty,
  YojiGuessFeedback,
  YojiPuzzleScheduleEntry,
  YojiCategory,
  YojiOrigin,
  YojiStructure,
} from "@/play/games/yoji-kimeru/_lib/types";
import { MAX_GUESSES } from "@/play/games/yoji-kimeru/_lib/types";
import {
  evaluateGuess,
  isValidYojiInput,
} from "@/play/games/yoji-kimeru/_lib/engine";
import { getTodaysPuzzle } from "@/play/games/yoji-kimeru/_lib/daily";
import yojiDataJson from "@/data/yoji-data.json";
import beginnerSchedule from "@/play/games/yoji-kimeru/data/yoji-schedule-beginner.json";
import intermediateSchedule from "@/play/games/yoji-kimeru/data/yoji-schedule-intermediate.json";
import advancedSchedule from "@/play/games/yoji-kimeru/data/yoji-schedule-advanced.json";

/** All yoji entries used for puzzle resolution. */
const allYojiData = yojiDataJson as YojiEntry[];

/** Puzzle schedules indexed by difficulty. */
const schedulesByDifficulty: Record<Difficulty, YojiPuzzleScheduleEntry[]> = {
  beginner: beginnerSchedule as YojiPuzzleScheduleEntry[],
  intermediate: intermediateSchedule as YojiPuzzleScheduleEntry[],
  advanced: advancedSchedule as YojiPuzzleScheduleEntry[],
};

/** Valid difficulty values for request validation. */
const VALID_DIFFICULTIES = new Set<string>([
  "beginner",
  "intermediate",
  "advanced",
]);

/** Date format regex: YYYY-MM-DD */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Subset of YojiEntry fields returned to the client on game end. */
interface TargetYojiInfo {
  yoji: string;
  reading: string;
  meaning: string;
  category: YojiCategory;
  origin: YojiOrigin;
  difficulty: 1 | 2 | 3;
  structure: YojiStructure;
  sourceUrl: string;
}

/** Response type for an in-progress game. */
interface EvaluateResponsePlaying {
  feedback: YojiGuessFeedback;
  isCorrect: false;
}

/** Response type for a completed game (correct guess or final turn). */
interface EvaluateResponseGameOver {
  feedback: YojiGuessFeedback;
  isCorrect: boolean;
  targetYoji: TargetYojiInfo;
}

/**
 * Resolve the target yoji for a given date and difficulty.
 */
function resolveTarget(
  puzzleDate: string,
  difficulty: Difficulty,
): { yoji: YojiEntry; puzzleNumber: number } {
  const schedule = schedulesByDifficulty[difficulty];
  // Create a Date object from the puzzle date string (JST midnight)
  const date = new Date(puzzleDate + "T00:00:00+09:00");
  return getTodaysPuzzle(allYojiData, schedule, difficulty, date);
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

  // Validate guess: must be a string passing isValidYojiInput (4 kanji characters)
  if (typeof guess !== "string" || !isValidYojiInput(guess)) {
    return NextResponse.json(
      { error: "guess must be a valid 4-character kanji string" },
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

  // Validate guessNumber: must be an integer between 1 and MAX_GUESSES
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

  // Resolve the target yoji for this puzzle
  const { yoji: targetYoji } = resolveTarget(
    puzzleDate as string,
    difficulty as Difficulty,
  );

  // Compute feedback: evaluateGuess takes (guess string, target string)
  const feedback = evaluateGuess(guess, targetYoji.yoji);

  // Determine if the guess is correct (all 4 characters are "correct")
  const isCorrect = feedback.charFeedbacks.every((fb) => fb === "correct");
  const isGameOver = isCorrect || guessNumber >= MAX_GUESSES;

  if (isGameOver) {
    const response: EvaluateResponseGameOver = {
      feedback,
      isCorrect,
      targetYoji: {
        yoji: targetYoji.yoji,
        reading: targetYoji.reading,
        meaning: targetYoji.meaning,
        category: targetYoji.category,
        origin: targetYoji.origin,
        difficulty: targetYoji.difficulty,
        structure: targetYoji.structure,
        sourceUrl: targetYoji.sourceUrl,
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
