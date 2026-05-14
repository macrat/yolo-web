"use client";

import { useState, useSyncExternalStore, type SyntheticEvent } from "react";
import TableOfContents, { type Heading } from "./TableOfContents";
import styles from "./CollapsibleTOC.module.css";

interface CollapsibleTOCProps {
  headings: Heading[];
}

// デスクトップとモバイルの境界。page.module.css の Grid 切り替えと一致。
const DESKTOP_BREAKPOINT_PX = 1024;
const DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_BREAKPOINT_PX}px)`;

function subscribeMediaQuery(callback: () => void): () => void {
  const mq = window.matchMedia(DESKTOP_MEDIA_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getDesktopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

// SSR では「デスクトップ既定（TOC 開）」を採用。HTML に open 属性が含まれ、
// ノーJS / クローラーでも TOC リンクが利用可能になる。
function getDesktopServerSnapshot(): boolean {
  return true;
}

/**
 * CollapsibleTOC — 開閉可能な目次。
 *
 * 既定状態:
 *   - デスクトップ（≥ 1024px）: 開
 *   - モバイル（< 1024px）: 閉（長文記事で本文が画面外に押し出されないため）
 *
 * 来訪者が明示的にトグルした場合はその選択を保持し、viewport 変更で上書きしない。
 * useSyncExternalStore は SSR と hydration を整合させるため、ハイドレーション後に
 * クライアント実画面の幅で再評価される（モバイル幅では一瞬の flash が発生するが、
 * SSR HTML には TOC リンクが含まれるため検索エンジン / ノーJS 来訪者に常時利用可能）。
 *
 * 折りたたみ時、親 .articleBody は CSS `:has(aside details:not([open]))` で
 * Grid を `1fr auto` に切り替え、本文が右へ広がる（ハンバーガーサイドバー風）。
 */
export default function CollapsibleTOC({ headings }: CollapsibleTOCProps) {
  const isDesktop = useSyncExternalStore(
    subscribeMediaQuery,
    getDesktopSnapshot,
    getDesktopServerSnapshot,
  );
  // 来訪者の明示的なトグル選択。null の間は viewport の既定値に従う。
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? isDesktop;

  if (headings.length === 0) return null;

  const handleToggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    setUserOpen(e.currentTarget.open);
  };

  return (
    <details className={styles.tocDetails} open={open} onToggle={handleToggle}>
      <summary className={styles.tocSummary}>
        <span>目次</span>
        <svg
          className={styles.tocChevron}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className={styles.tocBody}>
        <TableOfContents headings={headings} />
      </div>
    </details>
  );
}
