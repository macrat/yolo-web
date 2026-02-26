import styles from "./TableOfContents.module.css";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <h2 className={styles.title}>目次</h2>
      <ul className={styles.list}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={styles.item}
            style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
          >
            <a href={`#${heading.id}`} className={styles.link}>
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
