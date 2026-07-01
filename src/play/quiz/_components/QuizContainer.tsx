"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  trackContentStart,
  trackContentEnd,
  type AbEventContext,
} from "@/lib/analytics";
import Link from "next/link";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
// EXPERIMENT: quiz_result_visual_v1 — import を撤去すれば arm 関連ロジックも消える。
import { QUIZ_RESULT_VISUAL_V1, useAbVariant, getAbArm } from "@/lib/ab";
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
    // tabIndex={-1} の region へプログラム的にフォーカスを移す
    region.focus();
  }, [phase]);

  const contentType = quiz.meta.type === "personality" ? "diagnosis" : "quiz";
  const contentId = "quiz-" + quiz.meta.slug;

  // EXPERIMENT: quiz_result_visual_v1
  //
  // 本ファイルが arm の唯一の真実の源（single source of truth）。
  // ResultCard も OtherTypesNavAb も `useAbVariant` を呼ばず、ここで解決した
  // arm を props 経由で受け取る（関心の分離・原則#3）。
  //
  // - SSR / 初期 client render では null（hydration safe）
  // - その後、localStorage から persisted arm を読むかランダム割当で確定する
  //
  // arm は (1) ResultCard 経由のディスパッチ（retro vs current コンポーネント
  // 選択 / OtherTypesNavAb への伝播）と (2) GA `level_start` / `level_end` への
  // ab_variant / experiment_id 付与の両方で使う。
  //
  // 実験終了時は本ブロック・関連 import・ResultCard への resultVisualArm prop
  // 付与・trackContent* の ab 引数を削除すれば原状復帰できる
  // （grep -rn 'EXPERIMENT: quiz_result_visual_v1' src/ で全撤去ポイント網羅）。
  const resultArm = useAbVariant(QUIZ_RESULT_VISUAL_V1.id);

  // EXPERIMENT: quiz_result_visual_v1 — 実験対象セッションの限定（独立変数の純度確保）。
  //
  // arm を GA に乗せるのは「retro/current の視覚差分が実際に発生する」セッションだけ。
  // 本実験で介入を受けるのは personality 系クイズのインライン結果のみ
  // （ResultCard の `pickVariantComponent` 対応表に並んだ 8 variant ＋ 標準 variant の
  //  OtherTypesNav）— これらはすべて personality タイプに属する。
  //
  // knowledge 系クイズ（yoji-level / kanji-level / kotowaza-level 等）は専用 retro
  // *Content を持たず視覚差分が 1px も発生しない。ここで `ab` を載せると、介入ゼロの
  // セッションが両 arm を均等に薄め、`docs/sql/ab-value-metrics.sql` の
  // `WHERE ab_variant IS NOT NULL` を通過して KPI を希釈する。よって knowledge では
  // `ab === undefined` を維持し analytics.ts 側でキー自体を payload から省く。
  //
  // arm 自体の localStorage 永続化は knowledge 来訪者にも発生してよい（個人識別なし・
  // 実害なし）。これは「コミットされたが GA には乗らない」状態で問題ない。
  const isExperimentSubject = quiz.meta.type === "personality";

  // EXPERIMENT: quiz_result_visual_v1
  // GA 送信用の arm は、useAbVariant の useEffect→setState→re-render を待たず
  // 命令的に getAbArm() で最新値を取る。useAbVariant のヘッダコメントが推奨する
  // event handler 経路（"For non-React call sites (event handlers, imperative
  // code), call getAbArm(experimentId) from ./assign directly instead."）。
  // 視覚表示は引き続き useAbVariant 経由（hydration safe）で、getAbArm は同じ
  // localStorage/in-memory ソースを参照するので決定論的に同じ arm を返し、
  // 表示と記録は乖離しない。cycle-272 T1 で BQ 実測 23% の null-arm 漏れを
  // 確認したのを受け、検出力（B-526 結論到達期間）を削らないよう是正。
  const resolveAb = useCallback((): AbEventContext | undefined => {
    if (!isExperimentSubject) return undefined;
    const arm = getAbArm(QUIZ_RESULT_VISUAL_V1.id);
    if (arm === null) return undefined;
    return { experimentId: QUIZ_RESULT_VISUAL_V1.id, variant: arm };
  }, [isExperimentSubject]);

  const handleStart = useCallback(() => {
    setPhase("playing");
    setCurrentIndex(0);
    setAnswers([]);
    trackContentStart(contentId, contentType, resolveAb());
  }, [contentId, contentType, resolveAb]);

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
          // EXPERIMENT: quiz_result_visual_v1 — 主要 KPI 発火点。
          // arm は resolveAb() で命令的に取る（上の resolveAb 解説参照）。
          trackContentEnd(contentId, contentType, true, resolveAb());
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }
    },
    [answers, currentIndex, quiz, contentId, contentType, resolveAb],
  );

  const handleNext = useCallback(() => {
    // knowledge type: advance to next question or show result
    if (currentIndex + 1 >= quiz.questions.length) {
      setPhase("result");
      // EXPERIMENT: quiz_result_visual_v1 — 主要 KPI 発火点。
      // arm は resolveAb() で命令的に取る（上の resolveAb 解説参照）。
      trackContentEnd(contentId, contentType, true, resolveAb());
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, quiz.questions.length, contentId, contentType, resolveAb]);

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
    <div
      className={styles.resultPhase}
      // A：完走→結果のリビール対象領域。プログラム的フォーカスの受け皿
      // （tabIndex={-1}）＋スクリーンリーダ向けに結果領域であることを伝える。
      ref={resultRegionRef}
      tabIndex={-1}
      role="region"
      aria-label="診断結果"
    >
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
          // EXPERIMENT: quiz_result_visual_v1
          // A/B 実験 arm を ResultCard に伝播し、variant 別 *Content の
          // retro/current 出し分けと OtherTypesNavAb の出し分けに使う。
          //
          // 実験対象外（knowledge クイズ）には `null` を渡して常に current 描画と
          // する。これは GA 非付与（上述 `ab` ゲート）と対応する視覚側の手当て：
          // knowledge ユーザに retro 装飾を見せないことで「介入を受けない実験対象外
          // セッション」の純度を視覚・記録の両面で揃える。
          resultVisualArm={isExperimentSubject ? resultArm : null}
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
