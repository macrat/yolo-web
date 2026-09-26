import type { ReactNode } from "react";
import styles from "./ListStack.module.css";

interface ListStackProps {
  /** 上から、件数の行（と操作の組）・一覧の順に渡す。 */
  children: ReactNode;
}

/**
 * 一覧のページで、件数の行と操作の組を一覧の上に置き、一覧とのあいだを 24px あける（DESIGN.md §5 の間隔）。
 * どの一覧のページも、件数の行と一覧の距離がこの1か所で決まる（§12 位置の一定）。
 */
export default function ListStack({ children }: ListStackProps) {
  return <div className={styles.stack}>{children}</div>;
}
