import ItemList from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
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
 * いまのクイズ・診断と同じ分類のものを、登録の順に、いまのものを除いて並べる、ページの1つのセクション
 * （DESIGN.md §5）。見出しはセクションの見出しで、どの面に置いても主見出しより小さい段に立つ（§4）。
 * 並べるものが無いときは、セクションごと描かない。
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
    <Section>
      <PhrasedText
        as="h2"
        id={HEADING_ID}
        className={styles.heading}
        phrases={["他の", "クイズ・", "診断も", "試して", "みよう"]}
      />
      <ItemList
        labelledBy={HEADING_ID}
        items={toPlayListItems(relatedContents)}
      />
    </Section>
  );
}
