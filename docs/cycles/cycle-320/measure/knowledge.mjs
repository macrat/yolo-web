// 知識クイズの本（答えのあとに正誤と「次へ」を見せる本）。measure.mjs が押す順と押しの種類を決め、report.mjs が
// 押しの種類（knowledge-answer・last-next）を決めるのに使う。2つの道具が同じ組で数えるよう、ここだけに置く。

export const KNOWLEDGE = new Set([
  "kotowaza-level",
  "yoji-level",
  "kanji-level",
]);
