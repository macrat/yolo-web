"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { trackContentEnd } from "@/lib/analytics";
import PhrasedText from "@/components/PhrasedText";
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
  dailyOrder,
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
import { isInside, revealControl, visibleRange } from "@/lib/reveal";
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
import WordGrid from "./WordGrid";
import SolvedGroups from "./SolvedGroups";
import GameControls from "./GameControls";
import GameResult from "./GameResult";
import HowToPlay from "./HowToPlay";
import styles from "./GameContainer.module.css";

const MAX_MISTAKES = 4;
const RESULT_AREA = resultAreaNames("nakamawake");
const SAVED_LAYOUT_STYLE_ID = "nakamawake-saved-layout";

/** 本体の前のスクリプトが、端末の記録で当てた組ごとに書く値の名前。 */
const SOLVED_LIST_PROPERTY = "--nakamawake-solved-list";
const SOLVED_GROUP_PREFIX = "--nakamawake-solved-group-";
const SOLVED_WORD_PREFIX = "--nakamawake-solved-word-";

/**
 * サーバーの HTML で本体の前に置くスクリプト。端末に記録した今日の回の盤を、本体を描く前に取っておく。
 * - 途中の回: 当てた組の場所と、残る語だけの格子の場所を取る（当てた組の数で決まる）。サーバーの HTML は
 *   すべての組と語を見えないまま持ち、この値で当てた組を見せる側に、その語を格子から外す側に回す。
 * - 解き終えた回: 前に同じ画面で描いた盤と結果の区画の高さを取っておき、読み込むあいだ語の格子と操作を見せ
 *   ない。
 * 取っておいた値は、このページから離れるときに外す。
 */
const SAVED_LAYOUT_SCRIPT = savedLayoutScript({
  styleId: SAVED_LAYOUT_STYLE_ID,
  historyKeyPrefix: HISTORY_KEY,
  resultArea: RESULT_AREA,
  byRecordItem: [
    {
      field: "solvedGroups",
      propertyPrefix: SOLVED_GROUP_PREFIX,
      value: "block",
    },
    {
      field: "solvedGroups",
      propertyPrefix: SOLVED_WORD_PREFIX,
      value: "none",
    },
  ],
  byRecordLength: [
    {
      field: "solvedGroups",
      property: SOLVED_LIST_PROPERTY,
      values: ["none", "flex"],
    },
  ],
});

/** 端末の記録を当てる前の、当てた組の並びの見せ方。記録で当てた組だけが場所を取る。 */
const RESERVED_SOLVED_GROUPS = {
  listDisplay: `var(${SOLVED_LIST_PROPERTY}, none)`,
  groupDisplay: (group: NakamawakeGroup) =>
    `var(${SOLVED_GROUP_PREFIX}${group.difficulty}, none)`,
};

interface GameContainerProps {
  puzzle: NakamawakePuzzle;
  puzzleNumber: number;
  /** 今日の日付（日本時間、"YYYY-MM-DD"）。サーバーで作る。 */
  todayStr: string;
  /** 今日の日付の日本語の書き方（「2026年3月19日」）。サーバーで作る。 */
  dateDisplayString: string;
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: ItemListItem[];
  /** ことわざのように句を持つ語の句の並び（語 → 句）。Server Component（page.tsx）で分けて渡す。 */
  wordPhrases: Record<string, string[]>;
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
    remainingWords: dailyOrder(getAllWords(puzzle), todayStr),
  };
}

/**
 * 端末に保存した今日の回を戻す。残る語は、その日の並び（サーバーの HTML と同じ）から当てた組の語を除いた並び。
 * 今日の回が無ければ、初めの状態のまま。
 */
function restoredState(state: NakamawakeGameState): NakamawakeGameState {
  const saved = loadTodayGame(state.puzzleDate);
  if (!saved) return state;
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
    remainingWords: dailyOrder(
      getAllWords(state.puzzle),
      state.puzzleDate,
    ).filter((word) => !solvedWords.has(word)),
  };
}

/** フォーカスを受け取った語が画面から出ていれば、リングの幅を空けて語の上端まで即時に送る。 */
function revealFocusedWord(word: HTMLElement): void {
  const range = visibleRange();
  if (isInside(word, range)) return;
  const margin = 16;
  window.scrollBy({
    top: word.getBoundingClientRect().top - range.top - margin,
    behavior: "instant",
  });
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
  wordPhrases,
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

  // 取っておいた場所の値は、このページから離れるときに外す。
  useEffect(() => () => releaseSavedLayout(SAVED_LAYOUT_STYLE_ID), []);

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
      // フォーカスを受け取る語は画面に入れる。status と語が同じ画面に入らないときは、語を先にする（status は
      // 読み上げで知らせ、目で見る分は語の格子のすぐ下にある）。マウスで押したあとのプログラムからの
      // フォーカスには、リングが出ない（:focus-visible）。
      if (pending.focusGrid && firstWord) {
        firstWord.focus({ preventScroll: true });
        revealFocusedWord(firstWord);
      }
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
  // 端末の記録を当てる前の、語のマスの見せ方。記録で当てた組の語は格子から外れ、残る語だけが場所を取る。
  const reservedWordDisplay = (word: string) =>
    `var(${SOLVED_WORD_PREFIX}${
      puzzle.groups.find((group) => group.words.includes(word))?.difficulty
    }, flex)`;
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
              {isReady ? (
                <SolvedGroups
                  groups={gameState.solvedGroups}
                  latestRef={latestSolvedRef}
                />
              ) : (
                <SolvedGroups
                  groups={puzzle.groups}
                  reserved={RESERVED_SOLVED_GROUPS}
                />
              )}
              {!isFinished && (
                <div className={isReady ? undefined : styles.pending}>
                  <WordGrid
                    ref={gridRef}
                    words={gameState.remainingWords}
                    selectedWords={gameState.selectedWords}
                    onWordToggle={handleWordToggle}
                    wordPhrases={wordPhrases}
                    reservedDisplay={isReady ? undefined : reservedWordDisplay}
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
                  <PhrasedText
                    as="h2"
                    id="nakamawake-share"
                    className={styles.shareHeading}
                    phrases={["この", "結果を", "共有"]}
                  />
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
