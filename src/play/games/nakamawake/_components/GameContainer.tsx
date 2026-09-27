"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { trackContentEnd } from "@/lib/analytics";
import ShareButtons from "@/components/ShareButtons";
import type { ItemListItem } from "@/components/ItemList";
import type {
  NakamawakeGameState,
  NakamawakeGameStats,
  NakamawakeGroup,
  NakamawakePuzzle,
} from "@/play/games/nakamawake/_lib/types";
import {
  checkGuess,
  isOneAway,
  shuffleArray,
  getAllWords,
  difficultyLabel,
} from "@/play/games/nakamawake/_lib/engine";
import { formatDateJST } from "@/play/games/nakamawake/_lib/daily";
import {
  loadStats,
  saveStats,
  loadHistory,
  loadTodayGame,
  saveTodayGame,
  HISTORY_KEY,
} from "@/play/games/nakamawake/_lib/storage";
import { generateShareText } from "@/play/games/nakamawake/_lib/share";
import { revealControl } from "@/play/games/shared/_lib/revealControl";
import {
  resultAreaNames,
  savedLayoutScript,
} from "@/play/games/shared/_lib/savedLayout";
import ReservedResultArea from "@/play/games/shared/_components/new/ReservedResultArea";
import { useIsServerRendered } from "@/components/hooks/useIsServerRendered";
import NextPuzzleTime from "@/play/games/shared/_components/new/NextPuzzleTime";
import NextGameBanner from "@/play/games/shared/_components/new/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/new/CrossCategoryBanner";
import WordGrid from "./WordGrid";
import SolvedGroups from "./SolvedGroups";
import GameControls from "./GameControls";
import GameResult from "./GameResult";
import HowToPlay from "./HowToPlay";
import styles from "./GameContainer.module.css";

const MAX_MISTAKES = 4;
const RESULT_AREA = resultAreaNames("nakamawake");

/**
 * サーバーの HTML で本体の前に置くスクリプト。端末に記録した今日の回が解き終えた回なら、前に同じ画面で描いた
 * 盤と結果の区画の高さを、本体を描く前に取っておき、読み込むあいだ語の格子と操作を見せない。取っておいた高さは
 * 描いた盤と結果の区画の高さと同じなので、外さない。
 */
const SAVED_LAYOUT_SCRIPT = savedLayoutScript({
  styleId: "nakamawake-saved-layout",
  historyKeyPrefix: HISTORY_KEY,
  resultArea: RESULT_AREA,
});

interface GameContainerProps {
  puzzle: NakamawakePuzzle;
  puzzleNumber: number;
  /** 今日の日付（日本時間、"YYYY-MM-DD"）。サーバーで作る。 */
  todayStr: string;
  /** 今日の日付の日本語の書き方（「2026年3月19日」）。サーバーで作る。 */
  dateDisplayString: string;
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: ItemListItem[];
}

/**
 * 操作のあとに送る画面の先。描いたあと（layout effect）で、新しい並びに合わせて送る。
 * - "selected": 4つ目の語を選んだ。チェックのボタンと、選んだ4語を画面に入れる。
 * - "checked": 解き終える前のチェック。当てた組か残りのミスの字と、語の格子の最初の行を画面に入れる。
 * - "finished": 解き終えたチェック。結果のボックスの頭を画面に入れ、フォーカスをボックスへ移す。
 */
type PendingReveal =
  | { kind: "selected" }
  | { kind: "checked"; correct: boolean; focusGrid: boolean }
  | { kind: "finished" };

function initialState(
  puzzle: NakamawakePuzzle,
  puzzleNumber: number,
  todayStr: string,
): NakamawakeGameState {
  return {
    puzzleDate: todayStr,
    puzzleNumber,
    puzzle,
    solvedGroups: [],
    mistakes: 0,
    status: "playing",
    selectedWords: [],
    // サーバーの HTML と同じ並びで描き、並べ替えは水和のあとに行う。
    remainingWords: getAllWords(puzzle).sort(),
  };
}

/**
 * 端末に保存した今日の回を、並べ替えた語の並びで戻す。今日の回が無ければ、語を並べ替えただけの初めの状態。
 */
function restoredState(state: NakamawakeGameState): NakamawakeGameState {
  const saved = loadTodayGame(state.puzzleDate);
  if (!saved) {
    return { ...state, remainingWords: shuffleArray(state.remainingWords) };
  }
  const solvedGroups = saved.solvedGroups
    .map((difficulty) =>
      state.puzzle.groups.find((group) => group.difficulty === difficulty),
    )
    .filter((group): group is NakamawakeGroup => group !== undefined);
  const solvedWords = new Set(solvedGroups.flatMap((group) => group.words));
  return {
    ...state,
    solvedGroups,
    mistakes: saved.mistakes,
    status: saved.status,
    remainingWords: shuffleArray(
      getAllWords(state.puzzle).filter((word) => !solvedWords.has(word)),
    ),
  };
}

/** 端末の今の画面の上端と下端（DESIGN.md §8。文字盤で狭まった範囲で測る）。 */
function visibleRange(): { top: number; bottom: number } {
  const viewport = window.visualViewport;
  return viewport
    ? { top: viewport.offsetTop, bottom: viewport.offsetTop + viewport.height }
    : { top: 0, bottom: window.innerHeight };
}

/** 結果のボックスの頭（結果の名前の行）が画面から出ていれば、ボックスの上端を画面の上端のそばまで即時に送る。 */
function revealResultHead(box: HTMLElement): void {
  const head = box.firstElementChild ?? box;
  const range = visibleRange();
  const boxTop = box.getBoundingClientRect().top;
  const headBottom = head.getBoundingClientRect().bottom;
  if (boxTop >= range.top && headBottom <= range.bottom) return;
  // フォーカスのリングがボックスの外に出るので、その幅と間隔ぶん上に余白を取る。
  const margin = 16;
  window.scrollBy({ top: boxTop - range.top - margin, behavior: "instant" });
}

/**
 * ナカマワケの遊ぶ区画。盤（当てた組と語の格子）・操作・結果・くわしい遊び方・問題の日付を、この順に
 * 縦に積む。解き終えたら、語の格子と操作の所に結果のボックスが来る（DESIGN.md §8）。
 */
export default function GameContainer({
  puzzle,
  puzzleNumber,
  todayStr,
  dateDisplayString,
  crossCategoryItems,
}: GameContainerProps) {
  // サーバーの HTML を水和で引き継ぐときは、サーバーと同じ初めの回で描き、端末の記録は水和のあとに当てる。
  // ほかのページから移ってきて（「戻る」を含む）ブラウザで新しく描くときは、初めから端末の記録の回で描く。
  // ブラウザが戻す送りの位置に、前に見ていた結果がそのまま来る。
  const isServerRendered = useIsServerRendered();
  const [gameState, setGameState] = useState<NakamawakeGameState>(() => {
    const initial = initialState(puzzle, puzzleNumber, todayStr);
    return isServerRendered ? initial : restoredState(initial);
  });
  const [stats, setStats] = useState<NakamawakeGameStats | null>(() =>
    isServerRendered ? null : loadStats(),
  );
  // 端末の記録を読み、語を並べ替えるまでは、語の格子・残りのミスの字・操作を場所を取ったまま見せない。
  // サーバーの並びと初めの回の字が一瞬見えてから、端末の回に替わらないため。
  const [isReady, setIsReady] = useState(!isServerRendered);
  // この回の最後のチェックで解き終えたか。開いたときにすでに解き終えていた結果は、登場の動きを持たない。
  const [finishedByPlay, setFinishedByPlay] = useState(false);
  const [feedback, setFeedback] = useState("");

  const gridRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const latestSolvedRef = useRef<HTMLLIElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const pendingReveal = useRef<PendingReveal | null>(null);

  // 水和で引き継いだ回には、端末の記録と語の並べ替えを水和が済んでから当てる。
  useEffect(() => {
    if (isReady) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 端末の記録（外のもの）を水和のあとに読む
    setGameState((prev) => restoredState(prev));
    setStats(loadStats());
    setIsReady(true);
  }, [isReady]);

  useLayoutEffect(() => {
    const pending = pendingReveal.current;
    if (!pending) return;
    pendingReveal.current = null;
    if (pending.kind === "selected") {
      const firstSelected = gridRef.current?.querySelector(
        '[aria-pressed="true"]',
      );
      if (checkRef.current) {
        revealControl(checkRef.current, firstSelected ?? undefined);
      }
      return;
    }
    if (pending.kind === "checked") {
      const firstWord = gridRef.current?.querySelector("button");
      const context = pending.correct ? latestSolvedRef.current : firstWord;
      if (statusRef.current) {
        revealControl(statusRef.current, context ?? undefined);
      }
      // チェックのボタンは選んだ語が消えて押せなくなり、フォーカスが行き場を失うので、次に使う語の格子へ移す。
      // マウスで押したあとのプログラムからのフォーカスには、リングが出ない（:focus-visible）。
      if (pending.focusGrid) firstWord?.focus({ preventScroll: true });
      return;
    }
    const box = resultRef.current;
    if (box) {
      revealResultHead(box);
      box.focus({ preventScroll: true });
    }
  }, [gameState]);

  const handleWordToggle = useCallback((word: string) => {
    setFeedback("");
    setGameState((prev) => {
      if (prev.status !== "playing") return prev;
      const isSelected = prev.selectedWords.includes(word);
      if (!isSelected && prev.selectedWords.length >= 4) return prev;
      const selectedWords = isSelected
        ? prev.selectedWords.filter((w) => w !== word)
        : [...prev.selectedWords, word];
      if (selectedWords.length === 4) {
        pendingReveal.current = { kind: "selected" };
      }
      return { ...prev, selectedWords };
    });
  }, []);

  const recordFinish = useCallback(
    (won: boolean, mistakes: number) => {
      const current = stats ?? loadStats();
      const updated: NakamawakeGameStats = {
        ...current,
        gamesPlayed: current.gamesPlayed + 1,
        gamesWon: current.gamesWon + (won ? 1 : 0),
        mistakeDistribution: current.mistakeDistribution.map((count, i) =>
          i === mistakes ? count + 1 : count,
        ),
        lastPlayedDate: todayStr,
      };
      if (won) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDateJST(yesterday);
        const wonYesterday =
          current.lastPlayedDate === yesterdayStr &&
          loadHistory()[yesterdayStr]?.status === "won";
        updated.currentStreak = wonYesterday ? current.currentStreak + 1 : 1;
        updated.maxStreak = Math.max(current.maxStreak, updated.currentStreak);
      } else {
        updated.currentStreak = 0;
      }
      setStats(updated);
      saveStats(updated);
      setFinishedByPlay(true);
      trackContentEnd("nakamawake", "game", won);
    },
    [stats, todayStr],
  );

  const handleCheck = useCallback(() => {
    if (gameState.status !== "playing") return;
    if (gameState.selectedWords.length !== 4) return;

    // チェックのボタンにフォーカスがあったか。キーボードで押したときと、押したボタンにフォーカスを移すブラウザで
    // マウスで押したときに真になる。
    const focusGrid = document.activeElement === checkRef.current;
    const matchedGroup = checkGuess(
      gameState.selectedWords,
      gameState.puzzle,
      gameState.solvedGroups,
    );
    let next: NakamawakeGameState;
    if (matchedGroup) {
      const solvedGroups = [...gameState.solvedGroups, matchedGroup];
      next = {
        ...gameState,
        solvedGroups,
        remainingWords: gameState.remainingWords.filter(
          (w) => !matchedGroup.words.includes(w),
        ),
        selectedWords: [],
        status: solvedGroups.length === 4 ? "won" : "playing",
      };
      setFeedback(
        `正解です。${matchedGroup.name}（${difficultyLabel(matchedGroup.difficulty)}）`,
      );
    } else {
      const mistakes = gameState.mistakes + 1;
      next = {
        ...gameState,
        mistakes,
        selectedWords: [],
        status: mistakes >= MAX_MISTAKES ? "lost" : "playing",
      };
      setFeedback(
        isOneAway(
          gameState.selectedWords,
          gameState.puzzle,
          gameState.solvedGroups,
        )
          ? "おしい。4つのうち3つは同じ組です"
          : "はずれです",
      );
    }

    pendingReveal.current =
      next.status === "playing"
        ? { kind: "checked", correct: matchedGroup !== null, focusGrid }
        : { kind: "finished" };
    setGameState(next);
    // 途中の回も、開き直したときに続きから遊べるよう保存する。
    saveTodayGame(todayStr, {
      solvedGroups: next.solvedGroups.map((g) => g.difficulty),
      mistakes: next.mistakes,
      status: next.status,
    });
    if (next.status !== "playing") {
      recordFinish(next.status === "won", next.mistakes);
    }
  }, [gameState, todayStr, recordFinish]);

  const handleShuffle = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      remainingWords: shuffleArray(prev.remainingWords),
    }));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setFeedback("");
    setGameState((prev) => ({ ...prev, selectedWords: [] }));
  }, []);

  const isFinished = gameState.status !== "playing";
  const remaining = MAX_MISTAKES - gameState.mistakes;

  return (
    <>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: SAVED_LAYOUT_SCRIPT }}
        />
      )}
      <div className={styles.game}>
        <ReservedResultArea
          names={RESULT_AREA}
          showsResult={isFinished && stats !== null}
          date={todayStr}
        >
          <div className={styles.area}>
            <div className={styles.board}>
              <SolvedGroups
                groups={gameState.solvedGroups}
                latestRef={latestSolvedRef}
              />
              {!isFinished && (
                <div className={isReady ? undefined : styles.pending}>
                  <WordGrid
                    ref={gridRef}
                    words={gameState.remainingWords}
                    selectedWords={gameState.selectedWords}
                    onWordToggle={handleWordToggle}
                  />
                </div>
              )}
            </div>
            {isFinished && stats ? (
              <>
                <GameResult
                  ref={resultRef}
                  gameState={gameState}
                  stats={stats}
                  appear={finishedByPlay}
                />
                <section
                  className={styles.share}
                  aria-labelledby="nakamawake-share"
                >
                  <h3 id="nakamawake-share" className={styles.shareHeading}>
                    この結果を共有
                  </h3>
                  <ShareButtons
                    url="/play/nakamawake"
                    title="ナカマワケ"
                    text={generateShareText(gameState)}
                    sns={["x", "line", "copy"]}
                    contentType="game"
                    contentId="nakamawake"
                  />
                </section>
                <NextPuzzleTime />
                <NextGameBanner currentGameSlug="nakamawake" />
                <CrossCategoryBanner items={crossCategoryItems} />
              </>
            ) : (
              <div
                className={
                  isReady ? styles.play : `${styles.play} ${styles.pending}`
                }
              >
                <div ref={statusRef} className={styles.status} role="status">
                  <p>あと{remaining}回間違えると終わり</p>
                  {feedback && <p>{feedback}</p>}
                </div>
                <GameControls
                  onCheck={handleCheck}
                  onShuffle={handleShuffle}
                  onDeselectAll={handleDeselectAll}
                  canCheck={gameState.selectedWords.length === 4}
                  checkRef={checkRef}
                />
              </div>
            )}
          </div>
        </ReservedResultArea>
        <HowToPlay />
        <p className={styles.date}>
          {dateDisplayString}の問題 #{puzzleNumber}
        </p>
      </div>
    </>
  );
}
