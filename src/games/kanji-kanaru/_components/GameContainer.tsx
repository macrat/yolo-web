"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useAchievements } from "@/lib/achievements/useAchievements";
import type {
  Difficulty,
  GameState,
  GameStats,
  GuessFeedback,
  KanjiEntry,
  PuzzleScheduleEntry,
} from "@/games/kanji-kanaru/_lib/types";
import {
  DIFFICULTY_GRADE_MAX,
  MAX_GUESSES,
} from "@/games/kanji-kanaru/_lib/types";
import { evaluateGuess, lookupKanji } from "@/games/kanji-kanaru/_lib/engine";
import {
  getTodaysPuzzle,
  formatDateJST,
} from "@/games/kanji-kanaru/_lib/daily";
import {
  migrateToV2,
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
} from "@/games/kanji-kanaru/_lib/storage";
import kanjiDataJson from "@/data/kanji-data.json";
import beginnerScheduleJson from "@/games/kanji-kanaru/data/puzzle-schedule-beginner.json";
import intermediateScheduleJson from "@/games/kanji-kanaru/data/puzzle-schedule-intermediate.json";
import advancedScheduleJson from "@/games/kanji-kanaru/data/puzzle-schedule-advanced.json";
import GameHeader from "./GameHeader";
import HintBar from "./HintBar";
import GameBoard from "./GameBoard";
import GuessInput from "./GuessInput";
import ResultModal from "./ResultModal";
import StatsModal from "./StatsModal";
import HowToPlayModal from "./HowToPlayModal";

const FIRST_VISIT_KEY = "kanji-kanaru-first-visit";
const DIFFICULTY_KEY = "kanji-kanaru-difficulty";

/** All 2,136 kanji for lookup (any difficulty can guess any kanji). */
const allKanjiData = kanjiDataJson as KanjiEntry[];

/** Puzzle schedules by difficulty. */
const schedulesByDifficulty: Record<Difficulty, PuzzleScheduleEntry[]> = {
  beginner: beginnerScheduleJson as PuzzleScheduleEntry[],
  intermediate: intermediateScheduleJson as PuzzleScheduleEntry[],
  advanced: advancedScheduleJson as PuzzleScheduleEntry[],
};

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
 * Load the saved difficulty from localStorage, defaulting to intermediate.
 */
function loadDifficulty(): Difficulty {
  if (typeof window === "undefined") return "intermediate";
  try {
    const saved = window.localStorage.getItem(DIFFICULTY_KEY);
    if (
      saved === "beginner" ||
      saved === "intermediate" ||
      saved === "advanced"
    ) {
      return saved;
    }
  } catch {
    // Silently fail
  }
  return "intermediate";
}

/**
 * Save difficulty choice to localStorage.
 */
function saveDifficulty(difficulty: Difficulty): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch {
    // Silently fail
  }
}

/**
 * Build the initial game state for a given difficulty and date.
 */
function buildGameState(difficulty: Difficulty, todayStr: string): GameState {
  const pool = filterByDifficulty(allKanjiData, difficulty);
  const schedule = schedulesByDifficulty[difficulty];
  const todaysPuzzle = getTodaysPuzzle(pool, schedule);

  // Try to restore from localStorage
  const saved = loadTodayGame(todayStr, difficulty);
  if (saved) {
    const guesses: GuessFeedback[] = [];
    for (const guessChar of saved.guesses) {
      // Lookup against all kanji (any kanji can be guessed)
      const guessEntry = lookupKanji(guessChar, allKanjiData);
      if (guessEntry) {
        guesses.push(evaluateGuess(guessEntry, todaysPuzzle.kanji));
      }
    }
    return {
      puzzleDate: todayStr,
      puzzleNumber: todaysPuzzle.puzzleNumber,
      targetKanji: todaysPuzzle.kanji,
      guesses,
      status:
        saved.status === "won"
          ? "won"
          : saved.status === "lost"
            ? "lost"
            : "playing",
    };
  }

  return {
    puzzleDate: todayStr,
    puzzleNumber: todaysPuzzle.puzzleNumber,
    targetKanji: todaysPuzzle.kanji,
    guesses: [],
    status: "playing",
  };
}

/**
 * Top-level client component that orchestrates the entire game state.
 * Loads kanji data, determines today's puzzle, manages guesses,
 * handles win/loss, and persists state to localStorage.
 */
export default function GameContainer() {
  const { recordPlay } = useAchievements();

  // Run migration once on mount
  useEffect(() => {
    migrateToV2();
  }, []);

  const todayStr = useMemo(() => formatDateJST(new Date()), []);

  // Format the date string in Japanese for the header
  const dateDisplayString = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(new Date());
  }, []);

  const [difficulty, setDifficulty] = useState<Difficulty>(loadDifficulty);

  const [gameState, setGameState] = useState<GameState>(() =>
    buildGameState(difficulty, todayStr),
  );

  const [stats, setStats] = useState<GameStats>(() => loadStats(difficulty));
  const [showResult, setShowResult] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(() => {
    // Show HowToPlay on first visit
    if (typeof window === "undefined") return false;
    try {
      const visited = window.localStorage.getItem(FIRST_VISIT_KEY);
      if (!visited) {
        window.localStorage.setItem(FIRST_VISIT_KEY, "1");
        return true;
      }
    } catch {
      // Silently fail if localStorage unavailable
    }
    return false;
  });

  /**
   * Handle difficulty change: save preference and reset game state for new difficulty.
   */
  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      if (newDifficulty === difficulty) return;
      saveDifficulty(newDifficulty);
      setDifficulty(newDifficulty);
      setGameState(buildGameState(newDifficulty, todayStr));
      setStats(loadStats(newDifficulty));
      setShowResult(false);
    },
    [difficulty, todayStr],
  );

  // Track the previous game status to detect transitions to won/lost
  const prevStatusRef = useRef(gameState.status);
  useEffect(() => {
    if (prevStatusRef.current === "playing" && gameState.status !== "playing") {
      // Delay a bit so the last feedback animation plays first
      const timer = setTimeout(() => setShowResult(true), 600);
      prevStatusRef.current = gameState.status;
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status]);

  // Record play for achievement system when game ends (won or lost).
  const prevStatusForRecordRef = useRef(gameState.status);
  const hasRecordedPlayRef = useRef(false);
  useEffect(() => {
    if (
      !hasRecordedPlayRef.current &&
      prevStatusForRecordRef.current === "playing" &&
      (gameState.status === "won" || gameState.status === "lost")
    ) {
      recordPlay("kanji-kanaru");
      hasRecordedPlayRef.current = true;
    }
    prevStatusForRecordRef.current = gameState.status;
  }, [gameState.status, recordPlay]);

  /**
   * Handle a guess submission.
   * Returns an error message string if invalid, or null on success.
   */
  const handleGuess = useCallback(
    (input: string): string | null => {
      if (gameState.status !== "playing") return null;

      // Validate: single character
      if (input.length !== 1) {
        return "\u6F22\u5B57\u30921\u6587\u5B57\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
      }

      // Validate: is in dataset (lookup against ALL kanji, not just the pool)
      const guessEntry = lookupKanji(input, allKanjiData);
      if (!guessEntry) {
        return "\u5E38\u7528\u6F22\u5B57\u3067\u306F\u3042\u308A\u307E\u305B\u3093";
      }

      // Validate: not a duplicate
      if (gameState.guesses.some((g) => g.guess === input)) {
        return "\u3053\u306E\u6F22\u5B57\u306F\u3059\u3067\u306B\u5165\u529B\u3057\u307E\u3057\u305F";
      }

      // Evaluate the guess
      const feedback = evaluateGuess(guessEntry, gameState.targetKanji);
      const newGuesses = [...gameState.guesses, feedback];

      // Determine new status
      const isCorrect = input === gameState.targetKanji.character;
      const isLastGuess = newGuesses.length >= MAX_GUESSES;
      let newStatus: GameState["status"] = "playing";
      if (isCorrect) {
        newStatus = "won";
      } else if (isLastGuess) {
        newStatus = "lost";
      }

      const newState: GameState = {
        ...gameState,
        guesses: newGuesses,
        status: newStatus,
      };
      setGameState(newState);

      // Persist game to localStorage
      const guessChars = newGuesses.map((g) => g.guess);
      if (newStatus === "playing") {
        const history = loadHistory(difficulty);
        history[todayStr] = {
          guesses: guessChars,
          status: "playing",
          guessCount: guessChars.length,
        };
        saveHistory(history, difficulty);
      }

      // Update stats and history on game end
      if (newStatus !== "playing") {
        const history = loadHistory(difficulty);
        history[todayStr] = {
          guesses: guessChars,
          status: newStatus,
          guessCount: guessChars.length,
        };
        saveHistory(history, difficulty);

        const updatedStats = { ...stats };
        updatedStats.gamesPlayed += 1;
        if (newStatus === "won") {
          updatedStats.gamesWon += 1;
          updatedStats.guessDistribution[newGuesses.length - 1] += 1;
        }

        // Update streaks
        if (newStatus === "won") {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = formatDateJST(yesterday);
          const yesterdayGame = history[yesterdayStr];

          if (
            stats.lastPlayedDate === yesterdayStr &&
            yesterdayGame?.status === "won"
          ) {
            updatedStats.currentStreak = stats.currentStreak + 1;
          } else {
            updatedStats.currentStreak = 1;
          }
          updatedStats.maxStreak = Math.max(
            updatedStats.maxStreak,
            updatedStats.currentStreak,
          );
        } else {
          updatedStats.currentStreak = 0;
        }
        updatedStats.lastPlayedDate = todayStr;

        setStats(updatedStats);
        saveStats(updatedStats, difficulty);
      }

      return null;
    },
    [gameState, difficulty, todayStr, stats],
  );

  const lastGuessCount =
    gameState.status === "won" ? gameState.guesses.length : undefined;

  return (
    <>
      <GameHeader
        puzzleNumber={gameState.puzzleNumber}
        dateString={dateDisplayString}
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        onHelpClick={() => setShowHowToPlay(true)}
        onStatsClick={() => setShowStats(true)}
      />
      <HintBar
        strokeCount={gameState.targetKanji.strokeCount}
        readingCount={gameState.targetKanji.onYomi.length}
        kunYomiCount={gameState.targetKanji.kunYomi.length}
      />
      <GameBoard guesses={gameState.guesses} maxGuesses={MAX_GUESSES} />
      <GuessInput
        onSubmit={handleGuess}
        disabled={gameState.status !== "playing"}
      />
      <HowToPlayModal
        open={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
      <ResultModal
        open={showResult}
        onClose={() => setShowResult(false)}
        gameState={gameState}
        difficulty={difficulty}
        onStatsClick={() => {
          setShowResult(false);
          setShowStats(true);
        }}
      />
      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        lastGuessCount={lastGuessCount}
      />
    </>
  );
}
