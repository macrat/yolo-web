"use client";

import { useState, useCallback } from "react";
import { trackContentStart, trackContentEnd } from "@/lib/analytics";
import Link from "next/link";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import type { QuizDefinition, QuizAnswer, QuizPhase } from "@/play/quiz/types";
import { determineResult, calculateKnowledgeScore } from "@/play/quiz/scoring";
import { determineScienceThinkingResult } from "@/play/quiz/data/science-thinking";
import { getEstimatedTime } from "./introBadges";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import ResultNextContent from "./ResultNextContent";
import type { ResultNextContentItem } from "./ResultNextContent";
import ResultExtraLoader from "./ResultExtraLoader";
import styles from "./QuizContainer.module.css";

type QuizContainerProps = {
  quiz: QuizDefinition;
  /** Optional referrer type ID from URL search params (for compatibility) */
  referrerTypeId?: string;
  /**
   * 結果画面直下の「次のおすすめ」に表示するコンテンツ。
   * Server Component（page.tsx）で事前計算したデータをprops経由で受け取る。
   * registryへのimportを避けてクライアントバンドルを削減するため、
   * PlayContentMeta ではなく ResultNextContentItem の配列を受け取る。
   */
  recommendedContents?: ResultNextContentItem[];
};

/**
 * Client-side quiz container that manages the entire quiz lifecycle:
 * intro -> playing -> result.
 */
export default function QuizContainer({
  quiz,
  referrerTypeId,
  recommendedContents,
}: QuizContainerProps) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const contentType = quiz.meta.type === "personality" ? "diagnosis" : "quiz";
  const contentId = "quiz-" + quiz.meta.slug;

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
    return (
      <Panel className={styles.panel}>
        <div className={styles.intro}>
          {/* 所要情報を一行のタグ列で淡く示す（賑やかさではなく整然さ） */}
          <div className={styles.introBadges}>
            <span className={styles.introBadge}>{typeLabel}</span>
            <span className={styles.introBadge}>全{questionCount}問</span>
            <span className={styles.introBadge}>{estimatedTime}</span>
            {quiz.meta.type === "personality" && resultTypeCount > 0 && (
              <span className={styles.introBadge}>{resultTypeCount}タイプ</span>
            )}
          </div>
          <p className={styles.introLead}>
            {quiz.meta.type === "knowledge"
              ? "準備ができたら始めましょう。"
              : "気軽に答えていくと、結果が出ます。"}
          </p>
          <Button
            variant="primary"
            className={styles.startButton}
            onClick={handleStart}
          >
            はじめる
          </Button>
          {quiz.meta.relatedLinks && quiz.meta.relatedLinks.length > 0 && (
            <div className={styles.relatedLinks}>
              {quiz.meta.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.relatedLink}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Panel>
    );
  }

  if (phase === "playing") {
    const question = quiz.questions[currentIndex];
    return (
      <Panel className={styles.panel}>
        <ProgressBar current={currentIndex + 1} total={quiz.questions.length} />
        <QuestionCard
          key={question.id}
          question={question}
          quizType={quiz.meta.type}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </Panel>
    );
  }

  // result phase
  const result =
    quiz.meta.slug === "science-thinking"
      ? determineScienceThinkingResult(quiz.questions, answers, quiz.results)
      : determineResult(quiz, answers);
  const score =
    quiz.meta.type === "knowledge"
      ? calculateKnowledgeScore(quiz.questions, answers)
      : undefined;

  return (
    <div className={styles.resultPhase}>
      {/* 結果本体（主役）を Panel に収める（DESIGN.md §1）。
       * detailedContent の variant 別サブコンポーネント（legacy 結果コンテンツ）は
       * 引き続き quiz.meta.accentColor を受け取るが、ResultCard 自身の chrome
       * （見出し・標準セクション・ボタン）は新トークン --accent に統一されている。 */}
      <Panel className={styles.panel}>
        <ResultCard
          result={result}
          quizType={quiz.meta.type}
          quizTitle={quiz.meta.title}
          quizSlug={quiz.meta.slug}
          score={score}
          totalQuestions={
            quiz.meta.type === "knowledge" ? quiz.questions.length : undefined
          }
          onRetry={handleRetry}
          detailedContent={result.detailedContent}
          resultPageLabels={quiz.meta.resultPageLabels}
          accentColor={quiz.meta.accentColor}
          referrerTypeId={referrerTypeId}
          allResults={quiz.results}
        />
      </Panel>
      {/* 回遊導線・追加コンテンツは本体パネルの外に二次配置（パネル入れ子回避） */}
      {recommendedContents && recommendedContents.length > 0 && (
        <ResultNextContent contents={recommendedContents} />
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
