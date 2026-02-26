import type { NakamawakeGroup } from "@/games/nakamawake/_lib/types";
import { getDifficultyColor } from "@/games/nakamawake/_lib/engine";
import styles from "./SolvedGroups.module.css";

interface Props {
  groups: NakamawakeGroup[];
}

/**
 * Displays correctly solved groups above the word grid.
 */
export default function SolvedGroups({ groups }: Props) {
  if (groups.length === 0) return null;
  return (
    <div
      className={styles.container}
      aria-label={"\u6B63\u89E3\u3057\u305F\u30B0\u30EB\u30FC\u30D7"}
    >
      {groups.map((group) => (
        <div
          key={group.name}
          className={`${styles.group} ${styles[getDifficultyColor(group.difficulty)]}`}
        >
          <div className={styles.groupName}>{group.name}</div>
          <div className={styles.groupWords}>{group.words.join("\u3001")}</div>
        </div>
      ))}
    </div>
  );
}
