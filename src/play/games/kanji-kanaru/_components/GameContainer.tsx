"use client";

import {
  useState,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { trackContentEnd } from "@/lib/analytics";
import type {
  Difficulty,
  GameState,
  GameStats,
  KanjiEntry,
  EvaluateResponse,
  HintsResponse,
} from "@/play/games/kanji-kanaru/_lib/types";
import {
  DIFFICULTY_LABELS,
  MAX_GUESSES,
} from "@/play/games/kanji-kanaru/_lib/types";
import { formatDateJST } from "@/play/games/kanji-kanaru/_lib/daily";
import {
  migrateToV2,
  loadStats,
  saveStats,
  loadHistory,
  saveHistory,
  loadTodayGame,
} from "@/play/games/kanji-kanaru/_lib/storage";
import { JOYO_KANJI_SET } from "@/play/games/kanji-kanaru/data/joyo-kanji-set";
import {
  releaseSavedLayout,
  resultAreaNames,
  reserveSavedLayout,
  savedLayoutScript,
  type SavedLayoutOptions,
} from "@/play/games/shared/_lib/savedLayout";
import ReservedResultArea from "@/play/games/shared/_components/new/ReservedResultArea";
import type { ItemListItem } from "@/components/ItemList";
import Button from "@/components/Button";
import { useIsServerRendered } from "@/components/hooks/useIsServerRendered";
import type { GuessSubmitResult } from "@/play/games/shared/_lib/guessSubmit";
import { revealControl } from "@/play/games/shared/_lib/revealControl";
import HintBar from "./HintBar";
import GameBoard from "./GameBoard";
import GuessInput from "./GuessInput";
import GameResult from "./GameResult";
import HowToPlay from "./HowToPlay";
import DifficultySelector from "./DifficultySelector";
import styles from "./styles/KanjiKanaru.module.css";

const DIFFICULTY_KEY = "kanji-kanaru-difficulty";
const HISTORY_KEY_PREFIX = "kanji-kanaru-history-";
const LOADING_TEXT = "読み込んでいます";
const INIT_FAILED_MESSAGE =
  "問題を読み込めませんでした。時間をおいて、もう一度読み込んでください";

const SAVED_LAYOUT_STYLE_ID = "kanji-kanaru-saved-layout";
const RESULT_AREA = resultAreaNames("kanji-kanaru");

/** 端末に記録した今日の回の行と結果の区画の高さを、本体を描く前に取っておくための設定。 */
const SAVED_LAYOUT_OPTIONS: SavedLayoutOptions = {
  styleId: SAVED_LAYOUT_STYLE_ID,
  difficultyKey: DIFFICULTY_KEY,
  historyKeyPrefix: HISTORY_KEY_PREFIX,
  maxGuesses: MAX_GUESSES,
  boardRowsProperty: "--kanji-kanaru-board-rows",
  resultArea: RESULT_AREA,
};

/** サーバーの HTML で本体の前に置くスクリプト。 */
const SAVED_LAYOUT_SCRIPT = savedLayoutScript(SAVED_LAYOUT_OPTIONS);

/**
 * Load the saved difficulty from localStorage, defaulting to intermediate.
 */
function loadDifficulty(): Difficulty {
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
    // localStorage が使えない端末では、既定の難易度で遊ぶ。
  }
  return "intermediate";
}

/**
 * Save difficulty choice to localStorage.
 */
function saveDifficulty(difficulty: Difficulty): void {
  try {
    window.localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch {
    // 保存できなくても、いまの回はそのまま遊べる。
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
    throw new Error(`Evaluate API error: ${res.status}`);
  }
  return (await res.json()) as EvaluateResponse;
}

/** 推測を送ったあとに、画面をどこへ送るか。 */
type PendingReveal = "input" | "result" | null;

interface GameContainerProps {
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: ItemListItem[];
}

/**
 * ゲーム本体。ヒント・盤・入力欄（解き終えたら結果）・くわしい遊び方・難易度と日付を、上からこの順に置く。
 *
 * サーバーの HTML と読み込みのあいだも、初めての来訪者が読み込んだあとに見るのと同じ区画（空の次の行を持つ盤、
 * 入力欄、くわしい遊び方、難易度と日付の行）を描き、読み込んだときに下のものが動かないようにする。遊んだ来訪者が
 * 開き直したときは、本体の前のスクリプトが端末の記録から盤の行と結果の区画の高さを取っておく。
 * 答えの漢字は、解き終えるまでサーバーからクライアントに渡らない。
 */
export default function GameContainer({
  crossCategoryItems,
}: GameContainerProps) {
  const loadingTextId = useId();
  const todayStr = useMemo(() => formatDateJST(new Date()), []);

  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hintsData, setHintsData] = useState<HintsResponse | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    puzzleDate: todayStr,
    puzzleNumber: 0,
    targetKanji: null,
    guesses: [],
    status: "playing",
  });
  const [stats, setStats] = useState<GameStats | null>(null);
  // 推測を送った応えとして現れた行の番号と、最後の推測で解き終えたか。どちらも、開き直して戻した盤と結果には
  // 立てない（登場の動きは操作への応えだけが持つ。DESIGN.md §11）。
  const [appearingRow, setAppearingRow] = useState<number | undefined>();
  const [finishedByGuess, setFinishedByGuess] = useState(false);
  /** 送って答え合わせを待っている推測。判定が返るまで、盤にその行を置いておく。 */
  const [pendingGuess, setPendingGuess] = useState<string | null>(null);

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

  const inputRowRef = useRef<HTMLDivElement>(null);
  const resultBoxRef = useRef<HTMLElement>(null);
  const pendingRevealRef = useRef<PendingReveal>(null);

  /**
   * 問題を読み込み、その難易度の今日の回を端末の記録から戻す。
   */
  const initializeGame = useCallback(
    async (diff: Difficulty) => {
      setLoading(true);
      setError(null);
      setAppearingRow(undefined);
      setFinishedByGuess(false);
      setStats(loadStats(diff));

      try {
        const hints = await fetchHints(todayStr, diff);
        const saved = loadTodayGame(todayStr, diff);
        let restored: GameState = {
          puzzleDate: todayStr,
          puzzleNumber: hints.puzzleNumber,
          targetKanji: null,
          guesses: [],
          status: "playing",
        };
        if (saved) {
          let targetKanji: KanjiEntry | null = null;
          if (saved.status === "won" || saved.status === "lost") {
            // 答えの漢字は、最後の推測を答え合わせし直して受け取る。
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
          restored = {
            ...restored,
            targetKanji,
            guesses: saved.feedbacks!,
            status: saved.status,
          };
        }
        setHintsData(hints);
        setGameState(restored);
      } catch {
        setError(INIT_FAILED_MESSAGE);
      } finally {
        setLoading(false);
      }
    },
    [todayStr],
  );

  // 保存した難易度は端末にしか無いので、サーバーの HTML と同じ既定の難易度で描いたあとに読んで始める。
  useEffect(() => {
    migrateToV2();
    const saved = loadDifficulty();
    setDifficulty(saved);
    void initializeGame(saved);
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

  // 遊んでいる途中の回を戻したら、取っておいた行の高さを外す。解き終えた回では、結果の区画が描き終わるまで
  // （ほかの遊びの案内が端末の記録を読んで出るまで）高さを取っておくため、難易度を替えるまで外さない。
  useLayoutEffect(() => {
    if (!loading && gameState.status === "playing")
      releaseSavedLayout(SAVED_LAYOUT_STYLE_ID);
  }, [loading, gameState.status]);

  // 送った推測も、判定を待たずに1回として数える（盤の行・残りの回数）。
  const guessCount = gameState.guesses.length + (pendingGuess === null ? 0 : 1);

  // 推測を送ったあと、次の推測の入力欄か、解き終えた結果のボックスを画面に入れる。行が増えたのを描いた直後、
  // 塗る前に送り、送りを即時にする（DESIGN.md §8・§11）。
  useLayoutEffect(() => {
    const pending = pendingRevealRef.current;
    if (!pending) return;
    pendingRevealRef.current = null;
    if (pending === "input") {
      if (inputRowRef.current) revealControl(inputRowRef.current);
      return;
    }
    const box = resultBoxRef.current;
    if (!box) return;
    const viewport = window.visualViewport;
    const top = viewport ? viewport.offsetTop : 0;
    const bottom = viewport ? top + viewport.height : window.innerHeight;
    const boxTop = box.getBoundingClientRect().top;
    if (boxTop < top || boxTop >= bottom) {
      box.scrollIntoView({ behavior: "instant", block: "start" });
    }
    box.focus({ preventScroll: true });
  }, [guessCount, gameState.status]);

  /**
   * 推測を送る。入力の誤りは "invalid" と欄に出す文で、答え合わせの失敗は "unavailable" で返す。
   */
  const handleGuess = useCallback(
    async (input: string): Promise<GuessSubmitResult> => {
      if (gameState.status !== "playing" || submitting) {
        return { kind: "accepted" };
      }

      if ([...input].length !== 1) {
        return { kind: "invalid", message: "漢字を1文字入力してください" };
      }
      if (!JOYO_KANJI_SET.has(input)) {
        return {
          kind: "invalid",
          message: "常用漢字ではありません。常用漢字を1文字入力してください",
        };
      }
      if (gameState.guesses.some((g) => g.guess === input)) {
        return {
          kind: "invalid",
          message:
            "この漢字はすでに入力しました。まだ入力していない漢字を1文字入力してください",
        };
      }

      setSubmitting(true);
      // 判定を待たずに、送った字の行を盤に置いて入力欄の位置を決める。判定が遅く返っても、送った操作の直後に
      // 盤が伸び、判定が付くときには盤の下が動かない。
      setPendingGuess(input);
      pendingRevealRef.current = "input";
      try {
        const guessNumber = gameState.guesses.length + 1;
        const response = await fetchEvaluate(
          input,
          todayStr,
          difficulty,
          guessNumber,
        );

        const newGuesses = [...gameState.guesses, response.feedback];
        let newStatus: GameState["status"] = "playing";
        if (response.isCorrect) {
          newStatus = "won";
        } else if (guessNumber >= MAX_GUESSES) {
          newStatus = "lost";
        }

        const newState: GameState = {
          ...gameState,
          guesses: newGuesses,
          status: newStatus,
          targetKanji: response.targetKanji
            ? (response.targetKanji as KanjiEntry)
            : gameState.targetKanji,
        };

        const guessChars = newGuesses.map((g) => g.guess);
        const history = loadHistory(difficulty);
        history[todayStr] = {
          guesses: guessChars,
          feedbacks: newGuesses,
          status: newStatus,
          guessCount: guessChars.length,
        };
        saveHistory(history, difficulty);

        if (newStatus === "playing") {
          // 判定の現れる動きは、結果が出ない推測の行だけが持つ。結果が出る最後の推測では、結果のボックスの
          // 登場だけが動く（DESIGN.md §11「1つの操作に応える UI の動きは1つだけ」）。
          setAppearingRow(newGuesses.length - 1);
        } else {
          const base = stats ?? loadStats(difficulty);
          const updatedStats: GameStats = {
            ...base,
            guessDistribution: [...base.guessDistribution],
            gamesPlayed: base.gamesPlayed + 1,
            lastPlayedDate: todayStr,
          };
          if (newStatus === "won") {
            updatedStats.gamesWon += 1;
            updatedStats.guessDistribution[newGuesses.length - 1] += 1;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = formatDateJST(yesterday);
            updatedStats.currentStreak =
              base.lastPlayedDate === yesterdayStr &&
              history[yesterdayStr]?.status === "won"
                ? base.currentStreak + 1
                : 1;
            updatedStats.maxStreak = Math.max(
              base.maxStreak,
              updatedStats.currentStreak,
            );
          } else {
            updatedStats.currentStreak = 0;
          }
          setStats(updatedStats);
          saveStats(updatedStats, difficulty);
          // 遊び終えたことは、来訪者がその場で解き終えたここでだけ送る。解き終えた回を開き直したときに送ると、
          // 同じ回が何度も数えられる。
          trackContentEnd("kanji-kanaru", "game", newStatus === "won");
          setAppearingRow(undefined);
          setFinishedByGuess(true);
          pendingRevealRef.current = "result";
        }
        setGameState(newState);

        return { kind: "accepted" };
      } catch {
        pendingRevealRef.current = null;
        return { kind: "unavailable" };
      } finally {
        setPendingGuess(null);
        setSubmitting(false);
      }
    },
    [gameState, difficulty, todayStr, stats, submitting],
  );

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <Button onClick={() => void initializeGame(difficulty)}>
          もう一度読み込む
        </Button>
      </div>
    );
  }

  const playing = gameState.status === "playing";
  const remaining = MAX_GUESSES - guessCount;

  return (
    <>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: SAVED_LAYOUT_SCRIPT }}
        />
      )}
      <div className={styles.game}>
        <HintBar hints={loading ? null : (hintsData?.hints ?? null)} />
        <GameBoard
          guesses={loading ? [] : gameState.guesses}
          pendingGuess={pendingGuess}
          showNextRow={loading || (playing && guessCount < MAX_GUESSES)}
          appearingRow={appearingRow}
          pendingText={loading ? LOADING_TEXT : undefined}
          pendingTextId={loadingTextId}
        />
        <ReservedResultArea
          names={RESULT_AREA}
          showsResult={!loading && !playing}
          date={todayStr}
          difficulty={difficulty}
        >
          {loading || playing ? (
            <GuessInput
              label={`${DIFFICULTY_LABELS[difficulty]}の漢字を1字入力（あと${remaining}回）`}
              onSubmit={handleGuess}
              submitting={submitting}
              loading={loading}
              loadingTextId={loadingTextId}
              rowRef={inputRowRef}
            />
          ) : (
            stats && (
              <GameResult
                gameState={gameState}
                difficulty={difficulty}
                stats={stats}
                appear={finishedByGuess}
                boxRef={resultBoxRef}
                crossCategoryItems={crossCategoryItems}
              />
            )
          )}
        </ReservedResultArea>
        <HowToPlay />
        <DifficultySelector
          difficulty={difficulty}
          onChange={handleDifficultyChange}
        />
        {/* 番号と日付は読み込んだあとに分かる。読み込みのあいだも1行を取り、読み込んだときに下が動かない。 */}
        <p className={styles.puzzleLine}>
          {loading
            ? " "
            : `第${gameState.puzzleNumber}回・${formatPuzzleDate(todayStr)}`}
        </p>
      </div>
    </>
  );
}

/** "2026-09-27" を「2026年9月27日」と言う。 */
function formatPuzzleDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}
