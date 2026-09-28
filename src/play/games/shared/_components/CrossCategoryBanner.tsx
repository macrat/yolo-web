"use client";

import { useId } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import styles from "./CrossCategoryBanner.module.css";

interface CrossCategoryBannerProps {
  /** 並べる行。遊びの登録と分類の語をクライアントに持ち込まないよう、サーバーで行にしてから渡す。 */
  items: ItemListItem[];
}

/**
 * ゲームを解き終えた結果に続く小見出しの区画で、ゲームでない遊び（運勢・診断・クイズ）を並べる。行は名前と種別を持つ。
 * 並べるものが無いときは何も描かない。
 */
export function CrossCategoryBanner({ items }: CrossCategoryBannerProps) {
  const headingId = useId();

  if (items.length === 0) return null;

  return (
    <section className={styles.crossCategory} aria-labelledby={headingId}>
      <PhrasedText
        as="h2"
        id={headingId}
        className={styles.heading}
        phrases={["他の", "コンテンツも", "試して", "みよう"]}
      />
      <ItemList labelledBy={headingId} items={items} />
    </section>
  );
}
