"use client";

import { useState, useId } from "react";
import ChevronDown from "@/components/icons/ChevronDown";
import styles from "./AccordionItem.module.css";

interface AccordionItemProps {
  /** 見出し文字列（必須） */
  title: string;
  /** 折りたたみ内容（必須） */
  children: React.ReactNode;
  /** 初期状態（デフォルト: false = 閉じた状態） */
  defaultOpen?: boolean;
}

/**
 * AccordionItem — 開閉可能なセクション。
 *
 * `<details>` 直書きを避け、アクセシブルな開閉 UI を提供する。
 * focus 管理 / aria 属性の制御性 / 開閉トリガーのスタイリング統一を保証する。
 *
 * 内部実装: `<button aria-expanded>` + `<div role="region">` 方式を採用。
 * - キーボード操作（Space / Enter）はネイティブ button のデフォルト動作で対応
 * - aria-expanded / aria-controls / aria-labelledby を明示
 *
 * DESIGN.md §5: src/components/ のコンポーネントを使う。
 */
function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // useId で一意な ID を生成（同一ページに複数配置しても衝突しない）
  const uid = useId();
  const triggerId = `accordion-trigger-${uid}`;
  const regionId = `accordion-region-${uid}`;

  function handleToggle(): void {
    setIsOpen((prev) => !prev);
  }

  return (
    <div className={styles.accordionItem}>
      <button
        id={triggerId}
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={regionId}
        onClick={handleToggle}
      >
        <span className={styles.triggerTitle}>{title}</span>
        <ChevronDown
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      {/*
       * role="region" は landmark として支援技術に認識される。
       * WAI-ARIA APG の Accordion パターン上の注意: 同一ページに 6 件を超える
       * AccordionItem を配置する場合は landmark proliferation を避けるため
       * role を外すことを検討すること。
       */}
      <div
        id={regionId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className={styles.region}
      >
        {children}
      </div>
    </div>
  );
}

export default AccordionItem;
