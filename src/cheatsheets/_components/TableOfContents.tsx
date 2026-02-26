import type { CheatsheetSection } from "@/cheatsheets/types";
import styles from "./TableOfContents.module.css";

interface TableOfContentsProps {
  sections: CheatsheetSection[];
}

export default function TableOfContents({ sections }: TableOfContentsProps) {
  if (sections.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="目次">
      <h2 className={styles.heading}>目次</h2>
      <ul className={styles.list}>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className={styles.link}>
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
