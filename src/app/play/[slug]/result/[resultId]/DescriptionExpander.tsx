"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Props {
  /** 表示するdescriptionテキスト */
  description: string;
  /** trueの場合、テキストを4行でクランプし展開ボタンを表示する */
  isLong: boolean;
}

/**
 * descriptionの展開/折りたたみを担うクライアントコンポーネント。
 * isLong=trueの場合のみ「続きを読む」ボタンを表示し、クリックで全文展開する。
 * useStateを使う部分をここに切り出すことで、親のServerComponentの静的性を保つ。
 */
export default function DescriptionExpander({ description, isLong }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.descriptionWrapper}>
      <p
        className={
          isLong && !expanded
            ? `${styles.description} ${styles.descriptionClamped}`
            : styles.description
        }
      >
        {description}
      </p>
      {isLong && (
        <button
          className={styles.descriptionToggle}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? "折りたたむ" : "続きを読む"}
        </button>
      )}
    </div>
  );
}
