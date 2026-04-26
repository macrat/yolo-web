/**
 * Panel — 汎用パネル部品
 *
 * ## 用途
 * ツールの作業領域・コンテンツのまとまりを視覚的にグループ化する構造部品。
 * 白い背景＋細い枠線という最小限の表現で「ここは一つのまとまり」を伝える。
 *
 * ## 使う場面
 * - ツールの入出力エリアを囲う（例: テキストエリア + 結果表示のセット）
 * - ページ内で独立したコンテンツブロックを示す
 * - ArticleArea の main slot として渡す子要素の外枠
 *
 * ## 使わない場面
 * - shadow-lg を使いたい場面には使わない（philosophy.md NEVER:
 *   「ダイアログ・ポップオーバー・カードに影を使う」は禁止）
 * - ヘッダーやフッターのような Chrome 要素には使わない（SiteHeader / SiteFooter を使う）
 * - テキストのみのセクション区切りには使わない（SectionHead を使う）
 *
 * ## variant
 * - `default`: 白背景 + border（標準）
 * - `flush`:  padding なし（内側に独自 padding を持つ子要素のとき）
 * - `inset`:  背景が沈む（bg-soft）。ページ背景として使う
 */

import type { ElementType, ReactNode, HTMLAttributes } from "react";
import styles from "./Panel.module.css";

/** パネルの外観バリアント */
export type PanelVariant = "default" | "flush" | "inset";

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  /**
   * 外観バリアント。
   * - `default`: 白背景 + border（標準）
   * - `flush`: padding なし
   * - `inset`: 沈んだ背景（bg-soft）
   * @default "default"
   */
  variant?: PanelVariant;
  /**
   * レンダリングする HTML 要素。
   * セマンティクスに応じて `div` / `section` / `article` を選ぶ。
   * @default "div"
   */
  as?: ElementType;
  children: ReactNode;
}

/**
 * 汎用パネル。白背景＋細い枠線でコンテンツをグループ化する。
 * shadow は使わない（philosophy.md NEVER 節準拠）。
 */
export default function Panel({
  variant = "default",
  as: Component = "div",
  children,
  className,
  ...rest
}: PanelProps) {
  const classNames = [styles.panel, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classNames} data-variant={variant} {...rest}>
      {children}
    </Component>
  );
}
