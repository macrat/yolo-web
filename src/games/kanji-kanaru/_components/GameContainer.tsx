"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useAchievements } from "@/lib/achievements/useAchievements";
import { trackContentEnd } from "@/lib/analytics";
import type {
  Difficulty,
  GameState,
  GameStats,
  KanjiEntry,
  EvaluateResponse,
  HintsResponse,
} from "@/games/kanji-kanaru/_lib/types";
import { MAX_GUESSES } from "@/games/kanji-kanaru/_lib/types";
import { formatDateJST } from "@/games/kanji-kanaru/_lib/daily";
import {
  migrateToV2,
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
} from "@/games/kanji-kanaru/_lib/storage";
import { JOYO_KANJI_SET } from "@/games/kanji-kanaru/data/joyo-kanji-set";
import GameHeader from "./GameHeader";
import HintBar from "./HintBar";
import GameBoard from "./GameBoard";
import GuessInput from "./GuessInput";
import ResultModal from "./ResultModal";
import StatsModal from "./StatsModal";
import HowToPlayModal from "./HowToPlayModal";
import styles from "./GameContainer.module.css";

const FIRST_VISIT_KEY = "kanji-kanaru-first-visit";
const DIFFICULTY_KEY = "kanji-kanaru-difficulty";

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
 * Fetch hints (puzzle number + hint data) from the server API.
 */
async function fetchHints(
  date: string,
  difficulty: Difficulty,
): Promise<HintsResponse> {
  const res = await fetch(
    `/api/kanji-kanaru/hints?date=${encodeURIComponent(date)}&difficulty=${encodeURIComponent(difficulty)}`,
  );
  if (!res.ok) {
    throw new Error(`Hints API error: ${res.status}`);
  }
  return (await res.json()) as HintsResponse;
}

/**
 * Submit a guess to the server evaluation API.
 */
async function fetchEvaluate(
  guess: string,
  puzzleDate: string,
  difficulty: Difficulty,
  guessNumber: number,
): Promise<EvaluateResponse> {
  const res = await fetch("/api/kanji-kanaru/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess, puzzleDate, difficulty, guessNumber }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      (errorBody as { error?: string }).error ??
        `Evaluate API error: ${res.status}`,
    );
  }
  return (await res.json()) as EvaluateResponse;
}

/**
 * Top-level client component that orchestrates the entire game state.
 * Fetches hints from the server API, manages guesses via the evaluate API,
 * and persists state to localStorage. The target kanji is never exposed
 * to the client until the game ends.
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Hints data from API (separate from gameState to avoid needing targetKanji)
  const [hintsData, setHintsData] = useState<HintsResponse | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    puzzleDate: todayStr,
    puzzleNumber: 0,
    targetKanji: null,
    guesses: [],
    status: "playing",
  });

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
   * Initialize the game: fetch hints from API and restore saved state.
   */
  const initializeGame = useCallback(
    async (diff: Difficulty) => {
      setLoading(true);
      setError(null);

      try {
        const hints = await fetchHints(todayStr, diff);
        setHintsData(hints);

        // Try to restore from localStorage
        const saved = loadTodayGame(todayStr, diff);
        if (saved) {
          // Restore from saved feedbacks (loadTodayGame already discards
          // old saves without feedbacks, so saved.feedbacks is guaranteed)
          let targetKanji: KanjiEntry | null = null;
          if (saved.status === "won" || saved.status === "lost") {
            // Re-evaluate the last guess to get targetKanji from API
            const lastResponse = await fetchEvaluate(
              saved.guesses[saved.guesses.length - 1],
              todayStr,
              diff,
              saved.guesses.length,
            );
            if (lastResponse.targetKanji) {
              targetKanji = lastResponse.targetKanji as KanjiEntry;
            }
          }

          setGameState({
            puzzleDate: todayStr,
            puzzleNumber: hints.puzzleNumber,
            targetKanji,
            guesses: saved.feedbacks!,
            status: saved.status,
          });
        } else {
          // Fresh game
          setGameState({
            puzzleDate: todayStr,
            puzzleNumber: hints.puzzleNumber,
            targetKanji: null,
            guesses: [],
            status: "playing",
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "\u30B2\u30FC\u30E0\u306E\u521D\u671F\u5316\u306B\u5931\u6557\u3057\u307E\u3057\u305F",
        );
      } finally {
        setLoading(false);
      }
    },
    [todayStr],
  );

  // Initialize on mount and when difficulty changes
  useEffect(() => {
    void initializeGame(difficulty);
  }, [difficulty, initializeGame]);

  /**
   * Handle difficulty change: save preference and re-initialize.
   */
  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      if (newDifficulty === difficulty) return;
      saveDifficulty(newDifficulty);
      setDifficulty(newDifficulty);
      setStats(loadStats(newDifficulty));
      setShowResult(false);
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
      recordPlay("kanji-kanaru");
      trackContentEnd("kanji-kanaru", "game", gameState.status === "won");
      hasRecordedPlayRef.current = true;
    }
    prevStatusForRecordRef.current = gameState.status;
  }, [gameState.status, recordPlay]);

  /**
   * Handle a guess submission.
   * Returns an error message string if invalid, or null on success.
   * Now async: validates locally, then calls the server evaluate API.
   */
  const handleGuess = useCallback(
    async (input: string): Promise<string | null> => {
      if (gameState.status !== "playing") return null;
      if (submitting) return null;

      // Validate: single character
      if ([...input].length !== 1) {
        return "\u6F22\u5B57\u30921\u6587\u5B57\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
      }

      // Validate: is a joyo kanji (lightweight client-side check)
      if (!JOYO_KANJI_SET.has(input)) {
        return "\u5E38\u7528\u6F22\u5B57\u3067\u306F\u3042\u308A\u307E\u305B\u3093";
      }

      // Validate: not a duplicate
      if (gameState.guesses.some((g) => g.guess === input)) {
        return "\u3053\u306E\u6F22\u5B57\u306F\u3059\u3067\u306B\u5165\u529B\u3057\u307E\u3057\u305F";
      }

      setSubmitting(true);
      try {
        const guessNumber = gameState.guesses.length + 1;
        const response = await fetchEvaluate(
          input,
          todayStr,
          difficulty,
          guessNumber,
        );

        const newGuesses = [...gameState.guesses, response.feedback];

        // Determine new status from API response
        const isLastGuess = guessNumber >= MAX_GUESSES;
        let newStatus: GameState["status"] = "playing";
        if (response.isCorrect) {
          newStatus = "won";
        } else if (isLastGuess) {
          newStatus = "lost";
        }

        // Get targetKanji from API response (only on game end)
        const targetKanji = response.targetKanji
          ? (response.targetKanji as KanjiEntry)
          : gameState.targetKanji;

        const newState: GameState = {
          ...gameState,
          guesses: newGuesses,
          status: newStatus,
          targetKanji,
        };
        setGameState(newState);

        // Persist game to localStorage (including feedbacks)
        const guessChars = newGuesses.map((g) => g.guess);
        const history = loadHistory(difficulty);
        history[todayStr] = {
          guesses: guessChars,
          feedbacks: newGuesses,
          status: newStatus,
          guessCount: guessChars.length,
        };
        saveHistory(history, difficulty);

        // Update stats on game end
        if (newStatus !== "playing") {
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
      } catch (err) {
        return err instanceof Error
          ? err.message
          : "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002";
      } finally {
        setSubmitting(false);
      }
    },
    [gameState, difficulty, todayStr, stats, submitting],
  );

  const lastGuessCount =
    gameState.status === "won" ? gameState.guesses.length : undefined;

  // Loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} aria-hidden="true" />
        <span>{"\u8AAD\u307F\u8FBC\u307F\u4E2D..."}</span>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className={styles.error}>
        <p className={styles.errorMessage}>{error}</p>
        <button
          onClick={() => void initializeGame(difficulty)}
          type="button"
          className={styles.retryButton}
        >
          {"\u518D\u8A66\u884C"}
        </button>
      </div>
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
        strokeCount={hintsData?.hints.strokeCount ?? 0}
        readingCount={hintsData?.hints.onYomiCount ?? 0}
        kunYomiCount={hintsData?.hints.kunYomiCount ?? 0}
      />
      <GameBoard guesses={gameState.guesses} maxGuesses={MAX_GUESSES} />
      <GuessInput
        onSubmit={handleGuess}
        disabled={gameState.status !== "playing" || submitting}
        submitting={submitting}
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
