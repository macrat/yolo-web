import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import { MEMO_TRUST_LEVEL, MEMO_TRUST_NOTE } from "@/lib/trust-levels";
import styles from "./layout.module.css";

export default function MemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={styles.badgeContainer}>
        <TrustLevelBadge level={MEMO_TRUST_LEVEL} note={MEMO_TRUST_NOTE} />
      </div>
      {children}
    </>
  );
}
