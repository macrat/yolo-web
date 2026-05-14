import styles from "./PrivacyBadge.module.css";

/**
 * プライバシー保護の種別。
 * - "local": ブラウザ内で完結する処理（デフォルト文言を提供）
 * - "custom": 呼び出し元が文言を指定する場合
 */
type PrivacyVariant = "local" | "custom";

/** variant ごとのデフォルト文言 */
const DEFAULT_LABELS: Record<PrivacyVariant, string> = {
  local: "処理はブラウザ内で完結します",
  custom: "",
};

interface PrivacyBadgeProps {
  /**
   * プライバシー保護の種別（デフォルト: "local"）
   * - "local": ブラウザ内処理を示すデフォルト文言を使用
   * - "custom": label prop で任意の文言を指定
   */
  variant?: PrivacyVariant;
  /** 表示文言。variant="custom" のときは必須、それ以外は variant のデフォルト文言を上書き */
  label?: string;
  /** 追加クラス */
  className?: string;
}

/**
 * PrivacyBadge — プライバシー保護を 1 行バッジで表示するコンポーネント。
 *
 * ツール本体の近傍に配置し、使い始めの不安を解消する。
 * 詳細な処理方式説明は TrustSection（階層 3）の責務。
 *
 * 設計:
 * - DESIGN.md §2: --accent-soft 背景 + --accent-strong ボーダーのバッジ表現
 * - DESIGN.md §3: アイコンは必要な場合のみ Lucide スタイルの線画
 */
function PrivacyBadge({
  variant = "local",
  label,
  className,
}: PrivacyBadgeProps) {
  const displayLabel = label ?? DEFAULT_LABELS[variant];

  if (!displayLabel) return null;

  return (
    <p
      className={[styles.badge, className].filter(Boolean).join(" ")}
      role="note"
    >
      {/* 鍵アイコン（DESIGN.md §3: Lucide スタイル線画、1.5px stroke） */}
      <svg
        className={styles.icon}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      {displayLabel}
    </p>
  );
}

export default PrivacyBadge;
