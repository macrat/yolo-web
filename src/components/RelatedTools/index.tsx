import ItemList, { type ItemListItem } from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import { toolCategoryLabel } from "@/tools/categories";
import { allToolMetas } from "@/tools/registry";
import styles from "./RelatedTools.module.css";

interface RelatedToolsProps {
  /** いま開いているツールのスラッグ。一覧には載せない。 */
  currentSlug: string;
  /** 載せる関連ツールのスラッグ。 */
  relatedSlugs: string[];
}

const HEADING_ID = "related-tools";

/**
 * ツールのページの末尾の「関連ツール」。行はツール名・一行の説明・種別で、似たツールのどれへ進むかを開く前に選べる。
 * 種別の語はツールの一覧と同じで、載せたツールがすべて同じ種別なら行に出ない（ItemList）。
 * 載せるツールが無いときは何も描かない。
 */
export default function RelatedTools({
  currentSlug,
  relatedSlugs,
}: RelatedToolsProps) {
  const items: ItemListItem[] = allToolMetas
    .filter(
      (meta) => meta.slug !== currentSlug && relatedSlugs.includes(meta.slug),
    )
    .map((meta) => ({
      name: meta.name,
      href: `/tools/${meta.slug}`,
      description: meta.shortDescription,
      kind: toolCategoryLabel(meta.category),
    }));

  if (items.length === 0) return null;

  return (
    <section className={styles.related}>
      <PhrasedText
        as="h2"
        id={HEADING_ID}
        className={styles.heading}
        phrases={["関連", "ツール"]}
      />
      <ItemList labelledBy={HEADING_ID} items={items} />
    </section>
  );
}
