import type { Difficulty, YojiCategory, YojiOrigin } from "./types";

/** 難易度の名前。難易度の組・入力欄のラベル・共有の文が同じ語を使う。 */
export const difficultyNames: Record<Difficulty, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

/** カテゴリの日本語表示ラベル */
export const categoryLabels: Record<YojiCategory, string> = {
  life: "人生・生き方",
  effort: "努力・根性",
  nature: "自然・風景",
  emotion: "感情・心理",
  society: "社会・人間関係",
  knowledge: "知識・学問",
  conflict: "対立・戦い",
  change: "変化・転換",
  virtue: "道徳・美徳",
  negative: "否定的・戒め",
};

/** 出典区分の日本語表示ラベル */
export const originLabels: Record<YojiOrigin, string> = {
  中国: "中国古典由来",
  日本: "日本で成立",
  不明: "出典不明",
};

/** 答えの四字熟語の出典を、結果の中で1文で言う語 */
export const originSentences: Record<YojiOrigin, string> = {
  中国: "中国の古典に由来する四字熟語",
  日本: "日本で生まれた四字熟語",
  不明: "出典のはっきりしない四字熟語",
};

/** 難易度の星表示ラベル（difficulty値 1-3 に対応） */
export const difficultyLabels: Record<1 | 2 | 3, string> = {
  1: "★",
  2: "★★",
  3: "★★★",
};
