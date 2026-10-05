import { Fragment, useId, type Ref } from "react";
import Link from "next/link";
import DataTable, { type DataTableRow } from "@/components/DataTable";
import PhrasedText from "@/components/PhrasedText";
import ResultBox from "@/components/ResultBox";
import QuantityBars, { type QuantityBar } from "@/components/QuantityBars";
import type {
  IrodoriGameState,
  IrodoriGameStats,
} from "@/play/games/irodori/_lib/types";
import { hslToHex } from "@/play/games/irodori/_lib/color-utils";
import {
  calculateTotalScore,
  getRank,
  getRankLabel,
  scoreBucketIndex,
} from "@/play/games/irodori/_lib/engine";
import styles from "./FinalResult.module.css";

/** 合計点の分布の区分の名前。統計の scoreDistribution の並び（scoreBucketIndex の番号）と同じ順。 */
const SCORE_BUCKET_NAMES = [
  "0〜9点",
  "10〜19点",
  "20〜29点",
  "30〜39点",
  "40〜49点",
  "50〜59点",
  "60〜69点",
  "70〜79点",
  "80〜89点",
  "90〜100点",
];

interface Props {
  gameState: IrodoriGameState;
  stats: IrodoriGameStats;
  /** 最後の問を決めた操作に応えて現れたか。ページを開いたときに初めからある結果には渡さない */
  appear: boolean;
  boxRef: Ref<HTMLElement>;
}

/**
 * 5問を終えた結果（DESIGN.md §8「ゲームの結果」）。今日の合計点とランク、問ごとの点数と色、それで更新された
 * これまでの成績を、1つの結果のボックスに置く。
 */
export default function FinalResult({
  gameState,
  stats,
  appear,
  boxRef,
}: Props) {
  const roundsHeadingId = useId();
  const statsHeadingId = useId();
  const distributionHeadingId = useId();
  const scores = gameState.rounds.map((round) => round.score ?? 0);
  const totalScore = calculateTotalScore(scores);
  const rank = getRank(totalScore);
  const currentBucket = scoreBucketIndex(totalScore);
  const namedTargets = gameState.rounds.flatMap((round, index) =>
    round.target.name ? [{ number: index + 1, target: round.target }] : [],
  );
  const rounds: DataTableRow[] = gameState.rounds.map((round, index) => {
    const number = index + 1;
    return {
      key: String(number),
      header: [String(number)],
      cells: [
        <div
          key="target"
          className={styles.swatch}
          style={{ backgroundColor: round.target.hex }}
          role="img"
          aria-label={`問${number}のお題の色`}
        />,
        round.answer ? (
          <div
            key="answer"
            className={styles.swatch}
            style={{
              backgroundColor: hslToHex(
                round.answer.h,
                round.answer.s,
                round.answer.l,
              ),
            }}
            role="img"
            aria-label={`問${number}の回答の色`}
          />
        ) : (
          <PhrasedText
            key="answer"
            as="span"
            className={styles.noAnswer}
            phrases={["記録なし"]}
          />
        ),
        [`${round.score ?? 0}点`],
      ],
    };
  });
  const records: DataTableRow[] = [
    {
      key: "played",
      header: ["遊んだ", "回数"],
      cells: [[`${stats.gamesPlayed}回`]],
    },
    {
      key: "average",
      header: ["平均点"],
      cells: [[`${Math.round(stats.averageScore)}点`]],
    },
    { key: "best", header: ["最高点"], cells: [[`${stats.bestScore}点`]] },
    {
      key: "streak",
      header: ["続けて", "遊んだ", "日数"],
      cells: [[`${stats.currentStreak}日`]],
    },
  ];
  const distribution: QuantityBar[] = SCORE_BUCKET_NAMES.map((name, index) => {
    const count = stats.scoreDistribution[index] ?? 0;
    return {
      name,
      value: count,
      valueText: String(count),
      current: index === currentBucket,
    };
  });

  return (
    <ResultBox
      ref={boxRef}
      tabIndex={-1}
      caption="今日の合計点"
      appear={appear}
    >
      <div className={styles.result}>
        <div>
          <p className={styles.total}>{totalScore}点</p>
          <p>
            {rank}ランク、{getRankLabel(rank)}です。
          </p>
        </div>

        <section className={styles.part} aria-labelledby={roundsHeadingId}>
          <PhrasedText
            as="h2"
            id={roundsHeadingId}
            className={styles.partHeading}
            phrases={["問ごとの", "点数"]}
          />
          <div className={styles.rounds}>
            <DataTable
              labelledBy={roundsHeadingId}
              columns={[["問"], ["お題"], ["回答"], ["点数"]]}
              rows={rounds}
            />
          </div>
          {namedTargets.length > 0 && (
            <p className={styles.names}>
              伝統色のお題は、
              {namedTargets.map(({ number, target }, index) => (
                <Fragment key={number}>
                  {index > 0 && "、"}問{number}の「
                  {target.slug ? (
                    <Link
                      href={`/dictionary/colors/${target.slug}`}
                      className={styles.colorName}
                    >
                      {target.name}
                    </Link>
                  ) : (
                    <span className={styles.colorName}>{target.name}</span>
                  )}
                  」
                </Fragment>
              ))}
              でした。
            </p>
          )}
        </section>

        <section className={styles.part} aria-labelledby={statsHeadingId}>
          <PhrasedText
            as="h2"
            id={statsHeadingId}
            className={styles.partHeading}
            phrases={["これまでの", "成績"]}
          />
          <div className={styles.records}>
            <DataTable labelledBy={statsHeadingId} rows={records} />
          </div>
        </section>

        <section
          className={styles.part}
          aria-labelledby={distributionHeadingId}
        >
          <PhrasedText
            as="h2"
            id={distributionHeadingId}
            className={styles.partHeading}
            phrases={["合計点ごとの", "回数"]}
          />
          <QuantityBars
            labelledBy={distributionHeadingId}
            items={distribution}
          />
        </section>
      </div>
    </ResultBox>
  );
}
