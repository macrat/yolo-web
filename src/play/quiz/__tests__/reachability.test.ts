import { describe, it, expect } from "vitest";
import { quizBySlug } from "../registry";
import { determineResult, calculatePersonalityPoints } from "../scoring";
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
 * science-thinking / character-personality は汎用 determineResult ではなく独自の軸ベース判定
 * （determineScienceThinkingResult / determineCharacterPersonalityResult）を使うため、
 * 汎用ロジック向けの孤児/悉皆・一様標本チェックの対象外とする。
 *   - 孤児チェック: これらは choice.points のキーが 24 タイプ ID ではなく軸/アーキタイプ名
 *     なので、typeId を集計する汎用の孤児チェックでは全タイプが孤児に見えてしまう。
 *   - 一様標本チェック: 軸ベース判定では同型/純タイプが一様ランダム回答では希薄になり得るため、
 *     汎用の「50万一様標本で全タイプ出現」ガードとは整合しない（cycle-295 G4c 撤回の経緯）。
 * 専用の到達性ガードは実判定関数を用いて別途設ける（science-thinking は末尾の describe。
 * character-personality の G1/G4 回帰は後続タスク E4 で追加予定）。
 */

const GENERIC_TIEBREAK_EXCLUDED = new Set([
  "science-thinking",
  "character-personality",
]);

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
  // 悉皆不可の大規模・汎用判定の診断（japanese-culture=690億 等）を対象に、
  // 決定的シード付き乱数で標本抽出する。SAMPLE_N は最小勝者でも期待数千ヒットする水準に取る。
  // （character-personality=1670万 は専用判定へ移行し GENERIC_TIEBREAK_EXCLUDED で除外済み。）
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

  // ---- 理想回答者ガード（cycle-297 で追加・弱い到達性の格上げ）----
  //
  // なぜ弱い到達性では不十分だったか:
  //   上の「全タイプ到達性」ガードは『回答空間のどこかにそのタイプが単独最大になる回答が
  //   1つでも存在するか』しか見ていない（＝機械的到達性）。そのタイプを犠牲にする不自然な
  //   回答でも単独最大になれば緑になってしまう。実際 traditional-color の wakakusa（若草色）は
  //   この弱いガードを緑で通過していたが、cycle-297 で「若草色を各設問で最大化した最も正直な
  //   回答者」でも桜色に strict 敗北する dead type だと判明した（若草色の +1 が毎回 桜色の +2 に
  //   相乗りする『桜色の影』構造）。弱い到達性はこれを見逃す。
  //
  // 正しい理想回答者ガード:
  //   各タイプ T について「各設問で points[T] が最大の choice（T-argmax）を選ぶ正直回答者」を考える。
  //   同一設問で T-argmax が複数ある場合はその直積を候補にし、T を最も有利にする（他型の最大点を
  //   最小化する）ベストケースで判定する。ベストケースで T が strict 単独最大（他型の最大点 < T総合点）に
  //   なることを要求する。判定材料は実ソース calculatePersonalityPoints、勝者確認は実ソース
  //   determineResult を使う（自前再実装しない）。
  //   注: T-argmax は各設問で固定なので T総合点は全正直ベクトルで不変。変わるのは他型の点のみ。

  /** 各設問について、typeId の points が最大となる choice インデックス集合を返す */
  function argmaxChoiceIndices(
    quiz: QuizDefinition,
    typeId: string,
  ): number[][] {
    return quiz.questions.map((q) => {
      let best = -Infinity;
      for (const c of q.choices) {
        const v = c.points?.[typeId] ?? 0;
        if (v > best) best = v;
      }
      const idxs: number[] = [];
      q.choices.forEach((c, i) => {
        if ((c.points?.[typeId] ?? 0) === best) idxs.push(i);
      });
      return idxs;
    });
  }

  // T-argmax 直積の上限。若草色型の分岐（=T-argmax が複数の設問）だけを列挙するため実際は
  // 極小（本diagnoses群で最大でも数千）。想定外の爆発を silent に通さないための安全弁。
  const HONEST_ENUM_CAP = 5_000_000;

  /**
   * typeId の正直回答者ベストケースを求め、strict 単独勝者かどうかを判定する。
   * 返り値: { tTotal, minMaxOpp, bestAnswers } — strict 条件は minMaxOpp < tTotal。
   */
  function analyzeHonest(quiz: QuizDefinition, typeId: string) {
    const candidateSets = argmaxChoiceIndices(quiz, typeId);
    const enumSize = candidateSets.reduce((n, s) => n * s.length, 1);
    if (enumSize > HONEST_ENUM_CAP) {
      throw new Error(
        `honest enumSize ${enumSize} > HONEST_ENUM_CAP for ${quiz.meta.slug}/${typeId}`,
      );
    }
    const resultIds = quiz.results.map((r) => r.id);
    const nQ = candidateSets.length;
    const cursor = new Array(nQ).fill(0);
    const choiceIdx = new Array(nQ).fill(0);

    let tTotal = -1;
    let minMaxOpp = Infinity;
    let bestAnswers: QuizAnswer[] = [];

    for (let done = false; !done;) {
      for (let i = 0; i < nQ; i++) choiceIdx[i] = candidateSets[i][cursor[i]];
      const answers = answersFromIndices(quiz, choiceIdx);
      const points = calculatePersonalityPoints(quiz.questions, answers);

      const tp = points[typeId] ?? 0;
      if (tTotal < 0) tTotal = tp;

      let maxOpp = -Infinity;
      for (const id of resultIds) {
        if (id === typeId) continue;
        const v = points[id] ?? 0;
        if (v > maxOpp) maxOpp = v;
      }

      if (maxOpp < minMaxOpp) {
        minMaxOpp = maxOpp;
        bestAnswers = answers;
      }

      let d = nQ - 1;
      for (; d >= 0; d--) {
        cursor[d]++;
        if (cursor[d] < candidateSets[d].length) break;
        cursor[d] = 0;
      }
      if (d < 0) done = true;
    }

    return { tTotal, minMaxOpp, bestAnswers };
  }

  describe.each(personalityQuizzes.map((q) => [q.meta.slug, q] as const))(
    "%s: 各タイプが正直な最大化回答で strict 単独勝者になる（理想回答者ガード）",
    (_slug, quiz) => {
      it.each(quiz.results.map((r) => r.id))(
        "タイプ %s は正直な最大化回答のベストケースで単独勝者",
        (typeId) => {
          const { tTotal, minMaxOpp, bestAnswers } = analyzeHonest(
            quiz,
            typeId,
          );
          // ベストケースで他型の最大点が T総合点を strict に下回る＝T が単独最大。
          expect(minMaxOpp).toBeLessThan(tTotal);
          // 実判定経路でもそのベストケース回答の勝者が T であることを確認（判定関数との整合）。
          expect(determineResult(quiz, bestAnswers).id).toBe(typeId);
        },
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
