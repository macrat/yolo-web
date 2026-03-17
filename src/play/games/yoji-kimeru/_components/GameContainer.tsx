"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useAchievements } from "@/lib/achievements/useAchievements";
import { trackContentEnd } from "@/lib/analytics";
import type {
  Difficulty,
  YojiGameState,
  YojiGameStats,
  YojiGuessFeedback,
  YojiEntry,
  YojiPuzzleScheduleEntry,
} from "@/play/games/yoji-kimeru/_lib/types";
import { MAX_GUESSES } from "@/play/games/yoji-kimeru/_lib/types";
import {
  evaluateGuess,
  isValidYojiInput,
} from "@/play/games/yoji-kimeru/_lib/engine";
import {
  getTodaysPuzzle,
  formatDateJST,
} from "@/play/games/yoji-kimeru/_lib/daily";
import {
  migrateToV2,
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
} from "@/play/games/yoji-kimeru/_lib/storage";
import yojiDataJson from "@/data/yoji-data.json";
import GameHeader from "./GameHeader";
import HintBar from "./HintBar";
import GameBoard from "./GameBoard";
import GuessInput from "./GuessInput";
import ResultModal from "./ResultModal";
import StatsModal from "./StatsModal";
import HowToPlayModal from "./HowToPlayModal";

const FIRST_VISIT_KEY = "yoji-kimeru-first-visit";
const DIFFICULTY_KEY = "yoji-kimeru-difficulty";

/**
 * Dynamically load the puzzle schedule for a given difficulty.
 * Only the selected difficulty's schedule is loaded to minimize bundle size.
 */
async function loadSchedule(
  difficulty: Difficulty,
): Promise<YojiPuzzleScheduleEntry[]> {
  switch (difficulty) {
    case "beginner": {
      const mod =
        await import("@/play/games/yoji-kimeru/data/yoji-schedule-beginner.json");
      return mod.default as YojiPuzzleScheduleEntry[];
    }
    case "intermediate": {
      const mod =
        await import("@/play/games/yoji-kimeru/data/yoji-schedule-intermediate.json");
      return mod.default as YojiPuzzleScheduleEntry[];
    }
    case "advanced": {
      const mod =
        await import("@/play/games/yoji-kimeru/data/yoji-schedule-advanced.json");
      return mod.default as YojiPuzzleScheduleEntry[];
    }
  }
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
 * Initialize a game state from a puzzle and optionally saved data.
 */
function initGameState(
  todayStr: string,
  puzzle: { yoji: YojiEntry; puzzleNumber: number },
  difficulty: Difficulty,
): YojiGameState {
  const saved = loadTodayGame(todayStr, difficulty);
  if (saved) {
    const guesses: YojiGuessFeedback[] = [];
    for (const guessStr of saved.guesses) {
      guesses.push(evaluateGuess(guessStr, puzzle.yoji.yoji));
    }
    return {
      puzzleDate: todayStr,
      puzzleNumber: puzzle.puzzleNumber,
      targetYoji: puzzle.yoji,
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
    puzzleNumber: puzzle.puzzleNumber,
    targetYoji: puzzle.yoji,
    guesses: [],
    status: "playing",
  };
}

/**
 * Top-level client component that orchestrates the entire game state.
 * Loads yoji data, determines today's puzzle based on difficulty,
 * manages guesses, handles win/loss, and persists state to localStorage.
 */
export default function GameContainer() {
  const { recordPlay } = useAchievements();

  // Run migration once on mount to preserve existing players' data
  useEffect(() => {
    migrateToV2();
  }, []);

  const yojiData = yojiDataJson as YojiEntry[];

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
  const [loading, setLoading] = useState(true);

  const [gameState, setGameState] = useState<YojiGameState>({
    puzzleDate: todayStr,
    puzzleNumber: 0,
    targetYoji: yojiData[0],
    guesses: [],
    status: "playing",
  });

  const [stats, setStats] = useState<YojiGameStats>(() =>
    loadStats(difficulty),
  );
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
   * Load schedule and initialize game for a given difficulty.
   */
  const initializeGame = useCallback(
    async (diff: Difficulty) => {
      setLoading(true);
      try {
        const schedule = await loadSchedule(diff);
        const puzzle = getTodaysPuzzle(yojiData, schedule, diff);
        const state = initGameState(todayStr, puzzle, diff);
        setGameState(state);
        setStats(loadStats(diff));
        setShowResult(false);
      } finally {
        setLoading(false);
      }
    },
    [yojiData, todayStr],
  );

  // Initialize on mount and when difficulty changes
  useEffect(() => {
    void initializeGame(difficulty);
  }, [difficulty, initializeGame]);

  /**
   * Handle difficulty change: save preference and trigger re-initialization.
   */
  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      if (newDifficulty === difficulty) return;
      saveDifficulty(newDifficulty);
      setDifficulty(newDifficulty);
    },
    [difficulty],
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
      recordPlay("yoji-kimeru");
      trackContentEnd("yoji-kimeru", "game", gameState.status === "won");
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

      // Validate: exactly 4 kanji characters
      if (!isValidYojiInput(input)) {
        return "\u6F22\u5B574\u6587\u5B57\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
      }

      // Validate: not a duplicate
      if (gameState.guesses.some((g) => g.guess === input)) {
        return "\u3053\u306E\u7D44\u307F\u5408\u308F\u305B\u306F\u3059\u3067\u306B\u5165\u529B\u3057\u307E\u3057\u305F";
      }

      // Evaluate the guess
      const feedback = evaluateGuess(input, gameState.targetYoji.yoji);
      const newGuesses = [...gameState.guesses, feedback];

      // Determine new status
      const isCorrect = input === gameState.targetYoji.yoji;
      const isLastGuess = newGuesses.length >= MAX_GUESSES;
      let newStatus: YojiGameState["status"] = "playing";
      if (isCorrect) {
        newStatus = "won";
      } else if (isLastGuess) {
        newStatus = "lost";
      }

      const newState: YojiGameState = {
        ...gameState,
        guesses: newGuesses,
        status: newStatus,
      };
      setGameState(newState);

      // Persist game to localStorage
      const guessStrs = newGuesses.map((g) => g.guess);
      if (newStatus === "playing") {
        // Save in-progress game
        const history = loadHistory(difficulty);
        history[todayStr] = {
          guesses: guessStrs,
          status: "playing",
          guessCount: guessStrs.length,
        };
        saveHistory(history, difficulty);
      }

      // Update stats and history on game end
      if (newStatus !== "playing") {
        const history = loadHistory(difficulty);
        history[todayStr] = {
          guesses: guessStrs,
          status: newStatus,
          guessCount: guessStrs.length,
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
          // Check if previous day was also played and won
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

  // Show loading state while schedule is being loaded
  if (loading) {
    return (
      <>
        <GameHeader
          puzzleNumber={0}
          dateString={dateDisplayString}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          onHelpClick={() => setShowHowToPlay(true)}
          onStatsClick={() => setShowStats(true)}
        />
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "var(--color-text-muted)",
          }}
        >
          読み込み中...
        </div>
      </>
    );
  }

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
        guessCount={gameState.guesses.length}
        reading={gameState.targetYoji.reading}
        category={gameState.targetYoji.category}
        origin={gameState.targetYoji.origin}
        difficulty={gameState.targetYoji.difficulty}
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
