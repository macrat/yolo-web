"use client";

import { useCallback } from "react";
import type {
  Difficulty,
  GameState,
} from "@/play/games/kanji-kanaru/_lib/types";
import { generateShareText } from "@/play/games/kanji-kanaru/_lib/share";
import Button from "@/components/Button";
import ShareButtons from "@/components/ShareButtons";
import GameDialog from "@/play/games/shared/_components/new/GameDialog";
import CountdownTimer from "@/play/games/shared/_components/new/CountdownTimer";
import NextGameBanner from "@/play/games/shared/_components/new/NextGameBanner";
import { CrossCategoryBanner } from "@/play/games/shared/_components/new/CrossCategoryBanner";
import type { ItemListItem } from "@/components/ItemList";
import styles from "./styles/KanjiKanaru.module.css";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  gameState: GameState;
  difficulty: Difficulty;
  onStatsClick: () => void;
  /** 他カテゴリへの導線データ。Server Component（page.tsx）で事前計算して渡す。 */
  crossCategoryItems: ItemListItem[];
  /** Focus-restore anchor for the game-end auto-open. See GameContainer. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Modal showing the game result (win or loss) with answer details and share buttons.
 * Uses the shared GameDialog component.
 */
export default function ResultModal({
  open,
  onClose,
  gameState,
  difficulty,
  onStatsClick,
  crossCategoryItems,
  returnFocusRef,
}: ResultModalProps) {
  const { targetKanji, guesses, status } = gameState;
  const isWon = status === "won";
  const shareText = generateShareText(gameState, difficulty);

  const onReadings = targetKanji?.onYomi.join("\u3001") ?? "";
  const kunReadings = targetKanji?.kunYomi.join("\u3001") ?? "";
  const meanings = targetKanji?.meanings.join(", ") ?? "";
  const examples = targetKanji?.examples.join("\u3001") ?? "";

  const handleStatsClick = useCallback(() => {
    onClose();
    onStatsClick();
  }, [onClose, onStatsClick]);

  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="kanji-kanaru-result-title"
      title={isWon ? "\u6B63\u89E3!" : "\u6B8B\u5FF5..."}
      returnFocusRef={returnFocusRef}
      footer={
        <div className={styles.statsAction}>
          <Button onClick={handleStatsClick}>
            {"\u7D71\u8A08\u3092\u898B\u308B"}
          </Button>
        </div>
      }
    >
      <div className={styles.resultAnswer}>{targetKanji?.character ?? ""}</div>
      <div className={styles.resultReadings}>
        {onReadings && (
          <>
            {"\u97F3"}: {onReadings}
          </>
        )}
        {onReadings && kunReadings && " / "}
        {kunReadings && (
          <>
            {"\u8A13"}: {kunReadings}
          </>
        )}
      </div>
      {meanings && (
        <div className={styles.resultMeanings}>
          {"\u610F\u5473"}: {meanings}
        </div>
      )}
      {examples && (
        <div className={styles.resultExamples}>
          {"\u4F8B"}: {examples}
        </div>
      )}
      <div className={styles.resultSummary}>
        {isWon
          ? `${guesses.length}/6 \u3067\u6B63\u89E3\u3057\u307E\u3057\u305F!`
          : "6\u56DE\u4EE5\u5185\u306B\u6B63\u89E3\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F"}
      </div>
      <ShareButtons
        url="/play/kanji-kanaru"
        title={"\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB"}
        text={shareText}
        sns={["x", "line", "copy"]}
        contentType="game"
        contentId="kanji-kanaru"
      />
      <CountdownTimer />
      <NextGameBanner currentGameSlug="kanji-kanaru" />
      <CrossCategoryBanner items={crossCategoryItems} />
    </GameDialog>
  );
}
