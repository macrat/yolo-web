"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type {
  NakamawakeGameState,
  NakamawakeGameStats,
  NakamawakeGroup,
  NakamawakePuzzle,
  NakamawakeScheduleEntry,
} from "@/games/nakamawake/_lib/types";
import {
  checkGuess,
  isOneAway,
  shuffleArray,
  getAllWords,
} from "@/games/nakamawake/_lib/engine";
import { getTodaysPuzzle, formatDateJST } from "@/games/nakamawake/_lib/daily";
import {
  loadStats,
  saveStats,
  loadHistory,
  loadTodayGame,
  saveTodayGame,
} from "@/games/nakamawake/_lib/storage";
import puzzleDataJson from "@/games/nakamawake/data/nakamawake-data.json";
import scheduleJson from "@/games/nakamawake/data/nakamawake-schedule.json";
import GameHeader from "./GameHeader";
import WordGrid from "./WordGrid";
import SolvedGroups from "./SolvedGroups";
import GameControls from "./GameControls";
import ResultModal from "./ResultModal";
import StatsModal from "./StatsModal";
import HowToPlayModal from "./HowToPlayModal";
import styles from "./GameContainer.module.css";

const MAX_MISTAKES = 4;
const FIRST_VISIT_KEY = "nakamawake-first-visit";

/**
 * Top-level client component that orchestrates the entire Nakamawake game state.
 * Loads puzzle data, determines today's puzzle, manages selections and guesses,
 * handles win/loss, and persists state to localStorage.
 */
export default function GameContainer() {
  const puzzleData = puzzleDataJson as NakamawakePuzzle[];
  const schedule = scheduleJson as NakamawakeScheduleEntry[];

  const todaysPuzzle = useMemo(
    () => getTodaysPuzzle(puzzleData, schedule),
    [puzzleData, schedule],
  );

  const todayStr = useMemo(() => formatDateJST(new Date()), []);

  const dateDisplayString = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(new Date());
  }, []);

  const [gameState, setGameState] = useState<NakamawakeGameState>(() => {
    // Try to restore today's game from localStorage
    const saved = loadTodayGame(todayStr);
    if (saved) {
      // Rebuild state from saved history
      const solvedGroups: NakamawakeGroup[] = [];
      for (const diff of saved.solvedGroups) {
        const group = todaysPuzzle.puzzle.groups.find(
          (g) => g.difficulty === diff,
        );
        if (group) solvedGroups.push(group);
      }
      const solvedWords = new Set(solvedGroups.flatMap((g) => g.words));
      const allWords = getAllWords(todaysPuzzle.puzzle);
      const remainingWords = allWords.filter((w) => !solvedWords.has(w));

      return {
        puzzleDate: todayStr,
        puzzleNumber: todaysPuzzle.puzzleNumber,
        puzzle: todaysPuzzle.puzzle,
        solvedGroups,
        mistakes: saved.mistakes,
        status: saved.status,
        selectedWords: [],
        remainingWords: shuffleArray(remainingWords),
        guessHistory: [],
      };
    }

    return {
      puzzleDate: todayStr,
      puzzleNumber: todaysPuzzle.puzzleNumber,
      puzzle: todaysPuzzle.puzzle,
      solvedGroups: [],
      mistakes: 0,
      status: "playing",
      selectedWords: [],
      remainingWords: shuffleArray(getAllWords(todaysPuzzle.puzzle)),
      guessHistory: [],
    };
  });

  const [stats, setStats] = useState<NakamawakeGameStats>(() => loadStats());
  const [showResult, setShowResult] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(() => {
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

  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Track the previous game status to detect transitions to won/lost
  const prevStatusRef = useRef(gameState.status);
  useEffect(() => {
    if (prevStatusRef.current === "playing" && gameState.status !== "playing") {
      const timer = setTimeout(() => setShowResult(true), 600);
      prevStatusRef.current = gameState.status;
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status]);

  /**
   * Toggle word selection (max 4).
   */
  const handleWordToggle = useCallback(
    (word: string) => {
      if (gameState.status !== "playing") return;
      setFeedbackMessage("");

      setGameState((prev) => {
        const isSelected = prev.selectedWords.includes(word);
        let newSelected: string[];
        if (isSelected) {
          newSelected = prev.selectedWords.filter((w) => w !== word);
        } else {
          if (prev.selectedWords.length >= 4) return prev;
          newSelected = [...prev.selectedWords, word];
        }
        return { ...prev, selectedWords: newSelected };
      });
    },
    [gameState.status],
  );

  /**
   * Check current selection of 4 words.
   */
  const handleCheck = useCallback(() => {
    if (gameState.status !== "playing") return;
    if (gameState.selectedWords.length !== 4) return;

    const matchedGroup = checkGuess(
      gameState.selectedWords,
      gameState.puzzle,
      gameState.solvedGroups,
    );

    if (matchedGroup) {
      // Correct guess
      const newSolvedGroups = [...gameState.solvedGroups, matchedGroup];
      const newRemainingWords = gameState.remainingWords.filter(
        (w) => !matchedGroup.words.includes(w),
      );
      const newGuessHistory = [
        ...gameState.guessHistory,
        { words: [...gameState.selectedWords], correct: true },
      ];
      const newStatus = newSolvedGroups.length === 4 ? "won" : "playing";

      const newState: NakamawakeGameState = {
        ...gameState,
        solvedGroups: newSolvedGroups,
        remainingWords: newRemainingWords,
        selectedWords: [],
        guessHistory: newGuessHistory,
        status: newStatus as "playing" | "won" | "lost",
      };
      setGameState(newState);
      setFeedbackMessage("\u6B63\u89E3!");
      setTimeout(() => setFeedbackMessage(""), 1500);

      // Save progress
      saveTodayGame(todayStr, {
        solvedGroups: newSolvedGroups.map((g) => g.difficulty),
        mistakes: gameState.mistakes,
        status: newStatus as "won" | "lost",
      });

      // Update stats on win
      if (newStatus === "won") {
        const updatedStats = { ...stats };
        updatedStats.gamesPlayed += 1;
        updatedStats.gamesWon += 1;
        updatedStats.mistakeDistribution[gameState.mistakes] += 1;

        // Update streaks
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateJST(yesterday);
        const history = loadHistory();
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
        updatedStats.lastPlayedDate = todayStr;

        setStats(updatedStats);
        saveStats(updatedStats);
      }
    } else {
      // Incorrect guess
      const newMistakes = gameState.mistakes + 1;
      const oneAway = isOneAway(
        gameState.selectedWords,
        gameState.puzzle,
        gameState.solvedGroups,
      );
      const newGuessHistory = [
        ...gameState.guessHistory,
        { words: [...gameState.selectedWords], correct: false },
      ];
      const newStatus = newMistakes >= MAX_MISTAKES ? "lost" : "playing";

      const newState: NakamawakeGameState = {
        ...gameState,
        mistakes: newMistakes,
        selectedWords: [],
        guessHistory: newGuessHistory,
        status: newStatus as "playing" | "won" | "lost",
      };
      setGameState(newState);

      if (oneAway) {
        setFeedbackMessage("\u3042\u30681\u3064!");
      } else {
        setFeedbackMessage("");
      }
      setTimeout(() => setFeedbackMessage(""), 2000);

      // Save on loss
      if (newStatus === "lost") {
        saveTodayGame(todayStr, {
          solvedGroups: gameState.solvedGroups.map((g) => g.difficulty),
          mistakes: newMistakes,
          status: "lost",
        });

        const updatedStats = { ...stats };
        updatedStats.gamesPlayed += 1;
        updatedStats.mistakeDistribution[newMistakes] += 1;
        updatedStats.currentStreak = 0;
        updatedStats.lastPlayedDate = todayStr;

        setStats(updatedStats);
        saveStats(updatedStats);
      }
    }
  }, [gameState, todayStr, stats]);

  /**
   * Shuffle remaining words.
   */
  const handleShuffle = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      remainingWords: shuffleArray(prev.remainingWords),
    }));
  }, []);

  /**
   * Clear current selection.
   */
  const handleDeselectAll = useCallback(() => {
    setFeedbackMessage("");
    setGameState((prev) => ({
      ...prev,
      selectedWords: [],
    }));
  }, []);

  return (
    <>
      <GameHeader
        puzzleNumber={gameState.puzzleNumber}
        dateString={dateDisplayString}
        onHelpClick={() => setShowHowToPlay(true)}
        onStatsClick={() => setShowStats(true)}
      />
      <SolvedGroups groups={gameState.solvedGroups} />
      <WordGrid
        words={gameState.remainingWords}
        selectedWords={gameState.selectedWords}
        onWordToggle={handleWordToggle}
        disabled={gameState.status !== "playing"}
      />
      <div className={styles.mistakeIndicator}>
        {"\u25CF".repeat(gameState.mistakes)}
        {"\u25CB".repeat(MAX_MISTAKES - gameState.mistakes)} {"\u30DF\u30B9"}{" "}
        {gameState.mistakes}/{MAX_MISTAKES}
      </div>
      {feedbackMessage && (
        <div className={styles.feedback}>{feedbackMessage}</div>
      )}
      <GameControls
        onCheck={handleCheck}
        onShuffle={handleShuffle}
        onDeselectAll={handleDeselectAll}
        disabled={gameState.status !== "playing"}
        canCheck={gameState.selectedWords.length === 4}
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
      />
    </>
  );
}
