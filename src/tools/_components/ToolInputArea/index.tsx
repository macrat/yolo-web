import styles from "./ToolInputArea.module.css";

interface ToolInputAreaProps {
  /**
   * 入力要素（必須）。Input / Button / ToggleSwitch 等を渡す。
   * 44px タップターゲットは Button/Input 本体で達成済み（cycle-193 案 10-α）。
   * wrapper 側では min-height を強制しない（AP-I02 同型ハック禁止）。
   */
  children: React.ReactNode;
  /** 追加 CSS クラス（任意） */
  className?: string;
}

/**
 * ToolInputArea — 入力欄ラッパー。
 *
 * Input / Button / ToggleSwitch 等の入力要素を内包する layout コンテナ。
 * spacing / alignment を提供するが、44px タップターゲットは Button/Input
 * 本体が担保しているため wrapper で min-height を強制しない。
 *
 * 配置先: src/tools/_components/ToolInputArea/（ツール詳細ページ専用）
 * DESIGN.md §1: Panel に収まる前提
 * DESIGN.md §5: 子コンポーネントは src/components/ のものを使う
 *
 * @see docs/tile-and-detail-design.md §3 #8
 */
function ToolInputArea({ children, className }: ToolInputAreaProps) {
  const classNames = [styles.wrapper, className].filter(Boolean).join(" ");

  return <div className={classNames}>{children}</div>;
}

export default ToolInputArea;
