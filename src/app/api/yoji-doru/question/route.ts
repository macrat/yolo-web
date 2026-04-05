/**
 * GET /api/yoji-doru/question
 *
 * サーバーサイドで四字熟語クイズの問題を1問生成して返す。
 * クライアントに渡すデータ量を最小化するため、回答前は以下のみを返す:
 * - meaning: 意味（問題文）
 * - choices: 四字熟語の文字列のみ（yojiフィールドのみ、詳細情報なし）
 * - correctAnswer: 正解の四字熟語の文字列
 *
 * reading, origin, example は回答前には送らない。
 */

import { NextResponse } from "next/server";
import type { YojiQuizEntry } from "@/play/games/yoji-doru/_lib/quiz";
import { generateQuestion } from "@/play/games/yoji-doru/_lib/quiz";
import rawYojiData from "@/data/yoji-data.json";

/** クイズに必要なフィールドのみを抽出したデータ */
const quizData: YojiQuizEntry[] = (
  rawYojiData as Array<{
    yoji: string;
    reading: string;
    meaning: string;
    category: string;
    origin: string;
    example: string;
  }>
).map(({ yoji, reading, meaning, category, origin, example }) => ({
  yoji,
  reading,
  meaning,
  category,
  origin,
  example,
}));

/** 回答後に表示する詳細情報 */
interface DetailInfo {
  yoji: string;
  reading: string;
  meaning: string;
  origin: string;
  example?: string;
}

/** クライアントに返すレスポンス型 */
interface QuestionResponse {
  /** 出題する四字熟語の意味 */
  meaning: string;
  /** 4つの選択肢（四字熟語の文字列のみ） */
  choices: string[];
  /** 正解の四字熟語の文字列 */
  correctAnswer: string;
  /** 回答後に表示する詳細情報（reading, origin, example） */
  detail: DetailInfo;
}

export async function GET(): Promise<NextResponse> {
  const question = generateQuestion(quizData);

  const response: QuestionResponse = {
    meaning: question.meaning,
    choices: question.choices.map((c) => c.yoji),
    correctAnswer: question.correctAnswer.yoji,
    detail: {
      yoji: question.detail.yoji,
      reading: question.detail.reading,
      meaning: question.detail.meaning,
      origin: question.detail.origin,
      example: question.detail.example,
    },
  };

  return NextResponse.json(response);
}
