import type { ComponentPropsWithoutRef } from "react";
import styles from "./Section.module.css";

type SectionProps = Omit<ComponentPropsWithoutRef<"section">, "className">;

/**
 * セクション（DESIGN.md §5 ページの割り方）。ページの中間に、兄弟として上から順に並べる。
 * 2つ目からのセクションは、上に全幅の罫線を持つ。頭には見出しを1つ置く。
 *
 * 見た目の割り当てを持たせないため className を受けない。セクションの切れ目の位置と罫線の形が、
 * どのページでも同じになる（§12 位置の一定）。
 */
export default function Section({ children, ...rest }: SectionProps) {
  return (
    <section className={styles.section} {...rest}>
      {children}
    </section>
  );
}
