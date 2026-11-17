"use client";

import { useEffect, useRef } from "react";
import PaginationNav from "./PaginationNav";
import styles from "./Pagination.module.css";

interface PaginationButtonsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** button モードのページ送り。押した項目が消えたときにフォーカスを戻すので、クライアントで動く。 */
export default function PaginationButtons({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationButtonsProps) {
  const navRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef(false);

  // 押した項目が次の描画で消えたら（端に着いた「前へ」「次へ」）、フォーカスをいまのページに移す。
  // そのままでは body に落ち、キーボードの利用者が並びの中の居場所を失う。
  useEffect(() => {
    if (!restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    const nav = navRef.current;
    if (!nav || nav.contains(document.activeElement)) return;
    // いまのページは番号の並びと狭い画面の表示の2か所にあるので、見えているほうに移す。
    const candidates = Array.from(
      nav.querySelectorAll<HTMLElement>("[data-focus-fallback]"),
    );
    const fallback =
      candidates.find((el) => el.getClientRects().length > 0) ?? candidates[0];
    fallback?.focus();
  }, [currentPage]);

  return (
    <PaginationNav
      currentPage={currentPage}
      totalPages={totalPages}
      navRef={navRef}
      indicatorFocusable
      renderItem={({ page, label, ariaLabel, isCurrent }) => (
        <button
          type="button"
          className={styles.pageItem}
          data-text-box="inline"
          aria-label={ariaLabel}
          aria-current={isCurrent ? "page" : undefined}
          data-focus-fallback={isCurrent ? "" : undefined}
          onClick={() => {
            restoreFocusRef.current = true;
            onPageChange(page);
          }}
        >
          {label}
        </button>
      )}
    />
  );
}
