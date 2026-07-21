import { describe, it, expect } from "vitest";
import { quizBySlug } from "../registry";
import { determineResult } from "../scoring";
import { determineScienceThinkingResult } from "../data/science-thinking";
import type { QuizDefinition, QuizAnswer } from "../types";

/**
 * cycle-294 の検証（docs/cycles/cycle-294/findings.md）を恒久ガード化する回帰テスト。
 *
 * 背景: personality 診断は同点時に quiz.results の配列順で決着する（scoring.ts）。
 * cycle-294 で全診断・全回答空間を計測し「到達不能タイプは存在しない」ことを確認したが、
 * 将来のデータ編集で以下の事故が起きうる:
 *   - 結果タイプを追加したのに、そのタイプへ配点する choice を繋ぎ忘れる（孤児タイプ）
 *   - 配点構造が偏り、あるタイプが常に他タイプに敗れて選ばれなくなる（恒常敗退）
 * どちらも「そのタイプに絶対にならない診断」を来訪者に渡すことになる。これを防ぐ。
 *
 * science-thinking は汎用 determineResult ではなく独自の5軸判定（determineScienceThinkingResult）
 * を使うため、汎用ロジック向けの孤児/悉皆チェックの対象外とする。ただし「タイプを追加したが
 * AXIS_PAIR_TO_TYPE への紐付けを繋ぎ忘れて到達不能になる」事故には汎用診断以上に脆弱なため、
 * 実判定関数を使った専用の到達性ガードを別途設ける（末尾の describe）。
 */

const GENERIC_TIEBREAK_EXCLUDED = new Set(["science-thinking"]);

const personalityQuizzes: QuizDefinition[] = [...quizBySlug.values()].filter(
  (q) =>
    q.meta.type === "personality" &&
    !GENERIC_TIEBREAK_EXCLUDED.has(q.meta.slug),
);

function comboCount(quiz: QuizDefinition): number {
  return quiz.questions.reduce((n, q) => n * Math.max(1, q.choices.length), 1);
}

/** 回答インデックス列 → QuizAnswer[] */
function answersFromIndices(quiz: QuizDefinition, idx: number[]): QuizAnswer[] {
  return quiz.questions.map((q, i) => ({
    questionId: q.id,
    choiceId: q.choices[idx[i]].id,
  }));
}

describe("personality診断の結果タイプ到達性ガード", () => {
  it("対象 personality 診断が存在する（前提が壊れていないこと）", () => {
    expect(personalityQuizzes.length).toBeGreaterThan(0);
  });

  // 孤児タイプゼロ: 各 result id に正の配点を与える choice が最低1つ存在する。
  // これが無いタイプは all-zero の同点でしか勝てず、事実上到達不能になりうる。
  describe.each(personalityQuizzes.map((q) => [q.meta.slug, q] as const))(
    "%s: 孤児タイプが無い",
    (_slug, quiz) => {
      const pointedTypeIds = new Set<string>();
      for (const question of quiz.questions) {
        for (const choice of question.choices) {
          for (const [typeId, value] of Object.entries(choice.points ?? {})) {
            if (value > 0) pointedTypeIds.add(typeId);
          }
        }
      }
      it.each(quiz.results.map((r) => r.id))(
        "タイプ %s に正の配点源がある",
        (resultId) => {
          expect(pointedTypeIds.has(resultId)).toBe(true);
        },
      );
    },
  );

  // 全タイプ到達性: 各タイプが実際に勝者になれる回答が存在することを確認する。
  // これにより「正の配点はあるが配点構造の偏りで常に敗れて選ばれない（恒常敗退）」タイプも検出する。
  // 悉皆列挙できる規模は厳密に、それ超は決定的サンプリングで確認する（いずれも非flaky）。
  const heavyTestTimeoutMs = 60_000;

  /** 各タイプが少なくとも一度は勝者になった集合を返す（回答インデックスは gen が供給） */
  function collectWinners(
    quiz: QuizDefinition,
    gen: (dims: number[]) => Iterable<number[]>,
  ): Set<string> {
    const dims = quiz.questions.map((q) => q.choices.length);
    const winners = new Set<string>();
    for (const idx of gen(dims)) {
      winners.add(determineResult(quiz, answersFromIndices(quiz, idx)).id);
    }
    return winners;
  }

  function unreachableTypes(quiz: QuizDefinition, winners: Set<string>) {
    return quiz.results.map((r) => r.id).filter((id) => !winners.has(id));
  }

  // 悉皆列挙: 組合せ数がこの上限以下の診断は全回答を尽くして厳密確認する。
  // 110万（EXHAUSTIVE_CAP=1,100,000）まで含める（小規模6本 + music/animal/word-sense=各1,048,576）。
  const EXHAUSTIVE_CAP = 1_100_000;
  const exhaustiveQuizzes = personalityQuizzes.filter(
    (q) => comboCount(q) <= EXHAUSTIVE_CAP,
  );
  // 悉皆不可の大規模診断（character-personality=1670万・japanese-culture=690億）。
  // 決定的シード付き乱数で標本抽出する。SAMPLE_N は現状の最小勝者
  // （character-personality の academic-artist≈0.5%）でも期待数千ヒットする水準に取る。
  const sampledQuizzes = personalityQuizzes.filter(
    (q) => comboCount(q) > EXHAUSTIVE_CAP,
  );
  const SAMPLE_N = 500_000;

  function* enumerateAll(dims: number[]): Iterable<number[]> {
    const total = dims.reduce((n, d) => n * d, 1);
    const idx = new Array(dims.length).fill(0);
    for (let c = 0; c < total; c++) {
      yield idx;
      for (let d = dims.length - 1; d >= 0; d--) {
        idx[d]++;
        if (idx[d] < dims[d]) break;
        idx[d] = 0;
      }
    }
  }

  // mulberry32: 決定的な擬似乱数（固定シード）。Math.random を使わないことで
  // テストを再現可能・非flaky に保つ。
  function makeSeededSampler(seed: number) {
    let s = seed >>> 0;
    const next = () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return next;
  }

  function makeSampleGen(seed: number, n: number) {
    return function* (dims: number[]): Iterable<number[]> {
      const rand = makeSeededSampler(seed);
      const idx = new Array(dims.length).fill(0);
      for (let s = 0; s < n; s++) {
        for (let d = 0; d < dims.length; d++) {
          idx[d] = Math.floor(rand() * dims[d]);
        }
        yield idx;
      }
    };
  }

  describe.each(exhaustiveQuizzes.map((q) => [q.meta.slug, q] as const))(
    "%s: 全タイプが到達可能（悉皆列挙で厳密確認）",
    (_slug, quiz) => {
      it(
        "すべての結果タイプが少なくとも1つの回答で勝者になる",
        () => {
          const winners = collectWinners(quiz, enumerateAll);
          expect(unreachableTypes(quiz, winners)).toEqual([]);
        },
        heavyTestTimeoutMs,
      );
    },
  );

  describe.each(sampledQuizzes.map((q) => [q.meta.slug, q] as const))(
    "%s: 全タイプが到達可能（決定的サンプリングで確認）",
    (_slug, quiz) => {
      // 悉皆不可のため「50万標本で到達が観測されない」ことをもって恒常敗退の高確度検出とする
      // （厳密証明ではない点は findings.md に明記）。玄関 character-personality を含む。
      it(
        "すべての結果タイプがサンプル中で勝者になる",
        () => {
          const winners = collectWinners(
            quiz,
            makeSampleGen(0x9e3779b9, SAMPLE_N),
          );
          expect(unreachableTypes(quiz, winners)).toEqual([]);
        },
        heavyTestTimeoutMs,
      );
    },
  );

  // science-thinking は独自の5軸判定を使うため上の汎用ガードの対象外だが、
  // 判定が手書きの AXIS_PAIR_TO_TYPE / FALLBACK_MAP に依存し「タイプを追加したのに
  // マッピングへ繋ぎ忘れて到達不能になる」事故に脆弱。実判定関数で到達性をガードする。
  describe("science-thinking: 全タイプが到達可能（独自判定・決定的サンプリング）", () => {
    const quiz = quizBySlug.get("science-thinking");

    it("science-thinking 診断が存在する", () => {
      expect(quiz).toBeDefined();
    });

    it(
      "すべての結果タイプが independent 判定で勝者になる",
      () => {
        if (!quiz) return;
        const winners = new Set<string>();
        for (const idx of makeSampleGen(
          0x9e3779b9,
          SAMPLE_N,
        )(quiz.questions.map((q) => q.choices.length))) {
          const answers = answersFromIndices(quiz, idx);
          winners.add(
            determineScienceThinkingResult(
              quiz.questions,
              answers,
              quiz.results,
            ).id,
          );
        }
        expect(unreachableTypes(quiz, winners)).toEqual([]);
      },
      heavyTestTimeoutMs,
    );
  });
});
