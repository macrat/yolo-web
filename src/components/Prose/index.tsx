"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { markScrollFrame, SCROLL_FRAME_LABELS } from "@/lib/scroll-frame";
import styles from "./Prose.module.css";

/** 本文の中の、横に送る枠と、その中身の種類。 */
const SCROLL_FRAMES = [
  { selector: ".table-scroll", label: SCROLL_FRAME_LABELS.table },
  { selector: "pre", label: SCROLL_FRAME_LABELS.code },
] as const;

function markScrollFrames(root: HTMLElement) {
  for (const { selector, label } of SCROLL_FRAMES) {
    for (const frame of root.querySelectorAll<HTMLElement>(selector)) {
      markScrollFrame(frame, label);
    }
  }
}

interface ProseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML"
> {
  /** Markdown を組んでサニタイズした HTML。 */
  html: string;
}

/**
 * 記事の本文（DESIGN.md §4・§5）。Markdown を組んだ HTML を、ブログの記事と markdown-preview の
 * プレビューが同じ組み方で出す。
 *
 * 表とコードのボックスが横に送れるかは、描いたあとの幅でしか分からない。描いたあとと、幅・文字の
 * 大きさ・Web フォントが変わったときに測り直す。表の枠は場所を取らない線で描くので、付け外しで
 * 表とその下は動かない。
 */
export default function Prose({ html, className, ...rest }: ProseProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const update = () => markScrollFrames(root);
    update();
    let active = true;
    document.fonts?.ready.then(() => {
      if (active) update();
    });
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(root);
    for (const table of root.querySelectorAll(".table-scroll > table")) {
      observer?.observe(table);
    }
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [html]);

  return (
    <div
      {...rest}
      ref={ref}
      className={className ? `${styles.prose} ${className}` : styles.prose}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
