"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { useIsServerRendered } from "@/components/hooks/useIsServerRendered";
import {
  FRAME_LAYOUT_DEFINE,
  LAYOUT_PREVIOUS_GROUP,
  layoutGroup,
} from "@/lib/scroll-frame";
import styles from "./DataTable.module.css";

/** DataTable が組（DataTableGroup）の中にあるか。 */
export const InDataTableGroup = createContext(false);

/**
 * 1つのボックスや区画の中で縦に並べて続けて読ませる値の並び（DESIGN.md §5）。中の DataTable の行の見出しの列を、
 * そのうちいちばん広いものにそろえ、縦の罫線を1本に通す。表のあいだに小見出しなどを挟んでよい。そろえると値の
 * 列に文節が入らなくなる表と、列を細くした表・横に送る表は、自分の幅で組む。組は入れ子にしない（入れ子にすると
 * 描くときに Error を投げる）。
 *
 * 組は箱を持たない（display: contents）ので、親の並びとあきに影を落とさない。そのため、組の中の DataTable には
 * inBox を渡せない（結果のボックスの kind="table" は1つの表の箱で、組の箱は幅を持たない）。渡すと描くときに
 * Error を投げる。
 *
 * 組みは最初の描画の前に、組の全部の表を1度に決める。サーバーで描いた組は、組の前のスクリプトが組み方を定め、
 * 組の直後のスクリプトが組の全部を組む。組の全体が届いて組むまでは、表のあいだの中身ごと組を描かない。ブラウザで
 * 描く組は描く前に組み、中の表が増えたり減ったりしたときも描く前に組み直す。
 */
export default function DataTableGroup({ children }: { children: ReactNode }) {
  const groupRef = useRef<HTMLDivElement>(null);
  const isServerRendered = useIsServerRendered();
  if (useContext(InDataTableGroup)) {
    throw new Error("DataTableGroup は入れ子にしない");
  }

  // 中の表の増減は、組の枠の数として組んだ印と比べるので、描くたびに確かめる。
  useLayoutEffect(() => {
    if (groupRef.current) layoutGroup(groupRef.current);
  });

  return (
    <InDataTableGroup.Provider value={true}>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: FRAME_LAYOUT_DEFINE }}
        />
      )}
      {/* 組んだ印は、組むときに付ける。 */}
      <div
        ref={groupRef}
        className={styles.group}
        data-table-group=""
        suppressHydrationWarning
      >
        {children}
      </div>
      {isServerRendered && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: LAYOUT_PREVIOUS_GROUP }}
        />
      )}
    </InDataTableGroup.Provider>
  );
}
