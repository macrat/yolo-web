import type { ToolMeta } from "@/tools/types";
import ToolCard from "./ToolCard";
import styles from "./ToolsGrid.module.css";

interface ToolsGridProps {
  tools: ToolMeta[];
}

export default function ToolsGrid({ tools }: ToolsGridProps) {
  return (
    <div className={styles.grid} role="list" aria-label="Tools list">
      {tools.map((meta) => (
        <div key={meta.slug} role="listitem">
          <ToolCard meta={meta} />
        </div>
      ))}
    </div>
  );
}
