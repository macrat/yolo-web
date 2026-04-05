"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import styles from "./GameContainer.module.css";

/** APIレスポンスで返される詳細情報 */
interface DetailInfo {
  yoji: string;
  reading: string;
  meaning: string;
  origin: string;
  example?: string;
}

/** GET /api/yoji-doru/question のレスポンス型 */
interface QuestionApiResponse {
  meaning: string;
  choices: string[];
  correctAnswer: string;
  detail: DetailInfo;
}

/** 回答状態 */
type AnswerState =
  | { status: "unanswered" }
  | { status: "answered"; selectedYoji: string; isCorrect: boolean };

/**
 * ヨジドル ゲームコンテナ
 *
 * 四字熟語の意味を見て4択から正しい四字熟語を選ぶクイズゲーム。
 * GET /api/yoji-doru/question を呼び出してサーバーサイドで生成された問題を取得する。
 *
 * NOTE: useEffectでAPIを呼び出すことでSSR/ハイドレーションの問題を回避する。
 */
export default function GameContainer() {
  // nullで初期化しuseEffectでAPIから取得後に設定することでハイドレーションミスマッチを防ぐ
  const [question, setQuestion] = useState<QuestionApiResponse | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>({
    status: "unanswered",
  });

  /** APIから問題を取得してstateに設定する */
  const fetchQuestion = useCallback(async () => {
    const response = await fetch("/api/yoji-doru/question");
    const data: QuestionApiResponse = await response.json();
    setQuestion(data);
  }, []);

  // マウント時にAPIから問題を取得する（SSRでMath.random()が実行されないようuseEffect内で行う）
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- API fetch on mount: external data source, not cascading state
    void fetchQuestion();
  }, [fetchQuestion]);

  const handleChoiceSelect = useCallback(
    (yoji: string) => {
      if (answerState.status === "answered" || question === null) return;
      const isCorrect = yoji === question.correctAnswer;
      setAnswerState({ status: "answered", selectedYoji: yoji, isCorrect });
    },
    [answerState, question],
  );

  const handleNextQuestion = useCallback(() => {
    setQuestion(null);
    setAnswerState({ status: "unanswered" });
    void fetchQuestion();
  }, [fetchQuestion]);

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

    const correctYoji = question.correctAnswer;

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
            key={choice}
            type="button"
            className={getChoiceClass(choice)}
            onClick={() => handleChoiceSelect(choice)}
            disabled={isAnswered}
            aria-pressed={
              answerState.status === "answered" &&
              answerState.selectedYoji === choice
            }
          >
            {choice}
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
