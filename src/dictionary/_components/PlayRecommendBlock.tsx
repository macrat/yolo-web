import ItemList from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import { toPlayListItems } from "@/play/listItems";
import type { PlayContentMeta } from "@/play/types";
import styles from "./PlayRecommendBlock.module.css";

interface PlayRecommendBlockProps {
  recommendations: PlayContentMeta[];
}

const HEADING_ID = "play-recommend";

/**
 * 辞典の詳細のページの末尾に置く、遊びのおすすめのセクション（DESIGN.md §5）。見出しはセクションの見出しで、
 * 主見出しより小さい段に立つ（§4）。行は遊びのほかの一覧と同じ形（名前・説明・種別・補助情報）。
 * おすすめが無いときは、セクションごと描かない。
 */
export default function PlayRecommendBlock({
  recommendations,
}: PlayRecommendBlockProps) {
  if (recommendations.length === 0) return null;

  return (
    <Section>
      <PhrasedText
        as="h2"
        id={HEADING_ID}
        className={styles.heading}
        phrases={["こちらも", "おすすめ"]}
      />
      <p className={styles.subtext}>ブラウザで今すぐ遊べる無料コンテンツ</p>
      <ItemList
        labelledBy={HEADING_ID}
        items={toPlayListItems(recommendations)}
      />
    </Section>
  );
}
