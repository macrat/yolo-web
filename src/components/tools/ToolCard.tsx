import Link from "next/link";
import type { ToolMeta } from "@/tools/types";
import styles from "./ToolCard.module.css";

interface ToolCardProps {
  meta: ToolMeta;
}

const categoryLabels: Record<string, string> = {
  text: "テキスト",
  encoding: "エンコーディング",
  developer: "開発者向け",
  security: "セキュリティ",
  generator: "生成",
};

export default function ToolCard({ meta }: ToolCardProps) {
  return (
    <Link href={`/tools/${meta.slug}`} className={styles.card}>
      <span className={styles.category}>
        {categoryLabels[meta.category] || meta.category}
      </span>
      <h2 className={styles.name}>{meta.name}</h2>
      <p className={styles.description}>{meta.shortDescription}</p>
    </Link>
  );
}
