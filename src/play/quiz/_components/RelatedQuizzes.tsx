import ItemList from "@/components/ItemList";
import { getPlayContentsByCategory } from "@/play/registry";
import { toPlayListItems } from "@/play/listItems";
import type { PlayContentMeta } from "@/play/types";
import styles from "./RelatedQuizzes.module.css";

/** 並べる件数の上限。 */
const MAX_RELATED_COUNT = 3;

const HEADING_ID = "related-quizzes";

interface RelatedQuizzesProps {
  currentSlug: string;
  category: PlayContentMeta["category"];
}

/**
 * いまのクイズ・診断と同じ分類のものを、登録の順に、いまのものを除いて並べる。
 * 並べるものが無いときは何も描かない。
 */
export default function RelatedQuizzes({
  currentSlug,
  category,
}: RelatedQuizzesProps) {
  const relatedContents = getPlayContentsByCategory(category)
    .filter((content) => content.slug !== currentSlug)
    .slice(0, MAX_RELATED_COUNT);

  if (relatedContents.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby={HEADING_ID}>
      <h2 id={HEADING_ID} className={styles.heading}>
        他のクイズ・診断も試してみよう
      </h2>
      <ItemList
        labelledBy={HEADING_ID}
        items={toPlayListItems(relatedContents)}
      />
    </section>
  );
}
