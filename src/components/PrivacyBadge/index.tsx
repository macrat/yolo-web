import type { SVGProps } from "react";
import styles from "./PrivacyBadge.module.css";

interface PrivacyBadgeProps {
  /** 追加クラス名 */
  className?: string;
}

/**
 * ShieldIcon — プライバシーを示す盾アイコン（Lucide 互換）。
 * DESIGN.md §3: strokeWidth 1.5px、16px サイズ。
 */
function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/**
 * PrivacyBadge — 「ブラウザ内で完結」表記バッジ。
 *
 * 責務: 入力データが外部に送信されないことをユーザーに伝える。
 * M1a likes 4（外部送信への不安解消）に直結。TrustSection 内で使用される。
 *
 * DESIGN.md §2: --accent-soft を背景、--accent-strong をボーダーに使用。
 * DESIGN.md §4: パネルに収まる想定のバッジ。影なし。
 * DESIGN.md §5: src/components/ のトークン体系を使用。
 */
export default function PrivacyBadge({ className }: PrivacyBadgeProps) {
  const combinedClassName = [styles.badge, className].filter(Boolean).join(" ");

  return (
    <p className={combinedClassName}>
      <ShieldIcon className={styles.icon} />
      <span>
        このツールはブラウザ内で完結します。入力データは外部に送信されません。
      </span>
    </p>
  );
}
