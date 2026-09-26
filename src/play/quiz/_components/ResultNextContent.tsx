"use client";

import ItemList, { type ItemListItem } from "@/components/ItemList";
import styles from "./ResultNextContent.module.css";

interface ResultNextContentProps {
  /**
   * 並べる行。遊びの登録と分類の語をクライアントに持ち込まないよう、サーバーで行にしてから渡す。
   */
  items: ItemListItem[];
}

const HEADING_ID = "result-next-content";

/**
 * 診断・クイズを解き終えた画面で、結果の下に次の遊びを並べる。並べるものが無いときは何も描かない。
 */
export default function ResultNextContent({ items }: ResultNextContentProps) {
  if (items.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby={HEADING_ID}>
      <h3 id={HEADING_ID} className={styles.heading}>
        次はこれを試してみよう
      </h3>
      <ItemList labelledBy={HEADING_ID} items={items} />
    </section>
  );
}
