"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type {
  IrodoriGameState,
  IrodoriGameStats,
  IrodoriRound,
  IrodoriScheduleEntry,
} from "@/games/irodori/_lib/types";
import type { TraditionalColor } from "@/games/irodori/_lib/daily";
import {
  getTodaysPuzzle,
  formatDateJST,
  getInitialSliderValues,
  ROUNDS_PER_GAME,
} from "@/games/irodori/_lib/daily";
import {
  colorDifference,
  calculateRoundScore,
  calculateTotalScore,
} from "@/games/irodori/_lib/engine";
import {
  loadStats,
  saveStats,
  loadHistory,
  loadTodayGame,
  saveTodayGame,
} from "@/games/irodori/_lib/storage";
import traditionalColorsJson from "@/data/traditional-colors.json";
import scheduleJson from "@/games/irodori/data/irodori-schedule.json";
import GameHeader from "./GameHeader";
import ProgressBar from "./ProgressBar";
import ColorTarget from "./ColorTarget";
import HslSliders from "./HslSliders";
import RoundResult from "./RoundResult";
import ResultModal from "./ResultModal";
import StatsModal from "./StatsModal";
import HowToPlayModal from "./HowToPlayModal";
import styles from "./GameContainer.module.css";

const FIRST_VISIT_KEY = "irodori-first-visit";

/**
 * Top-level client component for the Irodori color challenge game.
 */
export default function GameContainer() {
  const traditionalColors = traditionalColorsJson as TraditionalColor[];
  const schedule = scheduleJson as IrodoriScheduleEntry[];

  const todaysPuzzle = useMemo(
    () => getTodaysPuzzle(traditionalColors, schedule),
    [traditionalColors, schedule],
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

  const initialSliderValues = useMemo(
    () => getInitialSliderValues(todayStr, ROUNDS_PER_GAME),
    [todayStr],
  );

  const [gameState, setGameState] = useState<IrodoriGameState>(() => {
    // Try to restore from localStorage
    const saved = loadTodayGame(todayStr);
    if (saved) {
      // Rebuild completed state from saved history
      const rounds: IrodoriRound[] = todaysPuzzle.colors.map((color, i) => ({
        target: color,
        answer: null, // We don't store answers in history
        deltaE: null,
        score: saved.scores[i] ?? null,
      }));

      return {
        puzzleDate: todayStr,
        puzzleNumber: todaysPuzzle.puzzleNumber,
        rounds,
        currentRound: ROUNDS_PER_GAME,
        status: "completed",
        initialSliderValues,
      };
    }

    const rounds: IrodoriRound[] = todaysPuzzle.colors.map((color) => ({
      target: color,
      answer: null,
      deltaE: null,
      score: null,
    }));

    return {
      puzzleDate: todayStr,
      puzzleNumber: todaysPuzzle.puzzleNumber,
      rounds,
      currentRound: 0,
      status: "playing",
      initialSliderValues,
    };
  });

  const [stats, setStats] = useState<IrodoriGameStats>(() => loadStats());

  // Current slider values
  const [sliderH, setSliderH] = useState(
    () => initialSliderValues[0]?.h ?? 180,
  );
  const [sliderS, setSliderS] = useState(() => initialSliderValues[0]?.s ?? 50);
  const [sliderL, setSliderL] = useState(() => initialSliderValues[0]?.l ?? 50);

  // Phase: "play" or "result" (showing round result before next round)
  const [phase, setPhase] = useState<"play" | "result">(() =>
    gameState.status === "completed" ? "result" : "play",
  );

  const [showFinalResult, setShowFinalResult] = useState(false);
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
      // Silently fail
    }
    return false;
  });

  // Show final result modal after game completion
  const prevStatusRef = useRef(gameState.status);
  useEffect(() => {
    if (
      prevStatusRef.current === "playing" &&
      gameState.status === "completed"
    ) {
      const timer = setTimeout(() => setShowFinalResult(true), 600);
      prevStatusRef.current = gameState.status;
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status]);

  /**
   * Submit the current slider values as the answer for the current round.
   */
  const handleSubmit = useCallback(() => {
    if (gameState.status !== "playing") return;

    const round = gameState.rounds[gameState.currentRound];
    const target = round.target;
    const deltaE = colorDifference(
      target.h,
      target.s,
      target.l,
      sliderH,
      sliderS,
      sliderL,
    );
    const score = calculateRoundScore(deltaE);

    const updatedRounds = [...gameState.rounds];
    updatedRounds[gameState.currentRound] = {
      ...round,
      answer: { h: sliderH, s: sliderS, l: sliderL },
      deltaE,
      score,
    };

    const isLastRound = gameState.currentRound === ROUNDS_PER_GAME - 1;
    const newStatus = isLastRound ? "completed" : "playing";

    const newState: IrodoriGameState = {
      ...gameState,
      rounds: updatedRounds,
      status: newStatus as "playing" | "completed",
    };
    setGameState(newState);
    setPhase("result");

    if (isLastRound) {
      // Save to history and update stats
      const scores = updatedRounds.map((r) => r.score ?? 0);
      const totalScore = calculateTotalScore(scores);

      saveTodayGame(todayStr, {
        scores,
        totalScore,
      });

      const updatedStats = { ...stats };
      updatedStats.gamesPlayed += 1;

      // Update average score
      const totalGamesScore =
        updatedStats.averageScore * (updatedStats.gamesPlayed - 1) + totalScore;
      updatedStats.averageScore = totalGamesScore / updatedStats.gamesPlayed;

      updatedStats.bestScore = Math.max(updatedStats.bestScore, totalScore);

      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateJST(yesterday);
      const history = loadHistory();
      const yesterdayGame = history[yesterdayStr];

      if (stats.lastPlayedDate === yesterdayStr && yesterdayGame) {
        updatedStats.currentStreak = stats.currentStreak + 1;
      } else {
        updatedStats.currentStreak = 1;
      }
      updatedStats.maxStreak = Math.max(
        updatedStats.maxStreak,
        updatedStats.currentStreak,
      );
      updatedStats.lastPlayedDate = todayStr;

      // Update score distribution
      const bucket = Math.min(Math.floor(totalScore / 10), 9);
      updatedStats.scoreDistribution[bucket] += 1;

      setStats(updatedStats);
      saveStats(updatedStats);
    }
  }, [gameState, sliderH, sliderS, sliderL, todayStr, stats]);

  /**
   * Move to the next round.
   */
  const handleNextRound = useCallback(() => {
    const nextRound = gameState.currentRound + 1;
    if (nextRound >= ROUNDS_PER_GAME) return;

    setGameState((prev) => ({
      ...prev,
      currentRound: nextRound,
    }));

    // Set slider to initial values for the next round
    const init = initialSliderValues[nextRound];
    if (init) {
      setSliderH(init.h);
      setSliderS(init.s);
      setSliderL(init.l);
    }

    setPhase("play");
  }, [gameState.currentRound, initialSliderValues]);

  const currentRound = gameState.rounds[gameState.currentRound];
  const completedRounds = gameState.rounds.filter(
    (r) => r.score !== null,
  ).length;

  return (
    <>
      <GameHeader
        puzzleNumber={gameState.puzzleNumber}
        dateString={dateDisplayString}
        onHelpClick={() => setShowHowToPlay(true)}
        onStatsClick={() => setShowStats(true)}
      />
      <ProgressBar
        currentRound={gameState.currentRound}
        totalRounds={ROUNDS_PER_GAME}
        completedRounds={completedRounds}
      />

      {gameState.status === "playing" && phase === "play" && currentRound && (
        <>
          <ColorTarget hex={currentRound.target.hex} />
          <HslSliders
            h={sliderH}
            s={sliderS}
            l={sliderL}
            onHChange={setSliderH}
            onSChange={setSliderS}
            onLChange={setSliderL}
          />
          <div className={styles.submitArea}>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              type="button"
            >
              {"\u6C7A\u5B9A"}
            </button>
          </div>
        </>
      )}

      {phase === "result" && currentRound && currentRound.score !== null && (
        <>
          <RoundResult round={currentRound} />
          {gameState.status === "playing" && (
            <div className={styles.submitArea}>
              <button
                className={styles.nextButton}
                onClick={handleNextRound}
                type="button"
              >
                {"\u6B21\u306E\u554F\u984C\u3078"}
              </button>
            </div>
          )}
        </>
      )}

      {gameState.status === "completed" && phase === "result" && (
        <div className={styles.submitArea}>
          <button
            className={styles.submitButton}
            onClick={() => setShowFinalResult(true)}
            type="button"
          >
            {"\u7D50\u679C\u3092\u898B\u308B"}
          </button>
        </div>
      )}

      <HowToPlayModal
        open={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
      <ResultModal
        open={showFinalResult}
        onClose={() => setShowFinalResult(false)}
        gameState={gameState}
        onStatsClick={() => {
          setShowFinalResult(false);
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
