"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { trackContentStart, trackContentEnd } from "@/lib/analytics";
import Link from "next/link";
import { NefudaGroup } from "@/components/Nefuda";
import type { QuizDefinition, QuizAnswer, QuizPhase } from "@/play/quiz/types";
import { determineResult, calculateKnowledgeScore } from "@/play/quiz/scoring";
import { determineScienceThinkingResult } from "@/play/quiz/data/science-thinking";
import { determineCharacterPersonalityResult } from "@/play/quiz/data/character-personality";
import { getEstimatedTime } from "./introBadges";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import ResultNextContent from "./ResultNextContent";
import type { ResultNextContentItem } from "./ResultNextContent";
import ResultExtraLoader from "./ResultExtraLoader";
import { contentIdForQuiz } from "@/play/quiz/contentId";
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

  // 結果リビール（A：完走→結果で注意を誘導する / a11y）。
  // result phase の外側 wrapper への参照。phase が "result" になった時に
  // ここへスクロール＋フォーカスを移し、視界を「遊ぶ前の h1・説明文」から
  // 「自分の結果」へ移す。ResultCard 自体は自動スクロール副作用で汚さない
  // （ResultCard 単体テスト・他文脈の安定のため／タスク指示 A）。
  const resultRegionRef = useRef<HTMLDivElement>(null);

  // A：result phase 到達時に結果領域へスクロールし、フォーカスを移す。
  // - phase 依存の useEffect。result phase は完走時のみ到達するため直リンク誤発火はしない。
  // - prefers-reduced-motion: reduce では smooth を使わず即時スクロールする。
  // - フォーカス移動により、スクリーンリーダ利用者にも結果到達（region）が伝わる。
  // - jsdom 等 scrollIntoView / matchMedia 未定義環境ではガードして no-op にする。
  useEffect(() => {
    if (phase !== "result") return;
    const region = resultRegionRef.current;
    if (!region) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof region.scrollIntoView === "function") {
      region.scrollIntoView({
        // reduce 指定時は即時（"auto"）、それ以外は穏当な smooth
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
    // tabIndex={-1} の region へプログラム的にフォーカスを移す。
    // N1: preventScroll で focus() 既定のスクロールを抑止し、見え方を上の
    // scrollIntoView（smooth）に委ねる。preventScroll なしだと focus() の即時
    // スクロールが smooth を打ち消してジャンプに化ける。
    region.focus({ preventScroll: true });
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
    // 所要情報は値札（Nefuda）——種別・所要時間などの「情報のあるラベル」（DESIGN.md §4）。
    const introBadgeLabels = [
      typeLabel,
      `全${questionCount}問`,
      estimatedTime,
      quiz.meta.type === "personality" && resultTypeCount > 0
        ? `${resultTypeCount}タイプ`
        : "",
    ];
    return (
      <div className={styles.stage}>
        <div className={styles.intro}>
          <NefudaGroup labels={introBadgeLabels} />
          <p className={styles.introLead}>
            {quiz.meta.type === "knowledge"
              ? "準備ができたら始めましょう。"
              : "気軽に答えていくと、結果が出ます。"}
          </p>
          <button
            type="button"
            className={styles.startButton}
            onClick={handleStart}
          >
            はじめる
          </button>
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
      </div>
    );
  }

  if (phase === "playing") {
    const question = quiz.questions[currentIndex];
    return (
      <div className={styles.stage}>
        <ProgressBar current={currentIndex + 1} total={quiz.questions.length} />
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

  // N2: result region の読み上げラベルは quizType で出し分ける。この wrapper は
  // 全 quizType 共通のため固定文言だと knowledge クイズでも「診断結果」と読まれて
  // しまう（知識クイズは「診断」でなく「クイズ」）。
  const resultRegionLabel =
    quiz.meta.type === "personality" ? "診断結果" : "クイズ結果";

  return (
    <div
      className={styles.resultPhase}
      // A：完走→結果のリビール対象領域。プログラム的フォーカスの受け皿
      // （tabIndex={-1}）＋スクリーンリーダ向けに結果領域であることを伝える。
      ref={resultRegionRef}
      tabIndex={-1}
      role="region"
      aria-label={resultRegionLabel}
    >
      {/* 結果本体（主役）。器は静かに、成果物（ResultCard内の Tsutsumi）だけが主役（§4）。
       * detailedContent の variant 別サブコンポーネント（legacy 結果コンテンツ）は
       * 引き続き quiz.meta.accentColor を受け取るが、ResultCard 自身の chrome
       * （見出し・標準セクション・ボタン）は新トークン --accent に統一されている。 */}
      <div className={styles.stage}>
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
      </div>
      {/* 回遊導線・追加コンテンツは本体の外に二次配置（入れ子回避） */}
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
