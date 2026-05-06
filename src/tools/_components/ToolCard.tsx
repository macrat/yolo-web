import Link from "next/link";
import type { ToolMeta } from "@/tools/types";
import { categoryLabelMap } from "./categoryLabels";
import styles from "./ToolCard.module.css";

interface ToolCardProps {
  meta: ToolMeta;
}

export default function ToolCard({ meta }: ToolCardProps) {
  return (
    <Link href={`/tools/${meta.slug}`} className={styles.card}>
      <span className={styles.category}>
        {categoryLabelMap[meta.category] || meta.category}
      </span>
      <h2 className={styles.name}>{meta.name}</h2>
      <p className={styles.description}>{meta.shortDescription}</p>
    </Link>
  );
}
