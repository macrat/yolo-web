import { Fragment, useId, type Ref } from "react";
import Link from "next/link";
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
          <h2 id={roundsHeadingId} className={styles.partHeading}>
            問ごとの点数
          </h2>
          <table className={styles.rounds}>
            <thead>
              <tr>
                <th scope="col">問</th>
                <th scope="col">お題</th>
                <th scope="col">回答</th>
                <th scope="col" className={styles.score}>
                  点数
                </th>
              </tr>
            </thead>
            <tbody>
              {gameState.rounds.map((round, index) => {
                const number = index + 1;
                return (
                  <tr key={number}>
                    <th scope="row">{number}</th>
                    <td>
                      <div
                        className={styles.swatch}
                        style={{ backgroundColor: round.target.hex }}
                        role="img"
                        aria-label={`問${number}のお題の色`}
                      />
                    </td>
                    <td>
                      {round.answer ? (
                        <div
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
                        <span className={styles.noAnswer}>記録なし</span>
                      )}
                    </td>
                    <td className={styles.score}>{round.score ?? 0}点</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {namedTargets.length > 0 && (
            <p className={styles.names}>
              伝統色のお題は、
              {namedTargets.map(({ number, target }, index) => (
                <Fragment key={number}>
                  {index > 0 && "、"}問{number}の「
                  {target.slug ? (
                    <Link href={`/dictionary/colors/${target.slug}`}>
                      {target.name}
                    </Link>
                  ) : (
                    target.name
                  )}
                  」
                </Fragment>
              ))}
              でした。
            </p>
          )}
        </section>

        <section className={styles.part} aria-labelledby={statsHeadingId}>
          <h2 id={statsHeadingId} className={styles.partHeading}>
            これまでの成績
          </h2>
          <table>
            <tbody>
              <tr>
                <th scope="row">遊んだ回数</th>
                <td className={styles.score}>{stats.gamesPlayed}回</td>
              </tr>
              <tr>
                <th scope="row">平均点</th>
                <td className={styles.score}>
                  {Math.round(stats.averageScore)}点
                </td>
              </tr>
              <tr>
                <th scope="row">最高点</th>
                <td className={styles.score}>{stats.bestScore}点</td>
              </tr>
              <tr>
                <th scope="row">続けて遊んだ日数</th>
                <td className={styles.score}>{stats.currentStreak}日</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section
          className={styles.part}
          aria-labelledby={distributionHeadingId}
        >
          <h2 id={distributionHeadingId} className={styles.partHeading}>
            合計点ごとの回数
          </h2>
          <QuantityBars
            labelledBy={distributionHeadingId}
            items={distribution}
          />
        </section>
      </div>
    </ResultBox>
  );
}
