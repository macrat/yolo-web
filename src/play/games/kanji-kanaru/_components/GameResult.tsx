"use client";

import { useId, type Ref } from "react";
import type {
  Difficulty,
  GameState,
  GameStats,
} from "@/play/games/kanji-kanaru/_lib/types";
import {
  DIFFICULTY_LABELS,
  MAX_GUESSES,
} from "@/play/games/kanji-kanaru/_lib/types";
import { generateShareText } from "@/play/games/kanji-kanaru/_lib/share";
import ResultBox from "@/components/ResultBox";
import PhrasedText from "@/components/PhrasedText";
import QuantityBars from "@/components/QuantityBars";
import ShareButtons from "@/components/ShareButtons";
import type { ItemListItem } from "@/components/ItemList";
import NextPuzzleTime from "@/play/games/shared/_components/NextPuzzleTime";
import NextGameBanner from "@/play/games/shared/_components/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/CrossCategoryBanner";
import ResultTable, { type ResultTableRow } from "./ResultTable";
import styles from "./styles/KanjiKanaru.module.css";

interface GameResultProps {
  gameState: GameState;
  difficulty: Difficulty;
  stats: GameStats;
  /** 最後の推測に応えて現れたか。そのときだけ結果のボックスが登場の動きを持つ。 */
  appear: boolean;
  /** 結果のボックス。最後の推測のあと、画面に入れてフォーカスを移す。 */
  boxRef?: Ref<HTMLElement>;
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: ItemListItem[];
}

/**
 * 解き終えた回の結果。盤のすぐ下に、その回の結果（答えの漢字と何回目で当てたか）と、それで更新された
 * これまでの成績を結果のボックスに入れ、その下に結果の共有、次の問題の時刻、次に遊ぶものの案内を続ける
 * （DESIGN.md §8）。
 */
export default function GameResult({
  gameState,
  difficulty,
  stats,
  appear,
  boxRef,
  crossCategoryItems,
}: GameResultProps) {
  const statsHeadingId = useId();
  const distributionLabelId = useId();
  const shareHeadingId = useId();
  const { targetKanji, guesses, status } = gameState;
  const isWon = status === "won";
  const difficultyLabel = DIFFICULTY_LABELS[difficulty];

  const facts: ResultTableRow[] = targetKanji
    ? [
        { label: "音読み", value: targetKanji.onYomi },
        { label: "訓読み", value: targetKanji.kunYomi },
        { label: "意味", value: targetKanji.meanings, separator: ", " },
        { label: "例", value: targetKanji.examples },
      ].filter((fact) => fact.value.length > 0)
    : [];

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;
  const records: ResultTableRow[] = [
    { label: "遊んだ日", value: [`${stats.gamesPlayed}日`], unbreakable: true },
    { label: "正解率", value: [`${winRate}%`], unbreakable: true },
    {
      label: "連続中",
      value: [`${stats.currentStreak}日`],
      unbreakable: true,
    },
    { label: "最長連続", value: [`${stats.maxStreak}日`], unbreakable: true },
  ];

  return (
    <div className={styles.result}>
      <ResultBox
        ref={boxRef}
        tabIndex={-1}
        caption={`今日の${difficultyLabel}の答え`}
        appear={appear}
      >
        <div className={styles.resultBody}>
          <p className={styles.answer}>{targetKanji?.character}</p>
          <p>
            {isWon
              ? `${guesses.length}回目で当てました。`
              : `${MAX_GUESSES}回のうちに当てられませんでした。`}
          </p>
          {facts.length > 0 && <ResultTable rows={facts} />}
          <PhrasedText
            as="h2"
            id={statsHeadingId}
            className={styles.subHeading}
            phrases={[`${difficultyLabel}の`, "これまでの", "成績"]}
          />
          <ResultTable rows={records} labelledBy={statsHeadingId} />
          <p id={distributionLabelId} className={styles.distributionLabel}>
            何回目で当てたか（当てた日の数）
          </p>
          <QuantityBars
            labelledBy={distributionLabelId}
            items={stats.guessDistribution.map((count, i) => ({
              name: `${i + 1}回目`,
              value: count,
              valueText: String(count),
              current: isWon && guesses.length === i + 1,
            }))}
          />
        </div>
      </ResultBox>
      <section className={styles.share} aria-labelledby={shareHeadingId}>
        <PhrasedText
          as="h2"
          id={shareHeadingId}
          className={styles.shareHeading}
          phrases={["この", "結果を", "共有"]}
        />
        <ShareButtons
          url="/play/kanji-kanaru"
          title="漢字カナール"
          text={generateShareText(gameState, difficulty)}
          sns={["x", "line", "copy"]}
          contentType="game"
          contentId="kanji-kanaru"
        />
      </section>
      <NextPuzzleTime />
      <NextGameBanner currentGameSlug="kanji-kanaru" />
      <CrossCategoryBanner items={crossCategoryItems} />
    </div>
  );
}
