"use client";

import { trackContentEnd } from "@/lib/analytics";
import {
  useState,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import type {
  IrodoriColor,
  IrodoriGameHistory,
  IrodoriGameState,
  IrodoriGameStats,
  IrodoriRound,
} from "@/play/games/irodori/_lib/types";
import {
  formatDateJST,
  getInitialSliderValues,
  ROUNDS_PER_GAME,
} from "@/play/games/irodori/_lib/daily";
import {
  colorDifference,
  calculateRoundScore,
  calculateTotalScore,
  scoreBucketIndex,
} from "@/play/games/irodori/_lib/engine";
import {
  loadStats,
  saveStats,
  loadHistory,
  loadTodayGame,
  saveTodayGame,
} from "@/play/games/irodori/_lib/storage";
import {
  generateShareText,
  generateResultImage,
  downloadImage,
} from "@/play/games/irodori/_lib/share";
import type { ItemListItem } from "@/components/ItemList";
import Button from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import ShareButtons from "@/components/ShareButtons";
import { revealControl } from "@/play/games/shared/_lib/revealControl";
import NextPuzzleTime from "@/play/games/shared/_components/new/NextPuzzleTime";
import NextGameBanner from "@/play/games/shared/_components/new/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/new/CrossCategoryBanner";
import ColorPair from "./ColorPair";
import HslSliders from "./HslSliders";
import RoundResult from "./RoundResult";
import FinalResult from "./FinalResult";
import HowToPlay from "./HowToPlay";
import styles from "./GameContainer.module.css";

interface GameContainerProps {
  colors: IrodoriColor[];
  puzzleNumber: number;
  /** Today's date string in "YYYY-MM-DD" format (JST), generated server-side. */
  todayStr: string;
  /** Human-readable date string for display (e.g. "2026年3月19日"), generated server-side. */
  dateDisplayString: string;
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: ItemListItem[];
}

/**
 * 問を解いているあいだの段階。"play" は色を作っているあいだ、"judged" は色を決めて、その問の判定を見ている
 * あいだ（最後の問のあとは、判定の代わりに結果が出る）。
 */
type RoundPhase = "play" | "judged";

/** 操作のあと、次に使うものへフォーカスを移す先。 */
type FocusTarget = "next" | "sliders" | "result";

function newRounds(colors: IrodoriColor[]): IrodoriRound[] {
  return colors.map((color) => ({
    target: color,
    answer: null,
    deltaE: null,
    score: null,
  }));
}

/** 端末に残した今日の記録から、遊んでいた所の盤を作り直す。 */
function restoreRounds(
  colors: IrodoriColor[],
  saved: IrodoriGameHistory[string],
): IrodoriRound[] {
  return colors.map((color, index) => ({
    target: color,
    answer: saved.answers?.[index] ?? null,
    deltaE: null,
    score: saved.scores[index] ?? null,
  }));
}

/**
 * イロドリの盤。お題と作る色の見本・スライダー・決定のボタンを、ページの頭（GameLayout の h1・要約）の下に
 * 置く。5問を終えると、見本とスライダーの所に結果のボックスが来る（DESIGN.md §8）。
 *
 * サーバーの HTML は初めて遊ぶ来訪者の1問目で描く。端末に今日の記録があれば、描いたあとにその所から続ける。
 * 記録は端末にしか無いので、サーバーで描く盤と最初の描画を同じにして、水和で食い違わないようにする。
 */
export default function GameContainer({
  colors,
  puzzleNumber,
  todayStr,
  dateDisplayString,
  crossCategoryItems,
}: GameContainerProps) {
  const initialSliderValues = useMemo(
    () => getInitialSliderValues(todayStr, ROUNDS_PER_GAME),
    [todayStr],
  );

  const [gameState, setGameState] = useState<IrodoriGameState>(() => ({
    puzzleDate: todayStr,
    puzzleNumber,
    rounds: newRounds(colors),
    currentRound: 0,
    status: "playing",
    initialSliderValues,
  }));
  const [stats, setStats] = useState<IrodoriGameStats>(() => loadStats());
  const [sliderH, setSliderH] = useState(initialSliderValues[0].h);
  const [sliderS, setSliderS] = useState(initialSliderValues[0].s);
  const [sliderL, setSliderL] = useState(initialSliderValues[0].l);
  const [phase, setPhase] = useState<RoundPhase>("play");
  // 結果のボックスの登場の動きは、最後の問を決めた操作で現れたときだけ持つ（§11）。
  const [resultAppears, setResultAppears] = useState(false);

  const firstSliderRef = useRef<HTMLInputElement>(null);
  const decideButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const resultBoxRef = useRef<HTMLElement>(null);
  const pendingFocusRef = useRef<FocusTarget | null>(null);
  const roundResultId = useId();

  const setSliders = useCallback(
    (roundIndex: number) => {
      const values = initialSliderValues[roundIndex];
      if (!values) return;
      setSliderH(values.h);
      setSliderS(values.s);
      setSliderL(values.l);
    },
    [initialSliderValues],
  );

  useEffect(() => {
    const saved = loadTodayGame(todayStr);
    if (!saved) return;
    const completed = saved.status === "completed";
    // 端末の記録はサーバーで読めないので、水和のあとに一度だけ遊んでいた所へ移す。
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 端末の記録を読むのは水和のあとだけ
    setGameState((prev) => ({
      ...prev,
      rounds: restoreRounds(colors, saved),
      currentRound: completed ? ROUNDS_PER_GAME : saved.currentRound,
      status: completed ? "completed" : "playing",
    }));
    if (!completed) setSliders(saved.currentRound);
    setStats(loadStats());
  }, [colors, todayStr, setSliders]);

  // 操作のあと、次に使うものへフォーカスを移し、画面の外にあれば即時に送る（§8・§11）。
  useEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    if (target === "next" && nextButtonRef.current) {
      nextButtonRef.current.focus({ preventScroll: true });
      revealControl(nextButtonRef.current);
    } else if (target === "sliders" && firstSliderRef.current) {
      firstSliderRef.current.focus({ preventScroll: true });
      if (decideButtonRef.current) revealControl(decideButtonRef.current);
    } else if (target === "result" && resultBoxRef.current) {
      resultBoxRef.current.scrollIntoView?.({
        behavior: "instant",
        block: "start",
      });
      resultBoxRef.current.focus({ preventScroll: true });
    }
  }, [phase, gameState.currentRound, gameState.status]);

  const handleDecide = useCallback(() => {
    if (gameState.status !== "playing") return;

    const roundIndex = gameState.currentRound;
    const round = gameState.rounds[roundIndex];
    const deltaE = colorDifference(
      round.target.h,
      round.target.s,
      round.target.l,
      sliderH,
      sliderS,
      sliderL,
    );
    const score = calculateRoundScore(deltaE);
    const rounds = gameState.rounds.map((r, i) =>
      i === roundIndex
        ? {
            ...r,
            answer: { h: sliderH, s: sliderS, l: sliderL },
            deltaE,
            score,
          }
        : r,
    );
    const isLastRound = roundIndex === ROUNDS_PER_GAME - 1;
    const scores = rounds.map((r) => r.score);
    const totalScore = isLastRound
      ? calculateTotalScore(scores.map((s) => s ?? 0))
      : null;

    // 問ごとに残し、途中で閉じても次に開いたとき続きから遊べるようにする。
    saveTodayGame(todayStr, {
      scores,
      answers: rounds.map((r) => r.answer),
      totalScore,
      currentRound: isLastRound ? ROUNDS_PER_GAME : roundIndex + 1,
      status: isLastRound ? "completed" : "playing",
    });

    if (totalScore === null) {
      setGameState({ ...gameState, rounds });
      setPhase("judged");
      pendingFocusRef.current = "next";
      return;
    }

    const gamesPlayed = stats.gamesPlayed + 1;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateJST(yesterday);
    const playedYesterday =
      stats.lastPlayedDate === yesterdayStr &&
      loadHistory()[yesterdayStr]?.status === "completed";
    const currentStreak = playedYesterday ? stats.currentStreak + 1 : 1;
    const scoreDistribution = [...stats.scoreDistribution];
    scoreDistribution[scoreBucketIndex(totalScore)] += 1;
    const updatedStats: IrodoriGameStats = {
      gamesPlayed,
      averageScore:
        (stats.averageScore * stats.gamesPlayed + totalScore) / gamesPlayed,
      bestScore: Math.max(stats.bestScore, totalScore),
      currentStreak,
      maxStreak: Math.max(stats.maxStreak, currentStreak),
      lastPlayedDate: todayStr,
      scoreDistribution,
    };
    setStats(updatedStats);
    saveStats(updatedStats);

    setGameState({
      ...gameState,
      rounds,
      currentRound: ROUNDS_PER_GAME,
      status: "completed",
    });
    setResultAppears(true);
    pendingFocusRef.current = "result";
    trackContentEnd("irodori", "game", true);
  }, [gameState, sliderH, sliderS, sliderL, todayStr, stats]);

  const handleNextRound = useCallback(() => {
    const nextRound = gameState.currentRound + 1;
    if (nextRound >= ROUNDS_PER_GAME) return;
    setGameState((prev) => ({ ...prev, currentRound: nextRound }));
    setSliders(nextRound);
    setPhase("play");
    pendingFocusRef.current = "sliders";
  }, [gameState.currentRound, setSliders]);

  const handleSaveImage = useCallback(() => {
    const dataUrl = generateResultImage(gameState);
    if (dataUrl) {
      downloadImage(dataUrl, `irodori-${gameState.puzzleNumber}.png`);
    }
  }, [gameState]);

  const completed = gameState.status === "completed";
  const round = gameState.rounds[gameState.currentRound];
  const madeColor =
    phase === "judged" && round?.answer
      ? `hsl(${round.answer.h}, ${round.answer.s}%, ${round.answer.l}%)`
      : `hsl(${sliderH}, ${sliderS}%, ${sliderL}%)`;

  return (
    <>
      <ProgressBar
        current={Math.min(gameState.currentRound + 1, ROUNDS_PER_GAME)}
        total={ROUNDS_PER_GAME}
        label="問の進み具合"
      />
      <div className={styles.stack}>
        {!completed && round && (
          <div className={styles.board}>
            <ColorPair target={round.target.hex} made={madeColor} />
            {phase === "play" ? (
              <>
                <HslSliders
                  h={sliderH}
                  s={sliderS}
                  l={sliderL}
                  onHChange={setSliderH}
                  onSChange={setSliderS}
                  onLChange={setSliderL}
                  firstSliderRef={firstSliderRef}
                />
                <div className={styles.action}>
                  <Button
                    ref={decideButtonRef}
                    variant="primary"
                    onClick={handleDecide}
                  >
                    決定
                  </Button>
                </div>
              </>
            ) : (
              <>
                <RoundResult round={round} id={roundResultId} />
                <div className={styles.action}>
                  <Button
                    ref={nextButtonRef}
                    variant="primary"
                    onClick={handleNextRound}
                    aria-describedby={roundResultId}
                  >
                    次の問題へ
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {completed && (
          <>
            <FinalResult
              gameState={gameState}
              stats={stats}
              appear={resultAppears}
              boxRef={resultBoxRef}
            />
            <ResultShare gameState={gameState} onSaveImage={handleSaveImage} />
            <NextPuzzleTime />
            <NextGameBanner currentGameSlug="irodori" />
            <CrossCategoryBanner items={crossCategoryItems} />
          </>
        )}

        <HowToPlay />
        <p className={styles.date}>
          {dateDisplayString}の問題（#{gameState.puzzleNumber}）
        </p>
      </div>
    </>
  );
}

interface ResultShareProps {
  gameState: IrodoriGameState;
  onSaveImage: () => void;
}

/** 結果を持ち帰る・共有する区画。結果のボックスのすぐ下に置く（§8）。 */
function ResultShare({ gameState, onSaveImage }: ResultShareProps) {
  const headingId = useId();
  return (
    <section className={styles.share} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.shareHeading}>
        この結果を共有
      </h2>
      <ShareButtons
        url="/play/irodori"
        title="イロドリ"
        text={generateShareText(gameState)}
        sns={["x", "line", "copy"]}
        contentType="game"
        contentId="irodori"
        surface="text"
      >
        <Button onClick={onSaveImage}>画像を保存</Button>
      </ShareButtons>
    </section>
  );
}
