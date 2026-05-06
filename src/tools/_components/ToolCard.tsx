import Link from "next/link";
import type { ToolMeta } from "@/tools/types";
import { categoryLabelMap } from "./categoryLabels";
import styles from "./ToolCard.module.css";

interface ToolCardProps {
  meta: ToolMeta;
  /** このツールが新着かどうか（呼び出し元で判定） */
  isNew?: boolean;
}

export default function ToolCard({ meta, isNew }: ToolCardProps) {
  return (
    <Link href={`/tools/${meta.slug}`} className={styles.card}>
      <div className={styles.badges}>
        <span className={styles.category}>
          {categoryLabelMap[meta.category] || meta.category}
        </span>
        {isNew && <span className={styles.newBadge}>NEW</span>}
      </div>
      <h2 className={styles.name}>{meta.name}</h2>
      <p className={styles.description}>{meta.shortDescription}</p>
    </Link>
  );
}
