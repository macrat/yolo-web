"use client";

import { useRef, useEffect, useCallback } from "react";
import styles from "./styles/YojiKimeru.module.css";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal explaining how to play the game.
 * Uses the native <dialog> element for accessibility.
 */
export default function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={handleClose}
      aria-labelledby="howtoplay-title"
    >
      <h2 id="howtoplay-title" className={styles.modalTitle}>
        遊び方
      </h2>
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
      <button className={styles.modalClose} onClick={handleClose} type="button">
        閉じる
      </button>
    </dialog>
  );
}
