"use client";

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { trackContentEnd } from "@/lib/analytics";
import type {
  Difficulty,
  YojiGameState,
  YojiGameStats,
  YojiEntry,
  PuzzleResponse,
  EvaluateResponse,
} from "@/play/games/yoji-kimeru/_lib/types";
import { MAX_GUESSES } from "@/play/games/yoji-kimeru/_lib/types";
import { isValidYojiInput } from "@/play/games/yoji-kimeru/_lib/engine";
import { formatDateJST } from "@/play/games/yoji-kimeru/_lib/daily";
import { difficultyNames } from "@/play/games/yoji-kimeru/_lib/constants";
import {
  DIFFICULTY_KEY,
  HISTORY_KEY_PREFIX,
  migrateToV2,
  loadDifficulty,
  saveDifficulty,
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
} from "@/play/games/yoji-kimeru/_lib/storage";
import {
  releaseSavedLayout,
  resultAreaNames,
  saveResultHeight,
  reserveSavedLayout,
  savedLayoutScript,
  type SavedLayoutOptions,
} from "@/play/games/shared/_lib/savedLayout";
import ReservedResultArea from "@/play/games/shared/_components/new/ReservedResultArea";
import type { ItemListItem } from "@/components/ItemList";
import Button from "@/components/Button";
import type { GuessSubmitResult } from "@/play/games/shared/_lib/guessSubmit";
import { revealControl } from "@/lib/reveal";
import { useIsServerRendered } from "@/components/hooks/useIsServerRendered";
import HintBar, { hintLineCount } from "./HintBar";
import GameBoard from "./GameBoard";
import GuessInput from "./GuessInput";
import GameResult from "./GameResult";
import HowToPlay from "./HowToPlay";
import DifficultySelector from "./DifficultySelector";
import styles from "./styles/YojiKimeru.module.css";

const DEFAULT_DIFFICULTY: Difficulty = "intermediate";

/** 問題を読み込めなかったときに出す文。 */
const LOAD_FAILED_MESSAGE =
  "問題を読み込めませんでした。時間をおいて、もう一度読み込んでください";

const SAVED_LAYOUT_STYLE_ID = "yoji-kimeru-saved-rows";
const RESULT_AREA = resultAreaNames("yoji-kimeru");
const HINT_HEIGHT_KEY = "yoji-kimeru-hint-height";

/** 端末に記録した今日の回の行と結果の区画の高さを、本体を描く前に取っておくための設定。 */
const SAVED_LAYOUT_OPTIONS: SavedLayoutOptions = {
  styleId: SAVED_LAYOUT_STYLE_ID,
  difficultyKey: DIFFICULTY_KEY,
  historyKeyPrefix: HISTORY_KEY_PREFIX,
  maxGuesses: MAX_GUESSES,
  boardRowsProperty: "--yoji-kimeru-board-rows",
  byGuessCount: [
    {
      property: "--yoji-kimeru-hint-lines",
      values: Array.from({ length: MAX_GUESSES + 1 }, (_, count) =>
        hintLineCount(count),
      ),
      finishedValues: Array.from({ length: MAX_GUESSES + 1 }, (_, count) =>
        hintLineCount(count, true),
      ),
    },
  ],
  // 文字を大きくするとヒントの行が折り返し、高さが行の数で決まらないので、前に描いた高さも取っておく。
  rememberedHeights: [
    { property: "--yoji-kimeru-hint-height", storageKey: HINT_HEIGHT_KEY },
  ],
  resultArea: RESULT_AREA,
};

/** サーバーの HTML で本体の前に置くスクリプト。 */
const SAVED_LAYOUT_SCRIPT = savedLayoutScript(SAVED_LAYOUT_OPTIONS);

/**
 * 問題の手がかり（読み・分類・出典・難しさ）をサーバーから受け取る。答えの四字熟語は含まれない。
 */
async function fetchPuzzle(
  date: string,
  difficulty: Difficulty,
): Promise<PuzzleResponse> {
  const res = await fetch(
    `/api/yoji-kimeru/puzzle?date=${encodeURIComponent(date)}&difficulty=${encodeURIComponent(difficulty)}`,
  );
  if (!res.ok) {
    throw new Error(`Puzzle API error: ${res.status}`);
  }
  return (await res.json()) as PuzzleResponse;
}

/**
 * 推測をサーバーで答え合わせする。解き終えたときにだけ、答えの四字熟語が返る。
 */
async function fetchEvaluate(
  guess: string,
  puzzleDate: string,
  difficulty: Difficulty,
  guessNumber: number,
): Promise<EvaluateResponse> {
  const res = await fetch("/api/yoji-kimeru/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess, puzzleDate, difficulty, guessNumber }),
  });
  if (!res.ok) {
    throw new Error(`Evaluate API error: ${res.status}`);
  }
  return (await res.json()) as EvaluateResponse;
}

function freshGame(puzzleDate: string, puzzleNumber: number): YojiGameState {
  return {
    puzzleDate,
    puzzleNumber,
    targetYoji: null,
    guesses: [],
    status: "playing",
  };
}

/** 解き終えた回で、これまでの成績を更新する。 */
function updateStats(
  stats: YojiGameStats,
  status: "won" | "lost",
  guessCount: number,
  wonYesterday: boolean,
  today: string,
): YojiGameStats {
  const won = status === "won";
  const guessDistribution: YojiGameStats["guessDistribution"] = [
    ...stats.guessDistribution,
  ];
  if (won) guessDistribution[guessCount - 1] += 1;
  const currentStreak = won ? (wonYesterday ? stats.currentStreak + 1 : 1) : 0;
  return {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    guessDistribution,
    lastPlayedDate: today,
  };
}

interface GameContainerProps {
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: ItemListItem[];
}

/**
 * 四字キメルの本体。上から、ヒントの帯・盤・入力欄（解き終えたら結果）・くわしい遊び方・難易度と日付の順に
 * 置く（DESIGN.md §8「結果は、それを生んだ操作の直後に置く」）。
 *
 * サーバーの HTML でも、問題を読み込むまでのあいだも、初めての来訪者に見せる組み（ヒントの帯の2行・盤の空の
 * 1行・入力欄）をそのまま描き、読み込んだときに下のものを動かさない。答えは解き終えるまでブラウザに渡らない。
 */
export default function GameContainer({
  crossCategoryItems,
}: GameContainerProps) {
  const todayStr = useMemo(() => formatDateJST(new Date()), []);
  const dateText = useMemo(
    () =>
      new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [puzzleData, setPuzzleData] = useState<PuzzleResponse | null>(null);
  const [gameState, setGameState] = useState<YojiGameState>(() =>
    freshGame(todayStr, 0),
  );
  const [stats, setStats] = useState<YojiGameStats>(() =>
    loadStats(DEFAULT_DIFFICULTY),
  );
  /** 来訪者の推測でいま盤に加わった行。その行の判定だけが現れる動きを持つ。 */
  const [addedRow, setAddedRow] = useState<number | null>(null);
  /** 送って答え合わせを待っている推測。判定が返るまで、盤にその行の場所を取っておく。 */
  const [pendingGuess, setPendingGuess] = useState<string | null>(null);
  /** 結果が来訪者の最後の推測に応えて現れたか。開き直したときの結果は動かさない。 */
  const [resultAppears, setResultAppears] = useState(false);
  /**
   * 最後の推測で解き終えたときの、ヒントの帯の高さ。解き終えると次に出るヒントの行が消えるが、その推測に
   * 応えて動くのは結果の登場だけにするため（DESIGN.md §11）、帯はこの高さを保つ。
   */
  const [heldHintHeight, setHeldHintHeight] = useState<number | null>(null);

  const isServerRendered = useIsServerRendered();
  // サイトの中のリンクで移ってきたときや戻ってきたときは、ブラウザで新しく描くので本体の前のスクリプトが動かない。
  // 最初の描画の前にここで同じ値を書き、ブラウザが戻す送りの位置に、開き直したときと同じ中身が来るようにする。
  useState(() => {
    if (!isServerRendered) {
      releaseSavedLayout(SAVED_LAYOUT_STYLE_ID);
      reserveSavedLayout(SAVED_LAYOUT_OPTIONS);
    }
    return null;
  });
  // ほかのページへ移ったら、取っておいた値を残さない。
  useEffect(() => () => releaseSavedLayout(SAVED_LAYOUT_STYLE_ID), []);
  const fieldRef = useRef<HTMLInputElement>(null);
  const hintStripRef = useRef<HTMLDivElement>(null);
  /** 推測が盤に加わったあと、入力欄が画面の外なら画面に入れる。 */
  const revealFieldRef = useRef(false);

  /**
   * その難易度の今日の問題を読み込み、端末に記録した途中の回か解き終えた回があれば戻す。
   */
  const initializeGame = useCallback(
    async (diff: Difficulty) => {
      setLoading(true);
      setLoadFailed(false);
      setAddedRow(null);
      setResultAppears(false);
      setHeldHintHeight(null);
      setGameState(freshGame(todayStr, 0));

      try {
        const puzzle = await fetchPuzzle(todayStr, diff);
        const saved = loadTodayGame(todayStr, diff);
        let restored = freshGame(todayStr, puzzle.puzzleNumber);
        if (saved) {
          let targetYoji: YojiEntry | null = null;
          if (saved.status !== "playing") {
            // 答えは記録していないので、最後の推測をもう一度送って受け取る。
            const lastResponse = await fetchEvaluate(
              saved.guesses[saved.guesses.length - 1]!,
              todayStr,
              diff,
              saved.guesses.length,
            );
            if (!lastResponse.targetYoji) {
              throw new Error("Evaluate API returned no answer");
            }
            targetYoji = lastResponse.targetYoji;
          }
          restored = {
            ...restored,
            targetYoji,
            guesses: saved.feedbacks!,
            status: saved.status,
          };
        }
        setPuzzleData(puzzle);
        setGameState(restored);
        setStats(loadStats(diff));
      } catch {
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [todayStr],
  );

  // 難易度は端末の記録から決まるので、サーバーの HTML と同じ既定の難易度で描いてから、記録の難易度で読み込む。
  useEffect(() => {
    const start = async () => {
      migrateToV2();
      const saved = loadDifficulty();
      setDifficulty(saved);
      await initializeGame(saved);
    };
    void start();
  }, [initializeGame]);

  const handleDifficultyChange = useCallback(
    (newDifficulty: Difficulty) => {
      if (newDifficulty === difficulty) return;
      releaseSavedLayout(SAVED_LAYOUT_STYLE_ID);
      saveDifficulty(newDifficulty);
      setDifficulty(newDifficulty);
      void initializeGame(newDifficulty);
    },
    [difficulty, initializeGame],
  );

  // 遊んでいる途中の回を戻したら、サーバーの HTML のスクリプトが取っておいた高さを外す。解き終えた回では、結果の
  // 区画が描き終わるまで（ほかの遊びの案内が端末の記録を読んで出るまで）高さを取っておくため、難易度を替えるまで
  // 外さない。
  useLayoutEffect(() => {
    if (!loading && gameState.status === "playing") {
      releaseSavedLayout(SAVED_LAYOUT_STYLE_ID);
    }
  }, [loading, gameState.status]);

  // 読み込んだあとのヒントの帯の高さを覚えておく。開き直したとき、本体の前のスクリプトがこの高さを取っておく。
  useEffect(() => {
    const strip = hintStripRef.current;
    if (loading || !strip) return;
    const save = () => {
      // ページを離れるときに外された帯は高さ0を返すので、覚えない。
      if (!strip.isConnected) return;
      saveResultHeight(
        HINT_HEIGHT_KEY,
        todayStr,
        difficulty,
        strip.getBoundingClientRect().height,
      );
    };
    save();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(save);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [loading, todayStr, difficulty]);

  // 送った推測も、判定を待たずに1回として数える（盤の行・ヒント・残りの回数）。
  const guessCount = gameState.guesses.length + (pendingGuess === null ? 0 : 1);
  useLayoutEffect(() => {
    if (!revealFieldRef.current) return;
    revealFieldRef.current = false;
    if (fieldRef.current) revealControl(fieldRef.current);
  }, [guessCount]);

  /**
   * 推測を送る。入力の誤りは "invalid" で欄に出す文を返し、答え合わせができなかったときは "unavailable" を返す。
   */
  const handleGuess = useCallback(
    async (input: string): Promise<GuessSubmitResult> => {
      if (loading) return { kind: "unavailable" };
      if (gameState.status !== "playing" || submitting) {
        return { kind: "accepted" };
      }

      if (!isValidYojiInput(input)) {
        return { kind: "invalid", message: "漢字4文字を入力してください" };
      }
      if (gameState.guesses.some((g) => g.guess === input)) {
        return {
          kind: "invalid",
          message:
            "この組み合わせはすでに入力しました。別の四字熟語を入力してください",
        };
      }

      setSubmitting(true);
      // 判定を待たずに行と入力欄の位置を決める。判定が遅く返っても、送った操作の直後に盤が伸び、判定が付く
      // ときには盤の下が動かない。
      setPendingGuess(input);
      revealFieldRef.current = true;
      try {
        const guessNumber = gameState.guesses.length + 1;
        const response = await fetchEvaluate(
          input,
          todayStr,
          difficulty,
          guessNumber,
        );

        const newGuesses = [...gameState.guesses, response.feedback];
        const newStatus: YojiGameState["status"] = response.isCorrect
          ? "won"
          : guessNumber >= MAX_GUESSES
            ? "lost"
            : "playing";

        setGameState({
          ...gameState,
          guesses: newGuesses,
          status: newStatus,
          targetYoji: response.targetYoji ?? gameState.targetYoji,
        });

        const history = loadHistory(difficulty);
        history[todayStr] = {
          guesses: newGuesses.map((g) => g.guess),
          feedbacks: newGuesses,
          status: newStatus,
          guessCount: newGuesses.length,
        };
        saveHistory(history, difficulty);

        if (newStatus === "playing") {
          // 結果を出さない推測では、判定が現れる動きがこの操作への応えになる。
          setAddedRow(newGuesses.length - 1);
        } else {
          // 結果が出る推測では、結果の登場だけが動く（DESIGN.md §11）。
          setAddedRow(null);
          setResultAppears(true);
          setHeldHintHeight(
            hintStripRef.current?.getBoundingClientRect().height ?? null,
          );
          // 遊び終えたことは、来訪者がその場で解き終えたときにだけ送る。解き終えた回を開き直したときは送らない。
          trackContentEnd("yoji-kimeru", "game", newStatus === "won");
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = formatDateJST(yesterday);
          const wonYesterday =
            stats.lastPlayedDate === yesterdayStr &&
            history[yesterdayStr]?.status === "won";
          const updatedStats = updateStats(
            stats,
            newStatus,
            newGuesses.length,
            wonYesterday,
            todayStr,
          );
          setStats(updatedStats);
          saveStats(updatedStats, difficulty);
        }

        return { kind: "accepted" };
      } catch {
        return { kind: "unavailable" };
      } finally {
        setPendingGuess(null);
        setSubmitting(false);
      }
    },
    [loading, gameState, difficulty, todayStr, stats, submitting],
  );

  if (loadFailed) {
    return (
      <div className={styles.game}>
        <p>{LOAD_FAILED_MESSAGE}</p>
        <Button onClick={() => void initializeGame(difficulty)}>
          もう一度読み込む
        </Button>
      </div>
    );
  }

  const answer = loading ? null : gameState.targetYoji;
  const playing = gameState.status === "playing";

  return (
    <>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: SAVED_LAYOUT_SCRIPT }}
        />
      )}
      <div className={styles.game}>
        <HintBar
          guessCount={guessCount}
          hint={loading ? null : puzzleData}
          finished={!loading && gameState.status !== "playing"}
          stripRef={hintStripRef}
          heldHeight={heldHintHeight}
        />
        <GameBoard
          guesses={gameState.guesses}
          pendingGuess={pendingGuess}
          showNextRow={playing && guessCount < MAX_GUESSES}
          addedRow={addedRow}
        />
        <ReservedResultArea
          names={RESULT_AREA}
          showsResult={Boolean(answer) && !playing}
          date={todayStr}
          difficulty={difficulty}
        >
          {answer && !playing ? (
            <GameResult
              gameState={gameState}
              answer={answer}
              difficulty={difficulty}
              stats={stats}
              crossCategoryItems={crossCategoryItems}
              appear={resultAppears}
            />
          ) : (
            <GuessInput
              label={
                <>
                  {difficultyNames[difficulty]}の四字熟語を入力
                  <span className={styles.remaining}>
                    （あと{MAX_GUESSES - guessCount}回）
                  </span>
                </>
              }
              onSubmit={handleGuess}
              submitting={submitting}
              fieldRef={fieldRef}
            />
          )}
        </ReservedResultArea>
        <HowToPlay />
        <div className={styles.settings}>
          <DifficultySelector
            difficulty={difficulty}
            onChange={handleDifficultyChange}
          />
          <p className={styles.puzzleDate}>
            {loading
              ? "今日の問題"
              : `#${gameState.puzzleNumber}・${dateText}の問題`}
          </p>
        </div>
      </div>
    </>
  );
}
