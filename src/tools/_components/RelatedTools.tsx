import Link from "next/link";
import { allToolMetas } from "@/tools/registry";
import type { ToolMeta } from "@/tools/types";
import styles from "./RelatedTools.module.css";

interface RelatedToolsProps {
  currentSlug: string;
  relatedSlugs: string[];
}

export default function RelatedTools({
  currentSlug,
  relatedSlugs,
}: RelatedToolsProps) {
  const relatedTools: ToolMeta[] = allToolMetas.filter(
    (meta) => meta.slug !== currentSlug && relatedSlugs.includes(meta.slug),
  );

  if (relatedTools.length === 0) return null;

  return (
    <nav className={styles.related} aria-label="Related tools">
      <h2 className={styles.heading}>関連ツール</h2>
      <ul className={styles.list}>
        {relatedTools.map((tool) => (
          <li key={tool.slug}>
            <Link href={`/tools/${tool.slug}`} className={styles.link}>
              <span className={styles.name}>{tool.name}</span>
              <span className={styles.description}>
                {tool.shortDescription}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
