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
  /**
   * 端末の記録を当てる前の場所取り。渡すと、並びと組の見せ方（display）をこの値にし、見えないまま場所だけを
   * 取る。本体の前のスクリプトが、記録で当てた組だけを見せる値を書く。
   */
  reserved?: {
    listDisplay: string;
    groupDisplay: (group: NakamawakeGroup) => string;
  };
}

/**
 * 盤の上の段に、当てた組を当てた順に並べる。組は4つの語のマスを1つにつないだ盤のマスで、当たりの判定の
 * マスと同じ地（DESIGN.md §8）を持つ。組の難易度は、凡例と同じ「難易度1」〜「難易度4」の字で言う。
 */
export default function SolvedGroups({ groups, latestRef, reserved }: Props) {
  if (groups.length === 0) return null;
  return (
    <ul
      className={
        reserved ? `${styles.groups} ${styles.reserved}` : styles.groups
      }
      style={reserved && { display: reserved.listDisplay }}
      aria-label="当てた組"
      aria-hidden={reserved ? true : undefined}
    >
      {groups.map((group, index) => (
        <li
          key={group.name}
          ref={index === groups.length - 1 ? latestRef : undefined}
          className={styles.group}
          style={reserved && { display: reserved.groupDisplay(group) }}
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
