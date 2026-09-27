"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { trackContentStart, trackContentEnd } from "@/lib/analytics";
import Link from "next/link";
import type {
  QuizDefinition,
  QuizAnswer,
  QuizPhase,
  QuizResult,
} from "@/play/quiz/types";
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
import type { ItemListItem } from "@/components/ItemList";
import type { ResultHeading } from "@/components/ResultBox";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import ResultNextContent from "./ResultNextContent";
import ResultExtraLoader from "./ResultExtraLoader";
import { contentIdForQuiz } from "@/play/quiz/contentId";
import styles from "./QuizContainer.module.css";

type QuizContainerProps = {
  quiz: QuizDefinition;
  /** Optional referrer type ID from URL search params (for compatibility) */
  referrerTypeId?: string;
  /**
   * 結果の下に並べる次の遊びの行。遊びの登録をクライアントに持ち込まないよう、サーバーで行にしてから受け取る。
   */
  recommendedContents?: ItemListItem[];
  /** 結果の見出し（タイプ名）の文節の区切りと書体の属性。結果の id ごとに、サーバーで作ってから受け取る。 */
  resultHeadings: Readonly<Record<string, ResultHeading>>;
  /** 詳しい読みものの小見出しの文節の区切り。小見出しの文ごとに、サーバーで作ってから受け取る。 */
  readingHeadings: Readonly<Record<string, readonly string[]>>;
};

/**
 * Client-side quiz container that manages the entire quiz lifecycle:
 * intro -> playing -> result.
 */
export default function QuizContainer({
  quiz,
  referrerTypeId,
  recommendedContents,
  resultHeadings,
  readingHeadings,
}: QuizContainerProps) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  // 結果のボックス。解き終えたら、画面をボックスの上端まで即時に送り（DESIGN.md §11）、フォーカスを移して
  // 読み上げにも結果に着いたことを伝える。結果の画面に進めるのは最後の設問に答えたときだけなので、ページを
  // 開いただけでは送らない。
  const resultBoxRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (phase !== "result") return;
    const box = resultBoxRef.current;
    if (!box) return;
    box.scrollIntoView?.({ behavior: "instant", block: "start" });
    box.focus({ preventScroll: true });
  }, [phase]);

  const contentType = quiz.meta.type === "personality" ? "diagnosis" : "quiz";
  const contentId = contentIdForQuiz(quiz.meta.slug);

  const handleStart = useCallback(() => {
    setPhase("playing");
    setCurrentIndex(0);
    setAnswers([]);
    trackContentStart(contentId, contentType);
  }, [contentId, contentType]);

  const handleAnswer = useCallback(
    (choiceId: string) => {
      const question = quiz.questions[currentIndex];
      const newAnswer: QuizAnswer = {
        questionId: question.id,
        choiceId,
      };
      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);

      // personality type: advance immediately
      if (quiz.meta.type === "personality") {
        if (currentIndex + 1 >= quiz.questions.length) {
          setPhase("result");
          trackContentEnd(contentId, contentType, true);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }
    },
    [answers, currentIndex, quiz, contentId, contentType],
  );

  const handleNext = useCallback(() => {
    // knowledge type: advance to next question or show result
    if (currentIndex + 1 >= quiz.questions.length) {
      setPhase("result");
      trackContentEnd(contentId, contentType, true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, quiz.questions.length, contentId, contentType]);

  const handleRetry = useCallback(() => {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers([]);
  }, []);

  if (phase === "intro") {
    const questionCount = quiz.meta.questionCount;
    const resultTypeCount = quiz.results.length;
    const estimatedTime = getEstimatedTime(questionCount);
    const typeLabel = quiz.meta.type === "knowledge" ? "知識クイズ" : "診断";

    // h1 と説明はページ章立て（QuizPlayPageLayout の header）が担うため、
    // ここでは「これから始める道具」としての所要情報と開始操作だけを静かに置く。
    // 所要情報（種別・問題数・所要時間・タイプ数）は、間隔をあけて並べた補助情報にする。
    const introFacts = [
      typeLabel,
      `全${questionCount}問`,
      estimatedTime,
      quiz.meta.type === "personality" && resultTypeCount > 0
        ? `${resultTypeCount}タイプ`
        : "",
    ].filter((fact) => fact !== "");
    return (
      <div className={styles.stage}>
        <div className={styles.intro}>
          <p className={styles.introFacts}>
            {introFacts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </p>
          <p className={styles.introLead}>
            {quiz.meta.type === "knowledge"
              ? "準備ができたら始めましょう。"
              : "気軽に答えていくと、結果が出ます。"}
          </p>
          <Button variant="primary" onClick={handleStart}>
            はじめる
          </Button>
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
      </div>
    );
  }

  if (phase === "playing") {
    const question = quiz.questions[currentIndex];
    return (
      <div className={styles.stage}>
        <ProgressBar
          current={currentIndex + 1}
          total={quiz.questions.length}
          label="設問の進捗"
        />
        <QuestionCard
          key={question.id}
          question={question}
          quizType={quiz.meta.type}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
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
    <div className={styles.resultPhase}>
      <ResultCard
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
        allResults={quiz.results}
        coTypes={coTypes}
        resultBoxRef={resultBoxRef}
        appear
      />
      {recommendedContents && recommendedContents.length > 0 && (
        <ResultNextContent items={recommendedContents} />
      )}
      <ResultExtraLoader
        slug={quiz.meta.slug}
        resultId={result.id}
        referrerTypeId={referrerTypeId}
        answers={answers}
      />
    </div>
  );
}
