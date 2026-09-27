import type { Ref } from "react";
import type { NakamawakeGroup } from "@/play/games/nakamawake/_lib/types";
import { difficultyLabel } from "@/play/games/nakamawake/_lib/engine";
import GroupWords from "./GroupWords";
import styles from "./SolvedGroups.module.css";

interface Props {
  /** 当てた組。当てた順に並べる。 */
  groups: NakamawakeGroup[];
  /** いちばん新しく当てた組の要素。当てたあと、その組と語の格子を画面に入れるのに使う。 */
  latestRef?: Ref<HTMLLIElement>;
}

/**
 * 盤の上の段に、当てた組を当てた順に並べる。組は4つの語のマスを1つにつないだ盤のマスで、当たりの判定の
 * マスと同じ地（DESIGN.md §8）を持つ。組の難易度は、凡例と同じ「難易度1」〜「難易度4」の字で言う。
 */
export default function SolvedGroups({ groups, latestRef }: Props) {
  if (groups.length === 0) return null;
  return (
    <ul className={styles.groups} aria-label="当てた組">
      {groups.map((group, index) => (
        <li
          key={group.name}
          ref={index === groups.length - 1 ? latestRef : undefined}
          className={styles.group}
        >
          <p className={styles.head}>
            <span className={styles.name}>{group.name}</span>
            <span className={styles.difficulty}>
              {difficultyLabel(group.difficulty)}
            </span>
          </p>
          <GroupWords words={group.words} />
        </li>
      ))}
    </ul>
  );
}
