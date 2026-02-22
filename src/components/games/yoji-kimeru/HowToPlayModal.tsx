"use client";

import GameDialog from "@/components/games/shared/GameDialog";
import styles from "./styles/YojiKimeru.module.css";

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
      titleId="yoji-kimeru-howtoplay-title"
      title="遊び方"
    >
      <div className={styles.howToPlayContent}>
        <p>
          毎日1つの四字熟語を当てるゲームです。6回以内に正解を見つけましょう。
        </p>
        <p>
          4文字の漢字を入力すると、各文字についてフィードバックが表示されます:
        </p>
        <ul className={styles.feedbackLegend}>
          <li>{"\u{1F7E9}"} 緑 = 正しい位置</li>
          <li>{"\u{1F7E8}"} 黄 = 別の位置に存在</li>
          <li>{"\u2B1C"} 灰 = 含まれない</li>
        </ul>
        <p>
          ヒントとして難易度が最初から表示されます。3回目の推測後に読みの最初の文字が、5回目の推測後にカテゴリが表示されます。
        </p>
      </div>
    </GameDialog>
  );
}
