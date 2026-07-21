import type {
  QuizDefinition,
  QuizAnswer,
  QuizResult,
  QuizQuestion,
} from "./types";

/**
 * Calculate the score for a knowledge-type quiz.
 * Returns the number of correct answers.
 */
export function calculateKnowledgeScore(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
): number {
  let correct = 0;
  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const choice = question.choices.find((c) => c.id === answer.choiceId);
    if (choice?.isCorrect) {
      correct += 1;
    }
  }
  return correct;
}

/**
 * Calculate accumulated points for a personality-type quiz.
 * Returns a map of result IDs to their total points.
 */
export function calculatePersonalityPoints(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
): Record<string, number> {
  const points: Record<string, number> = {};
  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const choice = question.choices.find((c) => c.id === answer.choiceId);
    if (choice?.points) {
      for (const [key, value] of Object.entries(choice.points)) {
        points[key] = (points[key] ?? 0) + value;
      }
    }
  }
  return points;
}

/**
 * Determine the quiz result based on the quiz type and answers.
 * - knowledge type: matches score to the result with the highest minScore
 *   that the user meets.
 * - personality type: selects the result with the highest accumulated points.
 *
 * Returns the matched QuizResult, or the first result as fallback.
 */
export function determineResult(
  quiz: QuizDefinition,
  answers: QuizAnswer[],
): QuizResult {
  if (quiz.meta.type === "knowledge") {
    const score = calculateKnowledgeScore(quiz.questions, answers);
    // Results should be sorted by minScore ascending; find the best match
    const sorted = [...quiz.results].sort(
      (a, b) => (b.minScore ?? 0) - (a.minScore ?? 0),
    );
    for (const result of sorted) {
      if (score >= (result.minScore ?? 0)) {
        return result;
      }
    }
    return quiz.results[0];
  }

  // personality type
  //
  // 同点タイブレークは strict `>` により「quiz.results の配列で先に現れるタイプ」が勝つ
  // （決定的＝同じ回答なら常に同じ結果。シェア／再受験の再現性のために決定的であることが重要）。
  // cycle-294 の全診断・回答空間計測（docs/cycles/cycle-294/findings.md）で以下を確認済み:
  //   - 全 personality 診断で到達不能タイプは存在しない（どのタイプも単独勝ちする回答が多数ある）。
  //   - 同点は「スコアが等しい＝等しく妥当なトップ」の一つを返すため個々の来訪者に実害はない。
  //   - 配列順が集計分布に与える偏りは最大でも先頭タイプ +約6%pt で来訪者に不可視。
  // このため配列順タイブレークは是正せず維持する。将来データ編集で孤児タイプ／恒常敗退タイプが
  // 生まれる事故は reachability.test.ts が回帰ガードする（悉皆列挙できる規模＝110万組合せ以下
  // （実装の EXHAUSTIVE_CAP=1,100,000 に一致）は厳密確認、それ超の大規模診断＝character-personality
  // 等は決定的サンプリングで高確度確認）。
  const points = calculatePersonalityPoints(quiz.questions, answers);
  let bestResultId = quiz.results[0].id;
  let bestScore = -1;
  for (const result of quiz.results) {
    const resultScore = points[result.id] ?? 0;
    if (resultScore > bestScore) {
      bestScore = resultScore;
      bestResultId = result.id;
    }
  }
  return quiz.results.find((r) => r.id === bestResultId) ?? quiz.results[0];
}

/**
 * Check if a specific choice is the correct answer (knowledge type).
 */
export function isCorrectChoice(
  question: QuizQuestion,
  choiceId: string,
): boolean {
  const choice = question.choices.find((c) => c.id === choiceId);
  return choice?.isCorrect === true;
}
