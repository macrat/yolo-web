import Link from "next/link";
import { allCheatsheetMetas } from "@/cheatsheets/registry";
import type { CheatsheetMeta } from "@/cheatsheets/types";
import styles from "./RelatedCheatsheets.module.css";

interface RelatedCheatsheetsProps {
  currentSlug: string;
  relatedSlugs: string[];
}

export default function RelatedCheatsheets({
  currentSlug,
  relatedSlugs,
}: RelatedCheatsheetsProps) {
  const relatedCheatsheets: CheatsheetMeta[] = allCheatsheetMetas.filter(
    (meta) => meta.slug !== currentSlug && relatedSlugs.includes(meta.slug),
  );

  if (relatedCheatsheets.length === 0) return null;

  return (
    <nav className={styles.related} aria-label="Related cheatsheets">
      <h2 className={styles.heading}>関連チートシート</h2>
      <ul className={styles.list}>
        {relatedCheatsheets.map((cs) => (
          <li key={cs.slug}>
            <Link href={`/cheatsheets/${cs.slug}`} className={styles.link}>
              <span className={styles.name}>{cs.name}</span>
              <span className={styles.description}>{cs.shortDescription}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
