"use client";

import { useId, useMemo } from "react";
import type { QuizAnswer } from "@/play/quiz/types";
import {
  getAxisScores,
  getMaxAxisScores,
  AXIS_IDS,
  type AxisId,
} from "@/play/quiz/data/science-thinking";
import scienceThinkingQuiz from "@/play/quiz/data/science-thinking";
import QuantityBars, { type QuantityBar } from "@/components/QuantityBars";
import RadarChart, { type RadarChartAxis } from "./RadarChart";
import InviteFriendButton from "./InviteFriendButton";
import { ReadingHeading } from "./ResultReading";
import styles from "./ScienceThinkingResultExtra.module.css";

/** 軸の名前 */
const AXIS_LABELS: Record<AxisId, string> = {
  theory: "理論",
  empirical: "実験",
  quantitative: "数値化",
  observational: "観察",
  creative: "創造",
};

const INVITE_TEXT = "理系思考タイプ診断であなたの理系脳の形を調べよう!";

interface ScienceThinkingResultExtraProps {
  resultId: string;
  referrerTypeId?: string;
  answers?: QuizAnswer[];
}

/** ResultExtraLoader が読み込んで、解き終えた画面の「このタイプについて」の最後に描く。 */
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
 * 理系思考タイプ診断の、来訪者の答えから出した5つの軸のスコア。レーダーとスコアの帯で見せ、どちらも軸ごとの
 * 満点に対する割合を言う。満点は軸によって違うので、点数でなく割合で並べる（DESIGN.md §5 量の帯）。
 * そのあとに友達を招待するボタンを置く。答えが無いとき（結果のリンクから開いたとき）は招待だけを出す。
 * 読みものの最後の小見出しとして、置かれた読みものに続けて組む。
 */
function ScienceThinkingResultExtra({
  resultId,
  answers,
}: ScienceThinkingResultExtraProps) {
  const quiz = scienceThinkingQuiz;
  const headingId = useId();
  const hasResult = quiz.results.some((r) => r.id === resultId);

  const axes = useMemo<RadarChartAxis[]>(() => {
    if (!answers || answers.length === 0) return [];
    const scores = getAxisScores(quiz.questions, answers);
    const maxScores = getMaxAxisScores(quiz.questions);
    return AXIS_IDS.map((axisId) => ({
      label: AXIS_LABELS[axisId],
      percent:
        maxScores[axisId] > 0
          ? Math.round((scores[axisId] / maxScores[axisId]) * 100)
          : 0,
    }));
  }, [quiz.questions, answers]);

  if (!hasResult) return null;

  const invite = (
    <InviteFriendButton
      quizSlug={quiz.meta.slug}
      resultTypeId={resultId}
      inviteText={INVITE_TEXT}
    />
  );

  if (axes.length === 0) return invite;

  const bars: QuantityBar[] = axes.map((axis) => ({
    name: axis.label,
    value: axis.percent,
    valueText: `${axis.percent}%`,
  }));

  return (
    <>
      <ReadingHeading
        phrases={["あなたの", "思考プロフィール"]}
        id={headingId}
      />
      <div className={styles.chart}>
        <RadarChart
          axes={axes}
          label="理論・実験・数値化・観察・創造の5つの軸のレーダー"
        />
      </div>
      <div className={styles.bars}>
        <QuantityBars labelledBy={headingId} items={bars} max={100} />
      </div>
      {invite}
    </>
  );
}
