"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { QuizChoice, QuizQuestion, QuizType } from "@/play/quiz/types";
import {
  activationOriginOfClick,
  type ActivationOrigin,
} from "@/play/quiz/quizProgress";
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
  /**
   * 回答を親へ渡し、**受け付けられたかどうか**を返してもらう。
   *
   * - どの設問への回答かを必ず名乗る（questionId）。親は「表示中の設問への回答か」
   *   を見て冪等に処理するため、名乗りが無いと遅れて届いた 2 回目を
   *   「次の設問への回答」と区別できない（B-620）。
   * - 入力が**どこから来たか**（origin）も渡す。親の最小間隔ガードは「1 つの
   *   ジェスチャの 2 打目が、画面の入れ替わりで別の要素に落ちる」ことだけを
   *   守っており、それは座標のヒットテストを経る入力にしか起こらない。
   *   キーボードや支援技術の起動にまで当てると、守るものがゼロのまま正当な
   *   入力を無言で捨てることになる。判定は `activationOriginOfClick`。
   * - 戻り値は「届いたか」ではなく **回答が実際に記録されたか**。false になるのは
   *   親が遷移の最小間隔ガードで弾いたとき（＝設問が変わった直後に届いた、直前の
   *   ジェスチャの 2 打目）か、進行状態の不変条件が捨てたときである。false のとき
   *   この コンポーネントは表示を変えてはならない。記録されていない回答を
   *   「あなたの回答」として見せてしまうのに加え、マウント単位のロックが
   *   掛かって**その設問に二度と答えられなくなる**ため。
   */
  onAnswer: (
    questionId: string,
    choiceId: string,
    origin: ActivationOrigin,
  ) => boolean;
  /**
   * 「次へ」も同様に、どの設問から進もうとしているかを名乗る。
   *
   * `origin` も渡す。「次へ」自体に間隔ガードは掛からないが、これは**画面を
   * 入れ替える**操作なので、親はここでガードと窓を arm する。arm してよいのは
   * 「1つのジェスチャの2打目」が存在しうるポインタ由来のときだけである
   * （キーボードで押された遷移の後に来る指のタップは、必ず別のジェスチャの
   * 1打目＝守る対象ではない）。
   */
  onNext: (questionId: string, origin: ActivationOrigin) => void;
};

export default function QuestionCard({
  question,
  quizType,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  // B-620: 「このマウントでは既に回答を送った」ことだけを表す同期ロック。
  // 表示（answered state）とは別の関心として分離する。
  //
  // - なぜ state ではなく ref か: React は同一 tick 内の click を batch するため、
  //   setState の結果は 2 回目の handleSelect が読む値には反映されない。
  //   ボタンの disabled も再レンダー後にしか効かないので、二重タップや
  //   ブラウザによる入力イベントのまとめ配送で 2 回目が素通りする。
  //   ref なら代入がその場で見えるので 2 回目を確実に止められる。
  // - このロックが守るのは「このコンポーネント自身の契約＝1 マウント 1 回だけ
  //   onAnswer を呼ぶ」であって、進行状態の正しさではない。**正しさは親が持つ**:
  //   QuizContainer の進行状態は純関数 reduceQuizProgress で冪等化されており
  //   （1 設問 1 回答／未回答からは進まない／二重タップの 2 回目を弾く最小間隔
  //   ガード）、この ref が無くても設問飛ばしや回答欠落は起きない。かつては
  //   ここが唯一の防波堤だったが、マウント単位の ref では**別 task で届く
  //   2 回目の実タップ**を原理的に止められないため、防御は親へ移した。
  // - このロックはマウント単位なので、設問が変わるたびに初期値 false で作り直される
  //   ことに依っている（解除処理は不要）。その再マウントは QuizContainer が
  //   playing phase で付ける key={question.id}（QuizContainer.tsx）による。
  //   同一クイズ内で question.id が重複すると key が同じになって再マウントされず、
  //   2 問目以降が回答不能になる。この前提は
  //   src/play/quiz/__tests__/registry.test.ts の
  //   "all question IDs are unique"（全 15 本に適用）が機械的に強制している。
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
    (choiceId: string, origin: ActivationOrigin) => {
      // 二重発火ガード（B-620）。同期に効くので同一 tick の 2 回目も止まる。
      if (answerSubmittedRef.current) return;

      // 親が受け付けなかった回答（遷移の最小間隔ガードで弾かれた＝直前の設問への
      // タップの余波）では、ロックも表示も変えない。ここでロックすると、記録が
      // 無いのに再タップも効かなくなり、その設問に答えられなくなる。
      if (!onAnswer(question.id, choiceId, origin)) return;
      answerSubmittedRef.current = true;

      setSelectedId(choiceId);
      if (quizType === "knowledge") {
        // Show feedback, wait for "Next" button
        setAnswered(true);
      }
      // personality type: onAnswer triggers immediate transition via parent
    },
    [onAnswer, question.id, quizType],
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
    // 設問ごとの再マウントは呼び出し側（QuizContainer）の key={question.id} が
    // 起こす。単一要素を返すコンポーネントの root に key を付けても自身の
    // 再マウントは起きないため、ここに key は置かない。
    <div className={styles.card}>
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
              // click の発生源を親へ伝える。`event.detail` は click 回数で、
              // ポインタ由来なら 1 以上・キーボード等の合成 click では 0 になる
              // （根拠と一次資料は activationOriginOfClick のコメント）。
              onClick={(event) =>
                handleSelect(choice.id, activationOriginOfClick(event.detail))
              }
              // answered は knowledge でのみ true になる（= disabled は knowledge の
              // 「回答済みで正誤を見ている」状態の見せ方）。personality を意図的に
              // disabled にしないのは次の 3 点。
              // (1) 二重送信の抑止に使えない: state 由来の disabled は再レンダー後
              //     にしか効かず、同一 tick の 2 回目を止められない（＝元の欠陥
              //     そのもの）。抑止は同期 ref と親の冪等化・間隔ガードが担う。
              // (2) personality ではそもそも描画され得ない: 回答は進行状態を
              //     1 つの値として更新するため、回答の記録と設問送りが同じ commit で
              //     起きる。このカードが answered=true の状態で再レンダーされること
              //     はなく（次の設問の新しいカードに置き換わる）、属性を変えても
              //     来訪者には届かない。**「窓が短いから問題ない」ではない**——
              //     押した手応えが無いこと自体は実在の問題で、それは選択の即時
              //     フィードバック（B-614）として別途手当てする。
              // (3) フォーカス中のボタンを disabled にするとフォーカスが <body> に
              //     落ち、SR 利用者の現在位置が壊れる（フォーカスは新設問見出しへ
              //     移すのが F2 の設計）。
              //
              // aria-disabled + pointer-events: none でフォーカスを保ったまま
              // 不活性化する案も検討したが不採用。理由は (2) と同じで、personality
              // では属性を反映した再レンダーが起きないため何も表示されず、
              // 二重送信の抑止としても state 由来である点が (1) のまま変わらない
              // （pointer-events は同一 tick の 2 回目に間に合わない）。
              // B-614 で「選択を見せてから送る」形になり回答済みのカードが
              // 描画されるようになったら、その時点で再検討する価値がある。
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
          <button
            type="button"
            className={styles.nextButton}
            onClick={(event) =>
              onNext(question.id, activationOriginOfClick(event.detail))
            }
          >
            次へ
          </button>
        </>
      )}
    </div>
  );
}
