import ItemList, { type ItemListItem } from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
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
 * ツールのページの末尾の「関連ツール」。ページの1つのセクション（DESIGN.md §5）で、見出しはセクションの見出しの段に
 * 立つ（§4）。行はツール名・一行の説明・種別で、似たツールのどれへ進むかを開く前に選べる。
 * 種別の語はツールの一覧と同じで、載せたツールがすべて同じ種別なら行に出ない（ItemList）。
 * 載せるツールが無いときは、セクションごと描かない。
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
    <Section>
      <PhrasedText
        as="h2"
        id={HEADING_ID}
        className={styles.heading}
        phrases={["関連", "ツール"]}
      />
      <ItemList labelledBy={HEADING_ID} items={items} />
    </Section>
  );
}
