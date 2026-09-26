import ItemList from "@/components/ItemList";
import { toPlayListItems } from "@/play/listItems";
import type { PlayContentMeta } from "@/play/types";
import styles from "./PlayRecommendBlock.module.css";

interface PlayRecommendBlockProps {
  recommendations: PlayContentMeta[];
}

const HEADING_ID = "play-recommend";

/**
 * 辞典の詳細のページの末尾に置く、遊びのおすすめ。行は遊びのほかの一覧と同じ形（名前・説明・種別・補助情報）。
 * おすすめが無いときは何も描かない。
 */
export default function PlayRecommendBlock({
  recommendations,
}: PlayRecommendBlockProps) {
  if (recommendations.length === 0) return null;

  return (
    <section className={styles.related}>
      <h2 id={HEADING_ID} className={styles.heading}>
        こちらもおすすめ
      </h2>
      <p className={styles.subtext}>ブラウザで今すぐ遊べる無料コンテンツ</p>
      <ItemList
        labelledBy={HEADING_ID}
        items={toPlayListItems(recommendations)}
      />
    </section>
  );
}
