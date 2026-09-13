"use client";

/**
 * ⚠️ 重要 — このコードは「受検者本人には表示されない」第三者向け結果ページの一部です。
 *
 * ルート `/play/[slug]/result/[resultId]`（診断の result ページ）は【第三者向けの
 * シェア／検索ランディング専用】。診断を遊んだ本人は、完了時に `/play/[slug]` 上に
 * インライン描画される結果（ResultCard 経由）で見ており、この `/result/<id>` ページへは
 * 遷移しない（この URL はシェア用に生成される）。文言・構造・メタ・OGP は
 * 「診断をやっていない第三者が初めて見る」前提で設計すること。本人向け結果体験は
 * `src/play/quiz/_components/ResultCard.tsx` 側で編集する。
 */

import { useState } from "react";
import styles from "./DescriptionExpander.module.css";

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
