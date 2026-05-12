import type { ComponentPropsWithoutRef, ElementType } from "react";
import styles from "./Panel.module.css";

type PanelTag = "section" | "div" | "article" | "aside";

interface PanelOwnProps<T extends PanelTag = "section"> {
  /** レンダリングする HTML タグ（デフォルト: "section"） */
  as?: T;
  /** 子要素 */
  children: React.ReactNode;
  /** 追加クラス */
  className?: string;
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
  ...rest
}: PanelProps<T>) {
  const Tag = (as ?? "section") as ElementType;
  const combinedClassName = [styles.panel, className].filter(Boolean).join(" ");

  return (
    <Tag className={combinedClassName} {...rest}>
      {children}
    </Tag>
  );
}

export default Panel;
