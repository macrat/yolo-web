import type { ComponentPropsWithoutRef, ElementType } from "react";
import styles from "./Panel.module.css";

type PanelTag = "section" | "div" | "article" | "aside" | "nav";

interface PanelOwnProps<T extends PanelTag = "section"> {
  /** レンダリングする HTML タグ（デフォルト: "section"） */
  as?: T;
  /** 子要素 */
  children: React.ReactNode;
  /** 追加クラス */
  className?: string;
  /**
   * パネルの表示バリアント。
   * - "default": 背景・枠線・パディングを持つ標準パネル（デフォルト）。
   * - "transparent": 背景・枠線・パディングを持たない透明パネル。
   *   記事本文などコンテンツ自身が縦余白を管理する場合に使う（DESIGN.md §1 適合、cycle-187 D4）。
   */
  variant?: "default" | "transparent";
}

type PanelProps<T extends PanelTag = "section"> = PanelOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof PanelOwnProps<T>>;

/**
 * Panel — 矩形コンテナの汎用ラッパー。
 *
 * DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される。
 * DESIGN.md §4: パネルは入れ子にしない。パネルには影をつけない。
 */
function Panel<T extends PanelTag = "section">({
  as,
  children,
  className,
  variant = "default",
  ...rest
}: PanelProps<T>) {
  const Tag = (as ?? "section") as ElementType;
  const combinedClassName = [
    styles.panel,
    variant === "transparent" ? styles.transparent : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={combinedClassName} {...rest}>
      {children}
    </Tag>
  );
}

export default Panel;
