"use client";

import GameDialog from "@/games/shared/_components/GameDialog";
import styles from "./styles/KanjiKanaru.module.css";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal explaining how to play the game.
 * Uses the shared GameDialog component for consistent dialog behavior.
 */
export default function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  return (
    <GameDialog
      open={open}
      onClose={onClose}
      titleId="kanji-kanaru-howtoplay-title"
      title="遊び方"
    >
      <div className={styles.howToPlayContent}>
        <p>毎日1つの漢字を当てるゲームです。6回以内に正解を見つけましょう。</p>
        <p>漢字を入力すると、5つの属性についてフィードバックが表示されます:</p>
        <ul className={styles.feedbackLegend}>
          <li>{"\u{1F7E9}"} = 一致</li>
          <li>{"\u{1F7E8}"} = 近い</li>
          <li>{"\u2B1C"} = 不一致</li>
        </ul>
        <p className={styles.attributeList}>
          属性: 部首 / 画数 / 学年 / 音読み / 意味カテゴリ
        </p>
      </div>
    </GameDialog>
  );
}
