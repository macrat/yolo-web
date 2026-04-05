/**
 * Quiz logic for ヨジドル - 四字熟語の意味当て4択クイズ
 *
 * 四字熟語データから1問分のクイズ問題を生成する。
 * - 正解の四字熟語を1つランダム選出
 * - 同カテゴリから3つの誤答をランダム選出（不足時は他カテゴリで補完）
 * - 4つの選択肢をシャッフルして返す
 */

/**
 * クイズに必要なフィールドのみを持つ四字熟語エントリ型。
 * difficulty / structure / sourceUrl はクライアントバンドルから除外するため含まない。
 */
export interface YojiQuizEntry {
  yoji: string;
  reading: string;
  meaning: string;
  category: string;
  origin: string;
  example: string;
}

/**
 * @deprecated YojiQuizEntry を使用してください。
 * ソースデータ全体のフィールドが必要な場合にのみ使用します。
 */
export interface YojiEntry extends YojiQuizEntry {
  difficulty: number;
  structure: string;
  sourceUrl: string;
}

export interface QuizChoice {
  yoji: string;
}

export interface QuizDetail {
  yoji: string;
  reading: string;
  meaning: string;
  origin: string;
  example?: string;
}

export interface QuizQuestion {
  /** 出題する四字熟語の意味 */
  meaning: string;
  /** 正解の四字熟語エントリ */
  correctAnswer: YojiQuizEntry;
  /** 4つの選択肢（シャッフル済み） */
  choices: YojiQuizEntry[];
  /** 正解後に表示する詳細情報 */
  detail: QuizDetail;
}

const CHOICES_COUNT = 4;
const WRONG_CHOICES_COUNT = CHOICES_COUNT - 1;

/**
 * Fisher-Yates shuffle: 配列をシャッフルして新しい配列を返す
 * 元の配列は変更しない
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * 配列からランダムにn個の要素を重複なし選出する
 */
function sampleWithoutReplacement<T>(arr: T[], n: number): T[] {
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, n);
}

/**
 * クイズ問題を1問生成する
 *
 * @param data - 四字熟語データ配列（最低4エントリ必要）
 * @returns クイズ問題
 * @throws データが4未満の場合
 */
export function generateQuestion(data: YojiQuizEntry[]): QuizQuestion {
  if (data.length < CHOICES_COUNT) {
    throw new Error(
      `データが不足しています。最低${CHOICES_COUNT}件必要です（現在: ${data.length}件）`,
    );
  }

  // ランダムに正解を選ぶ
  const correctAnswer = data[Math.floor(Math.random() * data.length)]!;

  // 同カテゴリの誤答候補（正解を除く）
  const sameCategoryWrongCandidates = data.filter(
    (entry) =>
      entry.category === correctAnswer.category &&
      entry.yoji !== correctAnswer.yoji,
  );

  // 他カテゴリの誤答候補
  const otherCategoryWrongCandidates = data.filter(
    (entry) => entry.category !== correctAnswer.category,
  );

  // 同カテゴリから最大3つ選出、不足分は他カテゴリから補完
  const sameCategorySelected = sampleWithoutReplacement(
    sameCategoryWrongCandidates,
    Math.min(WRONG_CHOICES_COUNT, sameCategoryWrongCandidates.length),
  );

  const remainingCount = WRONG_CHOICES_COUNT - sameCategorySelected.length;
  const otherCategorySelected = sampleWithoutReplacement(
    otherCategoryWrongCandidates,
    remainingCount,
  );

  const wrongChoices = [...sameCategorySelected, ...otherCategorySelected];

  // 4択をシャッフル
  const choices = shuffleArray([correctAnswer, ...wrongChoices]);

  return {
    meaning: correctAnswer.meaning,
    correctAnswer,
    choices,
    detail: {
      yoji: correctAnswer.yoji,
      reading: correctAnswer.reading,
      meaning: correctAnswer.meaning,
      origin: correctAnswer.origin,
      example: correctAnswer.example,
    },
  };
}
