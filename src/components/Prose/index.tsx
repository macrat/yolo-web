"use client";

import { useLayoutEffect, useRef, type HTMLAttributes } from "react";
import { layoutFrames } from "@/lib/scroll-frame";
import styles from "./Prose.module.css";

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
 * 表の列の幅と、表とコードのボックスを横に送るか（枠と止まりどころ）は、描く前に決め、描いたあとに組み直して
 * 表とその下を動かさない。記事の最初の読み込みでは、表の直後のスクリプトが組む（src/lib/scroll-frame.ts）。
 * 差し込んだ HTML のスクリプトは動かないので、Link で移ったときと、プレビューで HTML を差し替えたときは、
 * ここで描く前（layout effect）に同じ関数で組む。水和のときは、スクリプトが組んだときと幅も字の大きさも Web
 * フォントの状態も同じ表は組み直さない。幅が変わったときと、読み込み中だった Web フォントが揃ったときは組み直す。
 *
 * スクリプトが足した枠の印とセルの幅はサーバーの HTML に無いので、水和の食い違いの報告を止める。React は
 * 中の HTML を差し替えないので、足した印と幅は水和のあとも残る。
 */
export default function Prose({ html, className, ...rest }: ProseProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    layoutFrames(root);
    let active = true;
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => {
        if (active) layoutFrames(root);
      });
    }
    let width = root.getBoundingClientRect().width;
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(([entry]) => {
            if (entry.contentRect.width === width) return;
            width = entry.contentRect.width;
            layoutFrames(root);
          });
    observer?.observe(root);
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
      suppressHydrationWarning
    />
  );
}
