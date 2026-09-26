import ItemList, { type ItemListItem } from "@/components/ItemList";
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
 * ツールのページの末尾の「関連ツール」。行はツール名と一行の説明で、似たツールのどれへ進むかを開く前に選べる。
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
    }));

  if (items.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby={HEADING_ID}>
      <h2 id={HEADING_ID} className={styles.heading}>
        関連ツール
      </h2>
      <ItemList labelledBy={HEADING_ID} items={items} />
    </section>
  );
}
