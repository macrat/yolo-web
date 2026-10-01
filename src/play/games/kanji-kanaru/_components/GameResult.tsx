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
import DataTable, { type DataTableRow } from "@/components/DataTable";
import ResultBox from "@/components/ResultBox";
import PhrasedText from "@/components/PhrasedText";
import QuantityBars from "@/components/QuantityBars";
import ShareButtons from "@/components/ShareButtons";
import type { ItemListItem } from "@/components/ItemList";
import NextPuzzleTime from "@/play/games/shared/_components/NextPuzzleTime";
import NextGameBanner from "@/play/games/shared/_components/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/CrossCategoryBanner";
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

  const facts: DataTableRow[] = targetKanji
    ? [
        { key: "on", header: ["音読み"], items: targetKanji.onYomi },
        { key: "kun", header: ["訓読み"], items: targetKanji.kunYomi },
        {
          key: "meaning",
          header: ["意味"],
          items: targetKanji.meanings,
          separator: ", ",
        },
        { key: "example", header: ["例"], items: targetKanji.examples },
      ]
        .filter((fact) => fact.items.length > 0)
        .map(({ key, header, items, separator }) => ({
          key,
          header,
          cells: [listPhrases(items, separator)],
        }))
    : [];

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;
  const records: DataTableRow[] = [
    {
      key: "played",
      header: ["遊んだ日"],
      cells: [[`${stats.gamesPlayed}日`]],
    },
    { key: "winRate", header: ["正解率"], cells: [[`${winRate}%`]] },
    {
      key: "currentStreak",
      header: ["連続中"],
      cells: [[`${stats.currentStreak}日`]],
    },
    {
      key: "maxStreak",
      header: ["最長連続"],
      cells: [[`${stats.maxStreak}日`]],
    },
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
          {facts.length > 0 && (
            <DataTable
              label={`「${targetKanji?.character}」の読みと意味`}
              rows={facts}
            />
          )}
          <PhrasedText
            as="h2"
            id={statsHeadingId}
            className={styles.subHeading}
            phrases={[`${difficultyLabel}の`, "これまでの", "成績"]}
          />
          <DataTable labelledBy={statsHeadingId} rows={records} />
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

/**
 * 並べた語（読み・意味・例）を表のセルの区切りの並びにする。語を1つずつ文節にし、区切りの字（「、」「, 」）を
 * 前の語に付けて、区切りの字のあとでだけ折る。
 */
function listPhrases(
  items: readonly string[],
  separator = "、",
): readonly string[] {
  return items.map((item, index) =>
    index < items.length - 1 ? `${item}${separator}` : item,
  );
}
