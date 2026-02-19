import type { CheatsheetMeta } from "@/cheatsheets/types";
import CheatsheetCard from "./CheatsheetCard";
import styles from "./CheatsheetGrid.module.css";

interface CheatsheetGridProps {
  cheatsheets: CheatsheetMeta[];
}

export default function CheatsheetGrid({ cheatsheets }: CheatsheetGridProps) {
  return (
    <div className={styles.grid} role="list" aria-label="Cheatsheets list">
      {cheatsheets.map((meta) => (
        <div key={meta.slug} role="listitem">
          <CheatsheetCard meta={meta} />
        </div>
      ))}
    </div>
  );
}
