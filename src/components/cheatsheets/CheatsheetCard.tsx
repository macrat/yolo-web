import Link from "next/link";
import type { CheatsheetMeta } from "@/cheatsheets/types";
import styles from "./CheatsheetCard.module.css";

interface CheatsheetCardProps {
  meta: CheatsheetMeta;
}

const categoryLabels: Record<string, string> = {
  developer: "開発者向け",
  writing: "ライティング",
  devops: "DevOps",
};

export default function CheatsheetCard({ meta }: CheatsheetCardProps) {
  return (
    <Link href={`/cheatsheets/${meta.slug}`} className={styles.card}>
      <span className={styles.category}>
        {categoryLabels[meta.category] || meta.category}
      </span>
      <h2 className={styles.name}>{meta.name}</h2>
      <p className={styles.description}>{meta.shortDescription}</p>
    </Link>
  );
}
