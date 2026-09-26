"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import styles from "./DescriptionExpander.module.css";

interface Props {
  /** タイプの説明の全文。 */
  description: string;
  /**
   * 描く前の、説明が4行に収まらないかの見込み。描いたあとは、実際の幅と字の大きさで隠れる字があるかを測り直す。
   * 見込みが外れると、測り直したときに「続きを読む」の行が出入りして下の要素が動くので、来訪者の多い幅で
   * 当たる見込みを渡す。
   */
  likelyOverflows: boolean;
}

/**
 * 結果のページのタイプの説明。4行まで見せ、描いた幅で隠れる字があるときだけ「続きを読む」を出す。
 * 押しても何も増えないボタンを出さないため、字数ではなく、描いた段落が隠している字の有無で決める。
 */
export default function DescriptionExpander({
  description,
  likelyOverflows,
}: Props) {
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(likelyOverflows);

  useEffect(() => {
    const paragraph = paragraphRef.current;
    if (!paragraph || expanded) return;
    const measure = () =>
      setOverflows(paragraph.scrollHeight > paragraph.clientHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    // 幅と字の大きさが変わると、4行に入る字の数が変わる。
    const observer = new ResizeObserver(measure);
    observer.observe(paragraph);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <div>
      <p
        ref={paragraphRef}
        className={
          expanded
            ? styles.description
            : `${styles.description} ${styles.descriptionClamped}`
        }
      >
        {description}
      </p>
      {(expanded || overflows) && (
        <div className={styles.descriptionToggle}>
          <Button
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {expanded ? "折りたたむ" : "続きを読む"}
          </Button>
        </div>
      )}
    </div>
  );
}
