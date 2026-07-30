"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { QuizChoice, QuizQuestion, QuizType } from "@/play/quiz/types";
import { isCorrectChoice } from "@/play/quiz/scoring";
import styles from "./QuestionCard.module.css";

/** Fisher-Yates shuffle: returns a new array with elements in random order */
function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type QuestionCardProps = {
  question: QuizQuestion;
  quizType: QuizType;
  onAnswer: (choiceId: string) => void;
  onNext: () => void;
};

export default function QuestionCard({
  question,
  quizType,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  // B-620: 「この設問は既に回答を送った」ことだけを表す同期ロック。
  // 表示（answered state）とは別の関心として分離する。
  // - なぜ state ではなく ref か: React は同一 tick 内の click を batch するため、
  //   setState の結果は 2 回目の handleSelect が読む値には反映されない。
  //   ボタンの disabled も再レンダー後にしか効かないので、二重タップや
  //   ブラウザによる入力イベントのまとめ配送で 2 回目が素通りする。
  //   ref なら代入がその場で見えるので 2 回目を確実に止められる。
  // - なぜマウント単位で良いか: QuizContainer は playing phase で
  //   key={question.id} により設問ごとに QuestionCard を再マウントするため、
  //   設問が変わればこの ref は初期値 false で作り直される（解除処理は不要）。
  // これが無いと、personality では onAnswer が 2 回呼ばれ、QuizContainer 側の
  // 「回答は closure の配列に 1 件だけ追加・index は関数形更新で 2 進む」により
  // 設問が 1 問飛ばされ、回答が 1 件欠けたまま結果が算出される。
  const answerSubmittedRef = useRef(false);

  // F2（WCAG 2.4.3 / 4.1.3）: 設問切替時のフォーカス管理。
  // QuizContainer は playing phase で key={question.id} により QuestionCard を
  // 再マウントする。何もしないと前設問の回答ボタンにあった focus が <body> に
  // 落ち、キーボード/SR 利用者は「設問が変わったこと」も現在位置も失う。
  // マウント時（=設問切替時）に設問見出しへプログラム的にフォーカスを移すことで、
  // 新設問が読み上げられ、そこから操作を続けられる。
  // preventScroll: true は結果リビール（QuizContainer）の流儀に合わせる
  // （設問はページ上部で通常スクロール不要。focus() 既定スクロールの誤発火を抑止）。
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    questionHeadingRef.current?.focus({ preventScroll: true });
  }, []);

  // Shuffle choices when the question changes to prevent positional bias
  const shuffledChoices: QuizChoice[] = useMemo(
    () => shuffleArray(question.choices),
    [question.choices],
  );

  const handleSelect = useCallback(
    (choiceId: string) => {
      // 二重発火ガード（B-620）。同期に効くので同一 tick の 2 回目も止まる。
      if (answerSubmittedRef.current) return;
      answerSubmittedRef.current = true;

      setSelectedId(choiceId);
      onAnswer(choiceId);

      if (quizType === "knowledge") {
        // Show feedback, wait for "Next" button
        setAnswered(true);
      }
      // personality type: onAnswer triggers immediate transition via parent
    },
    [onAnswer, quizType],
  );

  const getChoiceClassName = (choiceId: string): string => {
    if (!answered || quizType !== "knowledge") {
      return styles.choiceButton;
    }
    const correct = isCorrectChoice(question, choiceId);
    if (correct) {
      return `${styles.choiceButton} ${styles.choiceCorrect}`;
    }
    if (choiceId === selectedId && !correct) {
      return `${styles.choiceButton} ${styles.choiceWrong}`;
    }
    return styles.choiceButton;
  };

  // 正誤は色だけで伝えない（WCAG 1.4.1）。色に加えて短い文字ラベルを添える。
  const getFeedbackTag = (choiceId: string): string | null => {
    if (!answered || quizType !== "knowledge") return null;
    const correct = isCorrectChoice(question, choiceId);
    if (correct) return "正解";
    if (choiceId === selectedId) return "あなたの回答";
    return null;
  };

  return (
    <div className={styles.card} key={question.id}>
      {/* 設問文は見出し（h2）。ページ h1 は QuizPlayPageLayout が持つため設問は h2。
       * SR の見出しナビで設問に到達でき、F2 のフォーカス移動先も兼ねる
       * （tabIndex={-1} でプログラム的フォーカスのみ受ける）。 */}
      <h2
        ref={questionHeadingRef}
        tabIndex={-1}
        className={styles.questionText}
      >
        {question.text}
      </h2>
      <div className={styles.choices}>
        {shuffledChoices.map((choice) => {
          const feedbackTag = getFeedbackTag(choice.id);
          return (
            <button
              key={choice.id}
              type="button"
              className={getChoiceClassName(choice.id)}
              onClick={() => handleSelect(choice.id)}
              // answered は knowledge でのみ true になる（= disabled は knowledge の
              // 「回答済みで正誤を見ている」状態の見せ方）。personality を意図的に
              // disabled にしないのは、(1) 二重送信の抑止は answerSubmittedRef が
              // 同期に担っており state 由来の disabled では間に合わない、
              // (2) personality は押した直後に次設問へ遷移して再マウントされるため
              // 不活性表示が視覚的に意味を持たない、(3) フォーカス中のボタンを
              // disabled にするとフォーカスが <body> に落ち、SR 利用者の現在位置が
              // 壊れる（フォーカスは新設問見出しへ移すのが F2 の設計）——の 3 点。
              disabled={answered}
            >
              <span>{choice.text}</span>
              {feedbackTag && (
                <span className={styles.feedbackTag}>{feedbackTag}</span>
              )}
            </button>
          );
        })}
      </div>
      {answered && quizType === "knowledge" && (
        <>
          {question.explanation && (
            <div className={styles.explanation}>{question.explanation}</div>
          )}
          <button type="button" className={styles.nextButton} onClick={onNext}>
            次へ
          </button>
        </>
      )}
    </div>
  );
}
