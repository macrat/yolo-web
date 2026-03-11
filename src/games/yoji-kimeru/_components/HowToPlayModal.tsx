"use client";

import GameDialog from "@/games/shared/_components/GameDialog";
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
        <p className={styles.howToPlaySection}>
          <strong>難易度について</strong>
        </p>
        <ul className={styles.feedbackLegend}>
          <li>初級: 日常でよく使われる四字熟語</li>
          <li>中級: ニュースや書籍で見かける四字熟語</li>
          <li>上級: 専門的・文語的な四字熟語を含む全問題</li>
        </ul>
        <p>
          初級は問題数が限られるため、同じ問題が再出題されることがあります。
        </p>
        <p className={styles.howToPlaySection}>
          <strong>ヒントについて</strong>
        </p>
        <ul className={styles.feedbackLegend}>
          <li>難易度と読みの文字数が最初から表示されます</li>
          <li>3回目の推測後に読みの最初の文字が表示されます</li>
          <li>4回目の推測後に出典（中国/日本）が表示されます</li>
          <li>5回目の推測後にカテゴリが表示されます</li>
        </ul>
      </div>
    </GameDialog>
  );
}
