"use client";

import { useId } from "react";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import styles from "./CrossCategoryBanner.module.css";

interface CrossCategoryBannerProps {
  /** 並べる行。遊びの登録と分類の語をクライアントに持ち込まないよう、サーバーで行にしてから渡す。 */
  items: ItemListItem[];
}

/**
 * ゲームを終えたダイアログで、ゲームでない遊び（運勢・診断・クイズ）を並べる。行は名前と種別を持つ。
 * 並べるものが無いときは何も描かない。
 */
export function CrossCategoryBanner({ items }: CrossCategoryBannerProps) {
  const labelId = useId();

  if (items.length === 0) return null;

  return (
    <div className={styles.crossCategory}>
      <p id={labelId} className={styles.label}>
        他のコンテンツも試してみよう
      </p>
      {/* ダイアログの枠と二重にならないよう、一覧はボックスを持たない。 */}
      <ItemList labelledBy={labelId} items={items} boxed={false} />
    </div>
  );
}
