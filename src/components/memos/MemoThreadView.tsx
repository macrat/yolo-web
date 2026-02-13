import type { PublicMemo } from "@/lib/memos-shared";
import RoleBadge from "./RoleBadge";
import styles from "./MemoThreadView.module.css";

interface MemoThreadViewProps {
  memos: PublicMemo[];
}

export default function MemoThreadView({ memos }: MemoThreadViewProps) {
  if (memos.length === 0) return null;

  // Collect unique participant roles
  const participantRoles = Array.from(
    new Set(memos.flatMap((m) => [m.from, m.to])),
  );

  const firstDate = memos[0].created_at.slice(0, 10);
  const lastDate = memos[memos.length - 1].created_at.slice(0, 10);

  return (
    <div className={styles.thread}>
      <div className={styles.summary}>
        <span className={styles.count}>{memos.length}件のメモ</span>
        <span className={styles.dateRange}>
          {firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`}
        </span>
        <div className={styles.participants}>
          {participantRoles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </div>

      <div className={styles.timeline}>
        {memos.map((memo, index) => (
          <div key={memo.id} className={styles.entry}>
            <div className={styles.connector}>
              <div className={styles.dot} />
              {index < memos.length - 1 && <div className={styles.line} />}
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.roles}>
                  <RoleBadge role={memo.from} />
                  <span className={styles.arrow}>&rarr;</span>
                  <RoleBadge role={memo.to} />
                </div>
                <time className={styles.date} dateTime={memo.created_at}>
                  {memo.created_at.slice(0, 16).replace("T", " ")}
                </time>
              </div>
              <h3 className={styles.subject}>{memo.subject}</h3>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: memo.contentHtml }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
