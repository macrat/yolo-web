import type { Heading } from "@/lib/markdown";
import styles from "./TableOfContents.module.css";

interface TableOfContentsProps {
  headings: Heading[];
  /** 来訪者が項目を選んだとき。リンクの既定の動き（見出しへ移る）はそのまま起きる。 */
  onSelect: (heading: Heading) => void;
}

/**
 * 目次の項目の並び。記事の本文の見出しへ移るリンクを、本文に出る順に並べる。`##` はセクションの見出し、`###` と
 * それより深いものはセクションの中の小見出しなので（DESIGN.md §5）、小見出しの項目を1段だけ字下げする。
 */
export default function TableOfContents({
  headings,
  onSelect,
}: TableOfContentsProps) {
  return (
    <ul className={styles.list}>
      {headings.map((heading) => (
        <li
          key={heading.id}
          className={heading.level > 2 ? styles.subsection : undefined}
        >
          <a
            href={`#${heading.id}`}
            className={styles.link}
            data-text-box="inline"
            onClick={() => onSelect(heading)}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
