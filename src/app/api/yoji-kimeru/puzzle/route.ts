/**
 * GET /api/yoji-kimeru/puzzle
 *
 * Returns puzzle metadata (reading, category, origin, difficulty level) and
 * the puzzle number for a given date and difficulty. The answer (yoji kanji),
 * meaning, and sourceUrl are never exposed to prevent cheating.
 */

import { NextResponse } from "next/server";
import type {
  Difficulty,
  YojiEntry,
  YojiPuzzleScheduleEntry,
  PuzzleResponse,
} from "@/play/games/yoji-kimeru/_lib/types";
import { getTodaysPuzzle } from "@/play/games/yoji-kimeru/_lib/daily";
import yojiDataJson from "@/data/yoji-data.json";
import beginnerSchedule from "@/play/games/yoji-kimeru/data/yoji-schedule-beginner.json";
import intermediateSchedule from "@/play/games/yoji-kimeru/data/yoji-schedule-intermediate.json";
import advancedSchedule from "@/play/games/yoji-kimeru/data/yoji-schedule-advanced.json";

/** All yoji entries. */
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

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const difficulty = searchParams.get("difficulty");

  // Validate date parameter
  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json(
      {
        error: "date query parameter is required and must be YYYY-MM-DD format",
      },
      { status: 400 },
    );
  }

  // Validate difficulty parameter
  if (!difficulty || !VALID_DIFFICULTIES.has(difficulty)) {
    return NextResponse.json(
      {
        error:
          "difficulty query parameter must be one of: beginner, intermediate, advanced",
      },
      { status: 400 },
    );
  }

  const schedule = schedulesByDifficulty[difficulty as Difficulty];
  // Create a Date object from the date string for getTodaysPuzzle
  const dateObj = new Date(date + "T00:00:00+09:00");
  const { yoji, puzzleNumber } = getTodaysPuzzle(
    allYojiData,
    schedule,
    difficulty as Difficulty,
    dateObj,
  );

  // Anti-cheat: exclude yoji (answer kanji), meaning, and sourceUrl
  const response: PuzzleResponse = {
    puzzleNumber,
    reading: yoji.reading,
    category: yoji.category,
    origin: yoji.origin,
    difficulty: yoji.difficulty,
  };

  return NextResponse.json(response);
}
