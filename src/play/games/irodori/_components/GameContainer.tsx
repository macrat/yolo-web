"use client";

import { trackContentEnd } from "@/lib/analytics";
import {
  type CSSProperties,
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
  HISTORY_KEY,
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
import { revealControl } from "@/lib/reveal";
import { SHARE_LABELS } from "@/lib/share-labels";
import {
  releaseSavedLayout,
  resultAreaNames,
  savedLayoutScript,
} from "@/play/games/shared/_lib/savedLayout";
import ReservedResultArea from "@/play/games/shared/_components/ReservedResultArea";
import { useIsServerRendered } from "@/components/hooks/useIsServerRendered";
import NextPuzzleTime from "@/play/games/shared/_components/NextPuzzleTime";
import NextGameBanner from "@/play/games/shared/_components/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/CrossCategoryBanner";
import ColorPair from "./ColorPair";
import HslSliders from "./HslSliders";
import RoundResult from "./RoundResult";
import FinalResult from "./FinalResult";
import HowToPlay from "./HowToPlay";
import styles from "./GameContainer.module.css";

const RESULT_AREA = resultAreaNames("irodori");

/** 端末に今日の記録があるとき、本体の前のスクリプトが書く値の名前。値は、記録を戻すまで盤を見せない visibility。 */
const SAVED_DAY_PROPERTY = "--irodori-saved-day";

const SAVED_LAYOUT_STYLE_ID = "irodori-saved-layout";

/**
 * サーバーの HTML で本体の前に置くスクリプト。
 * - 解き終えた回: 前に同じ画面で描いた結果の区画の高さを本体を描く前に取っておき、読み込むあいだ1問目の盤を
 *   見せない。
 * - 途中の回: 盤の高さはどの問でも同じなので場所は取らず、記録を戻すまで、サーバーが描いた1問目の進み具合と
 *   見本とスライダーを、場所を取ったまま見せない（違う問の盤を見せない）。
 */
const SAVED_LAYOUT_SCRIPT = savedLayoutScript({
  styleId: SAVED_LAYOUT_STYLE_ID,
  historyKeyPrefix: HISTORY_KEY,
  finishedStatuses: ["completed"],
  resultArea: RESULT_AREA,
  byRecordLength: [
    { field: "scores", property: SAVED_DAY_PROPERTY, values: ["hidden"] },
  ],
});

/** 記録を戻すまでの盤の見せ方。記録の無い初めての来訪者では、値が無いので見せる。 */
const RESTORING_STYLE: CSSProperties = {
  visibility:
    `var(${SAVED_DAY_PROPERTY}, visible)` as CSSProperties["visibility"],
};

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

/** 端末に今日の記録があれば、その所から続ける回。無ければ initial のまま。 */
function restoredState(
  initial: IrodoriGameState,
  colors: IrodoriColor[],
): IrodoriGameState {
  const saved = loadTodayGame(initial.puzzleDate);
  if (!saved) return initial;
  const completed = saved.status === "completed";
  return {
    ...initial,
    rounds: restoreRounds(colors, saved),
    currentRound: completed ? ROUNDS_PER_GAME : saved.currentRound,
    status: completed ? "completed" : "playing",
  };
}

/**
 * イロドリの盤。お題と作る色の見本・スライダー・決定のボタンを、ページの頭（GameLayout の h1・要約）の下に
 * 置く。5問を終えると、見本とスライダーの所に結果のボックスが来る（DESIGN.md §8）。
 *
 * サーバーの HTML は初めて遊ぶ来訪者の1問目で描く。端末に今日の記録があれば、水和のあとにその所から続ける。
 * 解き終えた回は、本体の前のスクリプトが結果の区画の場所を取っておくので、結果が出ても下が動かない。
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

  // サーバーの HTML を水和で引き継ぐときは、サーバーと同じ初めの回で描き、端末の記録は水和のあとに当てる。
  // ほかのページから移ってきて（「戻る」を含む）ブラウザで新しく描くときは、初めから端末の記録の回で描く。
  // ブラウザが戻す送りの位置に、前に見ていた盤か結果がそのまま来る。
  const isServerRendered = useIsServerRendered();
  const [gameState, setGameState] = useState<IrodoriGameState>(() => {
    const initial: IrodoriGameState = {
      puzzleDate: todayStr,
      puzzleNumber,
      rounds: newRounds(colors),
      currentRound: 0,
      status: "playing",
      initialSliderValues,
    };
    return isServerRendered ? initial : restoredState(initial, colors);
  });
  const [stats, setStats] = useState<IrodoriGameStats | null>(() =>
    isServerRendered ? null : loadStats(),
  );
  const startValues =
    initialSliderValues[Math.min(gameState.currentRound, ROUNDS_PER_GAME - 1)];
  const [sliderH, setSliderH] = useState(startValues.h);
  const [sliderS, setSliderS] = useState(startValues.s);
  const [sliderL, setSliderL] = useState(startValues.l);
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

  // 取っておいた場所の値は、このページから離れるときに外す。
  useEffect(() => () => releaseSavedLayout(SAVED_LAYOUT_STYLE_ID), []);

  // 水和で引き継いだ回には、端末の記録を水和が済んでから当てる。
  useEffect(() => {
    if (stats !== null) return;
    const restored = restoredState(gameState, colors);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 端末の記録（外のもの）を水和のあとに読む
    setGameState(restored);
    if (restored.status === "playing") setSliders(restored.currentRound);
    setStats(loadStats());
  }, [stats, gameState, colors, setSliders]);

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

    // 水和の直後で端末の成績をまだ読んでいなければ、ここで読む。
    const previous = stats ?? loadStats();

    const gamesPlayed = previous.gamesPlayed + 1;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateJST(yesterday);
    const playedYesterday =
      previous.lastPlayedDate === yesterdayStr &&
      loadHistory()[yesterdayStr]?.status === "completed";
    const currentStreak = playedYesterday ? previous.currentStreak + 1 : 1;
    const scoreDistribution = [...previous.scoreDistribution];
    scoreDistribution[scoreBucketIndex(totalScore)] += 1;
    const updatedStats: IrodoriGameStats = {
      gamesPlayed,
      averageScore:
        (previous.averageScore * previous.gamesPlayed + totalScore) /
        gamesPlayed,
      bestScore: Math.max(previous.bestScore, totalScore),
      currentStreak,
      maxStreak: Math.max(previous.maxStreak, currentStreak),
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
  // 端末の記録を当て終えたか（成績を読むのは記録を当てるときと同じ）。
  const restored = stats !== null;
  const round = gameState.rounds[gameState.currentRound];
  const madeColor =
    phase === "judged" && round?.answer
      ? `hsl(${round.answer.h}, ${round.answer.s}%, ${round.answer.l}%)`
      : `hsl(${sliderH}, ${sliderS}%, ${sliderL}%)`;

  return (
    <>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: SAVED_LAYOUT_SCRIPT }}
        />
      )}
      <div className={styles.stack}>
        <ReservedResultArea
          names={RESULT_AREA}
          showsResult={completed && stats !== null}
          date={todayStr}
        >
          {!completed && (
            <div style={restored ? undefined : RESTORING_STYLE}>
              <ProgressBar
                current={gameState.currentRound + 1}
                total={ROUNDS_PER_GAME}
                label="問の進み具合"
              />
            </div>
          )}
          <div className={styles.stack}>
            {!completed && round && (
              <div
                className={styles.board}
                style={restored ? undefined : RESTORING_STYLE}
              >
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
                        phrases={["次の", "問題へ"]}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {completed && stats && (
              <>
                <FinalResult
                  gameState={gameState}
                  stats={stats}
                  appear={resultAppears}
                  boxRef={resultBoxRef}
                />
                <ResultShare
                  gameState={gameState}
                  onSaveImage={handleSaveImage}
                />
                <NextPuzzleTime />
                <NextGameBanner currentGameSlug="irodori" />
                <CrossCategoryBanner items={crossCategoryItems} />
              </>
            )}
          </div>
        </ReservedResultArea>
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
        <Button
          onClick={onSaveImage}
          phrases={SHARE_LABELS.saveImage.phrases}
        />
      </ShareButtons>
    </section>
  );
}
