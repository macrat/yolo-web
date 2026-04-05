"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { generateQuestion } from "@/play/games/yoji-doru/_lib/quiz";
import type {
  QuizQuestion,
  YojiQuizEntry,
} from "@/play/games/yoji-doru/_lib/quiz";
import styles from "./GameContainer.module.css";

interface Props {
  /** サーバーコンポーネントから渡される四字熟語データ（クイズ必要フィールドのみ） */
  data: YojiQuizEntry[];
}

/** 回答状態 */
type AnswerState =
  | { status: "unanswered" }
  | { status: "answered"; selectedYoji: string; isCorrect: boolean };

/**
 * ヨジドル ゲームコンテナ
 *
 * 四字熟語の意味を見て4択から正しい四字熟語を選ぶクイズゲーム。
 * yoji-data.json（400語）からランダムに出題する。
 *
 * NOTE: questionの初期値はnullにし、useEffectで設定する。
 * Math.random()を使うgenerateQuestionをuseStateの初期値関数で呼ぶと、
 * サーバーとクライアントで異なる結果が生成されReact Hydration Errorが発生するため。
 */
export default function GameContainer({ data }: Props) {
  // nullで初期化しuseEffectでマウント後に設定することでハイドレーションミスマッチを防ぐ
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>({
    status: "unanswered",
  });

  // クライアントサイドでのみ初回問題を生成する（Math.random()はSSRで実行するとハイドレーションミスマッチになる）
  useEffect(() => {
    setQuestion(generateQuestion(data));
  }, [data]);

  const handleChoiceSelect = useCallback(
    (yoji: string) => {
      if (answerState.status === "answered" || question === null) return;
      const isCorrect = yoji === question.correctAnswer.yoji;
      setAnswerState({ status: "answered", selectedYoji: yoji, isCorrect });
    },
    [answerState, question],
  );

  const handleNextQuestion = useCallback(() => {
    setQuestion(generateQuestion(data));
    setAnswerState({ status: "unanswered" });
  }, [data]);

  const isAnswered = answerState.status === "answered";

  /**
   * 選択肢ボタンのCSSクラスを決定する
   * - 未回答: デフォルト
   * - 回答済み:
   *   - 正解の選択肢: 緑
   *   - 選んだ不正解の選択肢: 赤
   *   - 選んでいない選択肢: 薄く表示
   */
  function getChoiceClass(choiceYoji: string): string {
    if (!isAnswered || question === null) return styles.choiceButton;

    const correctYoji = question.correctAnswer.yoji;

    if (choiceYoji === correctYoji) {
      return `${styles.choiceButton} ${styles.choiceCorrectAnswer}`;
    }

    if (
      answerState.status === "answered" &&
      choiceYoji === answerState.selectedYoji
    ) {
      return `${styles.choiceButton} ${styles.choiceWrong}`;
    }

    return `${styles.choiceButton} ${styles.choiceInactive}`;
  }

  // question が null の間はローディング表示（SSR/ハイドレーション安全のため）
  if (question === null) {
    return <div className={styles.container} aria-busy="true" />;
  }

  return (
    <div className={styles.container}>
      {/* 問題カード: 意味を表示 */}
      <div className={styles.questionCard} role="region" aria-label="問題">
        <p className={styles.questionLabel}>この意味の四字熟語はどれ？</p>
        <p className={styles.questionMeaning}>{question.meaning}</p>
      </div>

      {/* 4択ボタン */}
      <div className={styles.choicesGrid} role="group" aria-label="選択肢">
        {question.choices.map((choice) => (
          <button
            key={choice.yoji}
            type="button"
            className={getChoiceClass(choice.yoji)}
            onClick={() => handleChoiceSelect(choice.yoji)}
            disabled={isAnswered}
            aria-pressed={
              answerState.status === "answered" &&
              answerState.selectedYoji === choice.yoji
            }
          >
            {choice.yoji}
          </button>
        ))}
      </div>

      {/* 回答後フィードバック */}
      {answerState.status === "answered" && (
        <div
          className={`${styles.feedback} ${
            answerState.isCorrect
              ? styles.feedbackCorrect
              : styles.feedbackWrong
          }`}
          role="status"
          aria-live="polite"
        >
          <p
            className={`${styles.feedbackTitle} ${
              answerState.isCorrect
                ? styles.feedbackCorrectTitle
                : styles.feedbackWrongTitle
            }`}
          >
            {answerState.isCorrect ? "正解！" : "不正解..."}
          </p>

          {/* 四字熟語の詳細 */}
          <div className={styles.detailCard}>
            <p className={styles.detailYoji}>{question.detail.yoji}</p>
            <p className={styles.detailReading}>
              （{question.detail.reading}）
            </p>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>意味</span>
              <span className={styles.detailValue}>
                {question.detail.meaning}
              </span>
            </div>
            {question.detail.origin && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>由来</span>
                <span className={styles.detailValue}>
                  {question.detail.origin}
                </span>
              </div>
            )}
            {question.detail.example && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>例文</span>
                <span className={styles.detailValue}>
                  {question.detail.example}
                </span>
              </div>
            )}
          </div>

          {/* アクション */}
          <div className={styles.actions}>
            <Link
              href={`/dictionary/yoji/${encodeURIComponent(question.detail.yoji)}`}
              className={styles.dictionaryLink}
            >
              「{question.detail.yoji}」を辞典で詳しく調べる →
            </Link>
            <button
              type="button"
              className={styles.nextButton}
              onClick={handleNextQuestion}
            >
              もう1問
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
