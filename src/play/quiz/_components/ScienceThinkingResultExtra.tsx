"use client";

import type { QuizAnswer } from "@/play/quiz/types";
import {
  getAxisScores,
  getMaxAxisScores,
  AXIS_IDS,
  type AxisId,
} from "@/play/quiz/data/science-thinking";
import scienceThinkingQuiz from "@/play/quiz/data/science-thinking";
import RadarChart from "./RadarChart";
import InviteFriendButton from "./InviteFriendButton";
import styles from "./ScienceThinkingResultExtra.module.css";

/** Human-readable Japanese labels for each axis */
const AXIS_LABELS: Record<AxisId, string> = {
  theory: "理論",
  empirical: "実験",
  quantitative: "数値化",
  observational: "観察",
  creative: "創造",
};

interface ScienceThinkingResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
  answers?: QuizAnswer[];
}

/**
 * Returns a render function for extra content below the science thinking
 * quiz result card. Used by ResultExtraLoader's dynamic import pattern.
 */
export function renderScienceThinkingExtra(
  referrerTypeId?: string,
  answers?: QuizAnswer[],
): (resultId: string) => React.ReactNode {
  function ResultExtraRenderer(resultId: string): React.ReactNode {
    return (
      <ScienceThinkingResultExtra
        resultId={resultId}
        referrerTypeId={referrerTypeId}
        answers={answers}
      />
    );
  }
  return ResultExtraRenderer;
}

/**
 * Extra result content for the Science Thinking Type Quiz.
 * Displays a radar chart of 5-axis scores and score bars for each axis,
 * followed by the friend invite button.
 */
function ScienceThinkingResultExtra({
  resultId,
  answers,
}: ScienceThinkingResultExtraProps) {
  const quiz = scienceThinkingQuiz;
  const myResult = quiz.results.find((r) => r.id === resultId);

  if (!myResult) return null;

  // If no answers available, only show the invite button
  if (!answers || answers.length === 0) {
    return (
      <InviteFriendButton
        quizSlug={quiz.meta.slug}
        resultTypeId={resultId}
        inviteText="理系思考タイプ診断であなたの理系脳の形を調べよう!"
      />
    );
  }

  const scores = getAxisScores(quiz.questions, answers);
  const maxScores = getMaxAxisScores(quiz.questions);
  const themeColor = myResult.color ?? quiz.meta.accentColor;

  // Build axes data for RadarChart
  const chartAxes = AXIS_IDS.map((axisId) => ({
    label: AXIS_LABELS[axisId],
    value: scores[axisId],
    max: maxScores[axisId],
  }));

  return (
    <div className={styles.wrapper}>
      {/* Radar chart */}
      <div className={styles.chartSection}>
        <p className={styles.chartTitle}>あなたの思考プロフィール</p>
        <RadarChart axes={chartAxes} color={themeColor} />
      </div>

      {/* Score bars */}
      <div className={styles.scoreSection}>
        {AXIS_IDS.map((axisId) => {
          const score = scores[axisId];
          const max = maxScores[axisId];
          const pct = max > 0 ? Math.round((score / max) * 100) : 0;
          return (
            <div key={axisId} className={styles.scoreBar}>
              <div className={styles.scoreLabel}>
                <span className={styles.scoreName}>{AXIS_LABELS[axisId]}</span>
                <span className={styles.scoreValue}>
                  {score} / {max} ({pct}%)
                </span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: themeColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite friend button */}
      <InviteFriendButton
        quizSlug={quiz.meta.slug}
        resultTypeId={resultId}
        inviteText="理系思考タイプ診断であなたの理系脳の形を調べよう!"
      />
    </div>
  );
}
