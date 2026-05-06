import type { ToolMeta } from "@/tools/types";
import ToolCard from "./ToolCard";
import styles from "./ToolsGrid.module.css";

interface ToolsGridProps {
  tools: ToolMeta[];
  /** NEW ラベルを表示するツールのスラッグ集合 */
  newSlugs: ReadonlySet<string>;
}

export default function ToolsGrid({ tools, newSlugs }: ToolsGridProps) {
  return (
    <div className={styles.grid} role="list" aria-label="ツール一覧">
      {tools.map((meta) => (
        <div key={meta.slug} role="listitem">
          <ToolCard meta={meta} isNew={newSlugs.has(meta.slug)} />
        </div>
      ))}
    </div>
  );
}
