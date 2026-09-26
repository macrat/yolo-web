import ItemList from "@/components/ItemList";
import { getPlayContentsByCategory } from "@/play/registry";
import { toPlayListItems } from "@/play/listItems";
import styles from "./RelatedGames.module.css";

interface RelatedGamesProps {
  currentSlug: string;
  relatedSlugs: string[] | undefined;
}

const HEADING_ID = "related-games";

/**
 * ゲームの面の「関連ゲーム」。ゲームが挙げた関連ゲームを、いまのゲームを除いて並べる。
 * 並べるものが無いときは何も描かない。
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
    <section className={styles.related} aria-labelledby={HEADING_ID}>
      <h2 id={HEADING_ID} className={styles.heading}>
        関連ゲーム
      </h2>
      <ItemList labelledBy={HEADING_ID} items={toPlayListItems(relatedGames)} />
    </section>
  );
}
