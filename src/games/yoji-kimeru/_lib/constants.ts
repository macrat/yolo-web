import type { YojiCategory, YojiOrigin } from "./types";

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

/** 難易度の星表示ラベル（index=difficultyの値） */
export const difficultyLabels = ["", "★", "★★", "★★★"];
