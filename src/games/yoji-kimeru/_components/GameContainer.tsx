"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type {
  YojiGameState,
  YojiGameStats,
  YojiGuessFeedback,
  YojiEntry,
  YojiPuzzleScheduleEntry,
} from "@/games/yoji-kimeru/_lib/types";
import {
  evaluateGuess,
  isValidYojiInput,
} from "@/games/yoji-kimeru/_lib/engine";
import { getTodaysPuzzle, formatDateJST } from "@/games/yoji-kimeru/_lib/daily";
import {
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
} from "@/games/yoji-kimeru/_lib/storage";
import yojiDataJson from "@/data/yoji-data.json";
import yojiScheduleJson from "@/games/yoji-kimeru/data/yoji-schedule.json";
import GameHeader from "./GameHeader";
import HintBar from "./HintBar";
import GameBoard from "./GameBoard";
import GuessInput from "./GuessInput";
import ResultModal from "./ResultModal";
import StatsModal from "./StatsModal";
import HowToPlayModal from "./HowToPlayModal";

const MAX_GUESSES = 6;
const FIRST_VISIT_KEY = "yoji-kimeru-first-visit";

/**
 * Top-level client component that orchestrates the entire game state.
 * Loads yoji data, determines today's puzzle, manages guesses,
 * handles win/loss, and persists state to localStorage.
 */
export default function GameContainer() {
  const yojiData = yojiDataJson as YojiEntry[];
  const puzzleSchedule = yojiScheduleJson as YojiPuzzleScheduleEntry[];

  const todaysPuzzle = useMemo(
    () => getTodaysPuzzle(yojiData, puzzleSchedule),
    [yojiData, puzzleSchedule],
  );

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

  const [gameState, setGameState] = useState<YojiGameState>(() => {
    // Try to restore today's game from localStorage
    const saved = loadTodayGame(todayStr);
    if (saved) {
      // Rebuild YojiGuessFeedback[] from saved guess strings
      const guesses: YojiGuessFeedback[] = [];
      for (const guessStr of saved.guesses) {
        guesses.push(evaluateGuess(guessStr, todaysPuzzle.yoji.yoji));
      }
      return {
        puzzleDate: todayStr,
        puzzleNumber: todaysPuzzle.puzzleNumber,
        targetYoji: todaysPuzzle.yoji,
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
      targetYoji: todaysPuzzle.yoji,
      guesses: [],
      status: "playing",
    };
  });

  const [stats, setStats] = useState<YojiGameStats>(() => loadStats());
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

  /**
   * Handle a guess submission.
   * Returns an error message string if invalid, or null on success.
   */
  const handleGuess = useCallback(
    (input: string): string | null => {
      if (gameState.status !== "playing") return null;

      // Validate: exactly 4 kanji characters
      if (!isValidYojiInput(input)) {
        return "漢字4文字を入力してください";
      }

      // Validate: not a duplicate
      if (gameState.guesses.some((g) => g.guess === input)) {
        return "この組み合わせはすでに入力しました";
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
        const history = loadHistory();
        history[todayStr] = {
          guesses: guessStrs,
          status: "lost", // Placeholder; overwritten on completion
          guessCount: guessStrs.length,
        };
        saveHistory(history);
      }

      // Update stats and history on game end
      if (newStatus !== "playing") {
        const history = loadHistory();
        history[todayStr] = {
          guesses: guessStrs,
          status: newStatus,
          guessCount: guessStrs.length,
        };
        saveHistory(history);

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
        saveStats(updatedStats);
      }

      return null;
    },
    [gameState, todayStr, stats],
  );

  const lastGuessCount =
    gameState.status === "won" ? gameState.guesses.length : undefined;

  return (
    <>
      <GameHeader
        puzzleNumber={gameState.puzzleNumber}
        dateString={dateDisplayString}
        onHelpClick={() => setShowHowToPlay(true)}
        onStatsClick={() => setShowStats(true)}
      />
      <HintBar
        guessCount={gameState.guesses.length}
        reading={gameState.targetYoji.reading}
        category={gameState.targetYoji.category}
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
