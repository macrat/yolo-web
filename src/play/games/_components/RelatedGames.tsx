import ItemList from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import { getPlayContentsByCategory } from "@/play/registry";
import { toPlayListItems } from "@/play/listItems";
import styles from "./RelatedGames.module.css";

interface RelatedGamesProps {
  currentSlug: string;
  relatedSlugs: string[] | undefined;
}

const HEADING_ID = "related-games";

/**
 * ゲームのページの「関連ゲーム」。ゲームが挙げた関連ゲームを、いまのゲームを除いて並べる、ページの1つのセクション
 * （DESIGN.md §5）。並べるものが無いときは、セクションごと描かない。
 */
export default function RelatedGames({
  currentSlug,
  relatedSlugs,
}: RelatedGamesProps) {
  const slugs = new Set(relatedSlugs);
  const relatedGames = getPlayContentsByCategory("game").filter(
    (content) => content.slug !== currentSlug && slugs.has(content.slug),
  );

  if (relatedGames.length === 0) return null;

  return (
    <Section>
      <PhrasedText
        as="h2"
        id={HEADING_ID}
        className={styles.heading}
        phrases={["関連", "ゲーム"]}
      />
      <ItemList labelledBy={HEADING_ID} items={toPlayListItems(relatedGames)} />
    </Section>
  );
}
