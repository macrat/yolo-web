"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { trackContentStart, trackContentEnd } from "@/lib/analytics";
import {
  measureGroupPlan,
  measureHeadedBoxPlan,
  measurePageTopPlan,
  revealGroup,
  revealLanding,
  type ScreenPoint,
} from "@/lib/reveal";
import Link from "next/link";
import type { QuizDefinition, QuizResult } from "@/play/quiz/types";
import {
  answeredChoiceId,
  currentQuestionId,
  initialQuizProgress,
  reduceQuizProgress,
  type QuizProgress,
  type QuizProgressAction,
} from "@/play/quiz/quizProgress";
import {
  determineResult,
  calculateKnowledgeScore,
  getTiedTypeIds,
} from "@/play/quiz/scoring";
import { determineScienceThinkingResult } from "@/play/quiz/data/science-thinking";
import { determineCharacterPersonalityResult } from "@/play/quiz/data/character-personality";
import { getEstimatedTime } from "./introBadges";
import Button from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import Section from "@/components/Section";
import type { ItemListItem } from "@/components/ItemList";
import type { ResultHeading } from "@/components/ResultBox";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import ResultExtraLoader, { hasResultExtra } from "./ResultExtraLoader";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import styles from "./QuizContainer.module.css";

type QuizContainerProps = {
  /** ページの頭（パンくずと h1）。どの段階でも最初のセクションの頭に置く。 */
  head: ReactNode;
  quiz: QuizDefinition;
  /** 相性を見る友達のタイプの id（共有のリンクの ref） */
  referrerTypeId?: string;
  /**
   * 解き終えた画面の「次はこれを試してみよう」に並べる次の遊びの行。遊びの登録をクライアントに持ち込まないよう、
   * サーバーで行にしてから受け取る。
   */
  recommendedContents?: ItemListItem[];
  /** 結果の見出し（タイプ名）の文節の区切りと書体の属性。結果の id ごとに、サーバーで作ってから受け取る。 */
  resultHeadings: Readonly<Record<string, ResultHeading>>;
  /** 詳しい読みものの小見出しの文節の区切り。小見出しの文ごとに、サーバーで作ってから受け取る。 */
  readingHeadings: Readonly<Record<string, readonly string[]>>;
};

/**
 * 診断で押した選択肢を見せてから次の問か結果へ移るまでの長さ（ms）。§11 の操作フィードバックの上限で、動きではない
 * ので prefers-reduced-motion でも変えない。
 */
export const ANSWER_SHOWN_MS = 150;

/** 結果のボックスの頭の、結果の名前の要素。ボックスはこの名前で名付けられている（無ければボックスそのもの）。 */
function resultNameOf(box: HTMLElement): Element {
  const nameId = box.getAttribute("aria-labelledby");
  return (nameId && document.getElementById(nameId)) || box;
}

/**
 * クイズ・診断の本体。開始 → 設問 → 結果の段階を持ち、段階ごとにページのセクションを描く（DESIGN.md §5）。
 * 開始の画面と設問では、ページの頭と本体を1つのセクションに置く。解き終えた画面では、ページの頭と結果に続けて
 * 「このタイプについて」「次はこれを試してみよう」「すべてのタイプ」を兄弟のセクションとして並べる（ResultCard）。
 * よくある質問から後ろのセクションは、ページ（QuizPlayPageLayout）が続けて置く。
 */
export default function QuizContainer({
  head,
  quiz,
  referrerTypeId,
  recommendedContents,
  resultHeadings,
  readingHeadings,
}: QuizContainerProps) {
  const questionIds = useMemo(
    () => quiz.questions.map((question) => question.id),
    [quiz.questions],
  );
  const [progress, dispatch] = useReducer(
    (state: QuizProgress, action: QuizProgressAction) =>
      reduceQuizProgress(state, action, questionIds),
    initialQuizProgress,
  );
  const { phase, currentIndex, answers } = progress;
  const currentId = currentQuestionId(progress, questionIds);
  const currentAnswer =
    currentId === undefined ? undefined : answeredChoiceId(progress, currentId);

  const contentType = quiz.meta.type === "personality" ? "diagnosis" : "quiz";
  const contentId = contentIdForQuiz(quiz.meta.slug);

  // 開始と結果に着いたことの計測は、段階が変わったときに1度だけ送る。「はじめる」や最後の答えの二度押しで2回送らない。
  const previousPhaseRef = useRef(phase);
  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    previousPhaseRef.current = phase;
    if (previousPhase === phase) return;
    if (phase === "playing") trackContentStart(contentId, contentType);
    if (phase === "result") trackContentEnd(contentId, contentType, true);
  }, [phase, contentId, contentType]);

  // 診断では、押した選択肢を見せてから次の問か結果へ進む。タイマーは答えた問の id を名指すので、ほかの経路と
  // 重なっても進むのは1問だけで、見せているあいだに部品が外れたら止まる。
  const isPersonality = quiz.meta.type === "personality";
  useEffect(() => {
    if (!isPersonality || currentId === undefined) return;
    if (currentAnswer === undefined) return;
    const timer = setTimeout(
      () => dispatch({ type: "advance", questionId: currentId }),
      ANSWER_SHOWN_MS,
    );
    return () => clearTimeout(timer);
  }, [isPersonality, currentId, currentAnswer]);

  // 送りの範囲を測る要素と、フォーカスを受ける要素。
  const introFactsRef = useRef<HTMLParagraphElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const choicesRef = useRef<HTMLUListElement>(null);
  const pressedRowRef = useRef<HTMLLIElement>(null);
  const correctRowRef = useRef<HTMLLIElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const resultBoxRef = useRef<HTMLElement>(null);

  const answered = currentAnswer !== undefined;

  /** いま出ている画面。切り替わりの前の画面を知るためと、字の読み込みのあとに送り直す範囲を選ぶために持つ。 */
  const screenRef = useRef({ phase, answered, isPersonality });
  /** 最新の切り替わりの番号。window の受け手が、React の click の処理より先に読む。 */
  const transitionRef = useRef(progress.transition);
  /** 1打目を押した点（click の座標）。キーボードで押したとき（click の detail が 0）は null。 */
  const pressPointRef = useRef<ScreenPoint | null>(null);
  /** 連続の押しの1打目（detail が 1 の mousedown）のときの切り替わりの番号。 */
  const pressSequenceStartRef = useRef<number | null>(null);
  /** いまの問か答えたあとの形を見せてから、来訪者が自分で画面を送ったか。 */
  const visitorScrolledRef = useRef(false);
  /** 1回解くあいだに描いた問の区画のいちばん高いものと、それを測ったときの区画の幅と文字の大きさ。 */
  const heldStageRef = useRef<{ height: number; layout: string } | null>(null);

  /**
   * 問の区画の最小の高さを、1回解くあいだに描いたいちばん高い区画に保つ。短い問に移っても下のよくある質問などが
   * 持ち上がらず、前の問を押した点は次の問でも区画の中に残る（二度押しの2打目が区画の外へ落ちない）。区画の幅か
   * 文字の大きさが変わったら、そのときの高さからやり直す。
   * 中身の高さは、最小の高さを外さずに中身の下端から測る。外して測ると、ページの下のほうにいるときに文書が一瞬
   * 縮み、ブラウザが送りの位置を詰めてしまう。
   */
  const holdStageHeight = useCallback((): void => {
    const stage = stageRef.current;
    const last = stage?.lastElementChild;
    if (!stage || !last) return;
    const layout = `${stage.clientWidth}/${getComputedStyle(document.documentElement).fontSize}`;
    const contentHeight =
      last.getBoundingClientRect().bottom +
      (parseFloat(getComputedStyle(last).marginBottom) || 0) -
      stage.getBoundingClientRect().top;
    const held = heldStageRef.current;
    const height =
      held && held.layout === layout
        ? Math.max(held.height, contentHeight)
        : contentHeight;
    heldStageRef.current = { height, layout };
    stage.style.minHeight = `${height}px`;
  }, []);

  /** 知識クイズで答えたあとに見せる範囲の上端の行。押した行と正解の行の上のほう。 */
  const upperAnsweredRow = useCallback((): HTMLLIElement | null => {
    const pressed = pressedRowRef.current;
    const correct = correctRowRef.current;
    if (!pressed || !correct) return pressed ?? correct;
    return correct.getBoundingClientRect().top <
      pressed.getBoundingClientRect().top
      ? correct
      : pressed;
  }, []);

  // 切り替わりのあとの送りとフォーカス。来訪者の操作（始める・答える・進む・やり直す）で画面が切り替わったら、塗る前に、
  // 画面ごとに決めた範囲を見せる着地へ送り（DESIGN.md §8）、そのあとフォーカスを送らずに移す。送りを先にするので、
  // フォーカスの置き場が画面の外にあってもブラウザが勝手に送らず、フォーカスが body にある画面も、送る前の位置の
  // 画面も塗られない。着地は、二度押しの2打目が押す所（1打目の点）の真下に押せるものが来ないものを選ぶ。
  // 切り替わりの番号がマウントのときから変わっていなければ（開いた直後・作り直されたとき）何もせず、ページの途中への
  // リンクや戻る操作で着いた位置と読み上げの位置を壊さない。
  const mountTransitionRef = useRef(progress.transition);
  useLayoutEffect(() => {
    transitionRef.current = progress.transition;
    const previous = screenRef.current;
    screenRef.current = { phase, answered, isPersonality };
    if (progress.transition === mountTransitionRef.current) return;
    const point = pressPointRef.current;

    if (phase === "intro") {
      // やり直したあと。開始の画面をページの頭から見せ、「はじめる」は避けない（2打目が押しても、もう一度解く
      // という来訪者のしようとしたことのとおりに始まる）。
      const facts = introFactsRef.current;
      const start = startButtonRef.current;
      if (!facts || !start) return;
      revealLanding(measurePageTopPlan(facts, start), point, {
        exclude: start,
      });
      start.focus({ preventScroll: true });
      return;
    }

    if (phase === "result") {
      const box = resultBoxRef.current;
      if (!box) return;
      revealLanding(measureHeadedBoxPlan(box, resultNameOf(box)), point);
      box.focus({ preventScroll: true });
      return;
    }

    if (previous.phase !== "playing") heldStageRef.current = null;
    holdStageHeight();
    visitorScrolledRef.current = false;
    const stage = stageRef.current;
    const choices = choicesRef.current;

    if (!answered) {
      // 次の問が出た。「はじめる」と知識クイズの「次へ」のあとは、まだ読んでいない問に答えを入れないよう、次の問の
      // 選択肢も避ける。診断の答えのあとは、点の真下に次の問の選択肢が来るのがほぼ毎問なので、避けると問ごとに
      // 選択肢の位置が動く。そこで避けない。
      if (stage && choices) {
        const fromDiagnosisAnswer =
          previous.phase === "playing" && isPersonality;
        revealLanding(
          measureGroupPlan(stage, choices),
          point,
          fromDiagnosisAnswer ? { exclude: stage } : { avoidNext: stage },
        );
      }
      questionHeadingRef.current?.focus({ preventScroll: true });
      return;
    }

    // 答えた。知識クイズでは正誤の字から「次へ」までを見せ、「次へ」も避ける（2打目が解説を読ませずに次の問へ進めない）。
    // 診断で押した行を見せるあいだは送らない。
    if (!isPersonality) {
      const upperRow = upperAnsweredRow();
      const next = nextButtonRef.current;
      if (upperRow && next) {
        revealLanding(measureGroupPlan(upperRow, next), point);
      }
    }
    pressedRowRef.current?.focus({ preventScroll: true });
  }, [
    progress.transition,
    phase,
    answered,
    isPersonality,
    holdStageHeight,
    upperAnsweredRow,
  ]);

  // ページの上の入力と、字の読み込みと画面の大きさの変わりの受け手。押した点と2打目の受け手は捕捉の段階で受け、
  // React の click の処理より先に走る。
  useEffect(() => {
    // 押した点を覚える。切り替わったあとの着地は、同じ点に落ちる2打目を見て選ぶ。
    const rememberPressPoint = (event: MouseEvent): void => {
      pressPointRef.current =
        event.detail === 0 ? null : { x: event.clientX, y: event.clientY };
    };
    // 2打目で語を選ばない。連続の押しの1打目が画面を切り替えたら（番号が増えていたら）、2打目からの既定の動き
    // （語の選択）を止める。入れ替わった先の字（答えたあとの行・解説・次の問の見出し・結果・開始の画面）に黒い地の
    // 選択が残らない。字の上で始めたダブルクリックと引いて選ぶことは、1打目が何も切り替えないので止めない。
    // 2打目の click はそのまま届く。
    const guardSecondPress = (event: MouseEvent): void => {
      if (event.detail === 1) {
        pressSequenceStartRef.current = transitionRef.current;
        return;
      }
      const sequenceStart = pressSequenceStartRef.current;
      if (
        event.detail >= 2 &&
        sequenceStart !== null &&
        transitionRef.current > sequenceStart
      ) {
        event.preventDefault();
      }
    };
    // 来訪者の送りは、送りを起こす入力で知る。scroll の知らせは、こちらの送りや字の組み替えに伴うブラウザの送りでも
    // 届き、来訪者の送りと見分けられない。
    const noteVisitorScroll = (): void => {
      visitorScrolledRef.current = true;
    };
    // 字の読み込みで問の高さが変わったら、区画の高さを保ち直し、見せている範囲が画面から外れていれば同じ決め方で
    // 送り直す。来訪者が自分で送ったあとは、その送りと取り合わない。
    const revealAfterFontLoad = (): void => {
      const screen = screenRef.current;
      if (screen.phase !== "playing") return;
      holdStageHeight();
      if (visitorScrolledRef.current) return;
      const stage = stageRef.current;
      const choices = choicesRef.current;
      if (!screen.answered) {
        if (stage && choices) revealGroup(stage, choices);
        return;
      }
      const upperRow = screen.isPersonality ? null : upperAnsweredRow();
      const next = nextButtonRef.current;
      if (upperRow && next) revealGroup(upperRow, next);
    };
    const fonts = document.fonts as FontFaceSet | undefined;

    window.addEventListener("click", rememberPressPoint, true);
    window.addEventListener("mousedown", guardSecondPress, true);
    window.addEventListener("wheel", noteVisitorScroll, { passive: true });
    window.addEventListener("touchmove", noteVisitorScroll, { passive: true });
    window.addEventListener("keydown", noteVisitorScroll, true);
    window.addEventListener("resize", holdStageHeight);
    fonts?.addEventListener("loadingdone", revealAfterFontLoad);
    return () => {
      window.removeEventListener("click", rememberPressPoint, true);
      window.removeEventListener("mousedown", guardSecondPress, true);
      window.removeEventListener("wheel", noteVisitorScroll);
      window.removeEventListener("touchmove", noteVisitorScroll);
      window.removeEventListener("keydown", noteVisitorScroll, true);
      window.removeEventListener("resize", holdStageHeight);
      fonts?.removeEventListener("loadingdone", revealAfterFontLoad);
    };
  }, [holdStageHeight, upperAnsweredRow]);

  // パンくずと h1 を、その下の中身と同じ間隔で積む（§5 の間隔）。
  const pageHead = <div className={styles.head}>{head}</div>;

  const handleStart = useCallback(() => dispatch({ type: "start" }), []);

  const handleAnswer = useCallback(
    (choiceId: string) => {
      if (currentId === undefined) return;
      dispatch({ type: "answer", questionId: currentId, choiceId });
    },
    [currentId],
  );

  const handleNext = useCallback(() => {
    if (currentId === undefined) return;
    dispatch({ type: "advance", questionId: currentId });
  }, [currentId]);

  const handleRetry = useCallback(() => dispatch({ type: "retry" }), []);

  if (phase === "intro") {
    const questionCount = quiz.meta.questionCount;
    const resultTypeCount = quiz.results.length;
    const estimatedTime = getEstimatedTime(quiz);
    const typeLabel = quiz.meta.type === "knowledge" ? "知識クイズ" : "診断";

    // 開始の画面は、事実の行 → 一文 →「はじめる」→ 説明 → 関連の入口の順に積む。「はじめる」を狭い画面でも
    // 最初の画面に入れるため、説明はその下に置く。説明はこのクイズ・診断が何をするかを言う文なので、ほかの遊びへの
    // 入口より先に置く。事実の行（種別・問の数・かかる時間と、診断ではタイプの数）は、間隔をあけて並べた補助情報にする。
    const introFacts = [
      typeLabel,
      `全${questionCount}問`,
      estimatedTime,
      quiz.meta.type === "personality" && resultTypeCount > 0
        ? `${resultTypeCount}タイプ`
        : "",
    ].filter((fact) => fact !== "");
    return (
      <Section>
        {pageHead}
        <div className={styles.intro}>
          <p ref={introFactsRef} className={styles.introFacts}>
            {introFacts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </p>
          <p>
            {quiz.meta.type === "knowledge"
              ? "準備ができたら始めましょう。"
              : "気軽に答えていくと、結果が出ます。"}
          </p>
          <Button variant="primary" onClick={handleStart} ref={startButtonRef}>
            はじめる
          </Button>
          <p>{quiz.meta.description}</p>
          {quiz.meta.relatedLinks && quiz.meta.relatedLinks.length > 0 && (
            <div className={styles.relatedLinks}>
              {quiz.meta.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.relatedLink}
                  data-text-box="inline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>
    );
  }

  if (phase === "playing") {
    const question = quiz.questions[currentIndex];
    return (
      <Section>
        {pageHead}
        <div ref={stageRef} className={styles.stage}>
          <ProgressBar
            current={currentIndex + 1}
            total={quiz.questions.length}
            label="設問の進捗"
          />
          <QuestionCard
            key={question.id}
            question={question}
            quizType={quiz.meta.type}
            answeredChoiceId={currentAnswer}
            onAnswer={handleAnswer}
            onNext={handleNext}
            headingRef={questionHeadingRef}
            choicesRef={choicesRef}
            pressedRowRef={pressedRowRef}
            correctRowRef={correctRowRef}
            nextButtonRef={nextButtonRef}
          />
        </div>
      </Section>
    );
  }

  // result phase
  const result =
    quiz.meta.slug === "science-thinking"
      ? determineScienceThinkingResult(quiz.questions, answers, quiz.results)
      : quiz.meta.slug === "character-personality"
        ? determineCharacterPersonalityResult(
            quiz.questions,
            answers,
            quiz.results,
          )
        : determineResult(quiz, answers);
  const score =
    quiz.meta.type === "knowledge"
      ? calculateKnowledgeScore(quiz.questions, answers)
      : undefined;

  // 真の残余同点の正直な開示。
  // word-sense-personality は構造的に約20%の同点が残る。主タイプ（result）は
  // determineResult の決定的勝者（シェア/再受験の再現性を保つ）で、同点を配列順で割って
  // 隠さず、同点を分け合う副タイプ（co-types）を同格で開示する。
  // 開示の文（ResultCard）が「言葉の感覚」を言うので、対象は word-sense-personality だけ。
  // 単独勝者（同点なし）のときは co-types が空配列になり、ResultCard は開示ブロックを出さない。
  const coTypes: QuizResult[] =
    quiz.meta.slug === "word-sense-personality"
      ? getTiedTypeIds(quiz, answers)
          .filter((typeId) => typeId !== result.id)
          .map((typeId) => quiz.results.find((r) => r.id === typeId))
          .filter((r): r is QuizResult => r !== undefined)
      : [];

  return (
    <ResultCard
      head={pageHead}
      result={result}
      heading={resultHeadings[result.id]}
      readingHeadings={readingHeadings}
      quizType={quiz.meta.type}
      quizTitle={quiz.meta.title}
      quizName={quiz.meta.shortTitle ?? quiz.meta.title}
      quizSlug={quiz.meta.slug}
      score={score}
      totalQuestions={
        quiz.meta.type === "knowledge" ? quiz.questions.length : undefined
      }
      onRetry={handleRetry}
      detailedContent={result.detailedContent}
      resultPageLabels={quiz.meta.resultPageLabels}
      referrerTypeId={referrerTypeId}
      extra={
        hasResultExtra(quiz.meta.slug) ? (
          <ResultExtraLoader
            slug={quiz.meta.slug}
            resultId={result.id}
            referrerTypeId={referrerTypeId}
            answers={answers}
          />
        ) : undefined
      }
      nextItems={recommendedContents}
      allResults={quiz.results}
      coTypes={coTypes}
      resultBoxRef={resultBoxRef}
      appear
    />
  );
}
