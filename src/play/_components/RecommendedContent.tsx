import ItemList from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import { getRecommendedContents } from "@/play/recommendation";
import { toPlayListItems } from "@/play/listItems";
import styles from "./RecommendedContent.module.css";

interface RecommendedContentProps {
  currentSlug: string;
}

const HEADING_ID = "recommended-content";

/**
 * いまの遊びと違う分類から、おすすめを1件ずつ選んで並べる。選ぶものが無いときは何も描かない。
 */
export default function RecommendedContent({
  currentSlug,
}: RecommendedContentProps) {
  const recommended = getRecommendedContents(currentSlug);

  if (recommended.length === 0) return null;

  return (
    <section className={styles.related}>
      <PhrasedText
        as="h2"
        id={HEADING_ID}
        className={styles.heading}
        phrases={["他の", "ジャンルも", "試して", "みよう"]}
      />
      <ItemList labelledBy={HEADING_ID} items={toPlayListItems(recommended)} />
    </section>
  );
}
