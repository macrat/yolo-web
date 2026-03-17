/**
 * GET /api/kanji-kanaru/hints
 *
 * Returns hint information (stroke count, reading counts) and the puzzle number
 * for a given date and difficulty. The target kanji character itself is never
 * exposed through this endpoint.
 */

import { NextResponse } from "next/server";
import type {
  KanjiEntry,
  Difficulty,
  PuzzleScheduleEntry,
} from "@/play/games/kanji-kanaru/_lib/types";
import { DIFFICULTY_GRADE_MAX } from "@/play/games/kanji-kanaru/_lib/types";
import { getTodaysPuzzle } from "@/play/games/kanji-kanaru/_lib/daily";
import kanjiDataJson from "@/data/kanji-data.json";
import beginnerSchedule from "@/play/games/kanji-kanaru/data/puzzle-schedule-beginner.json";
import intermediateSchedule from "@/play/games/kanji-kanaru/data/puzzle-schedule-intermediate.json";
import advancedSchedule from "@/play/games/kanji-kanaru/data/puzzle-schedule-advanced.json";

/** All 2,136 kanji entries. */
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

/** Response type for the hints endpoint. */
interface HintsResponse {
  puzzleNumber: number;
  hints: {
    strokeCount: number;
    onYomiCount: number;
    kunYomiCount: number;
  };
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

  const pool = filterByDifficulty(allKanjiData, difficulty as Difficulty);
  const schedule = schedulesByDifficulty[difficulty as Difficulty];
  // Create a Date object from the date string for getTodaysPuzzle
  const dateObj = new Date(date + "T00:00:00+09:00");
  const { kanji, puzzleNumber } = getTodaysPuzzle(pool, schedule, dateObj);

  const response: HintsResponse = {
    puzzleNumber,
    hints: {
      strokeCount: kanji.strokeCount,
      onYomiCount: kanji.onYomi.length,
      kunYomiCount: kanji.kunYomi.length,
    },
  };

  return NextResponse.json(response);
}
