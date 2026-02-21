"use client";

import { useRef, useEffect, useCallback } from "react";
import styles from "./styles/KanjiKanaru.module.css";

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

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={handleClose}
      onClick={handleBackdropClick}
      aria-labelledby="kanji-kanaru-howtoplay-title"
    >
      <h2 id="kanji-kanaru-howtoplay-title" className={styles.modalTitle}>
        遊び方
      </h2>
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
      <button className={styles.modalClose} onClick={handleClose} type="button">
        閉じる
      </button>
    </dialog>
  );
}
