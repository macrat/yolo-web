"use client";

import { useId, type ReactNode } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import styles from "./ResultNextContent.module.css";

interface ResultNextContentProps {
  /** 見出しのすぐ下に並べる操作（「もう一度挑戦する」と、結果ごとのおすすめのリンク）。 */
  children: ReactNode;
  /**
   * 操作の下に並べる次の遊びの行。遊びの登録と分類の語をクライアントに持ち込まないよう、サーバーで行にしてから渡す。
   */
  items: ItemListItem[];
}

/**
 * 診断・クイズを解き終えた画面のセクション「次はこれを試してみよう」。見出しのすぐ下に、同じ診断をもう一度解く
 * 操作を置き、その下に次の遊びの一覧を置く。結果と読みものを読み終えた来訪者が、続けて遊ぶ先をここで選ぶ。
 */
export default function ResultNextContent({
  children,
  items,
}: ResultNextContentProps) {
  const headingId = useId();

  return (
    <Section aria-labelledby={headingId}>
      <PhrasedText
        as="h2"
        id={headingId}
        className={styles.heading}
        phrases={["次は", "これを", "試して", "みよう"]}
      />
      <div className={styles.actions}>{children}</div>
      {items.length > 0 && (
        <div className={styles.list}>
          <ItemList labelledBy={headingId} items={items} />
        </div>
      )}
    </Section>
  );
}
