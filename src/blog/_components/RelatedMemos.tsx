import Link from "next/link";
import { getRelatedMemosForBlogPost } from "@/lib/cross-links";
import {
  ROLE_DISPLAY,
  capitalize,
  type RoleSlug,
  type RoleDisplay,
} from "@/memos/_lib/memos-shared";
import styles from "./RelatedMemos.module.css";

interface RelatedMemosProps {
  memoIds: string[];
}

function getRoleDisplay(role: string): RoleDisplay {
  return (
    ROLE_DISPLAY[role as RoleSlug] ?? {
      label: capitalize(role),
      color: "#6b7280",
      icon: "user",
    }
  );
}

export default function RelatedMemos({ memoIds }: RelatedMemosProps) {
  if (memoIds.length === 0) return null;

  const memos = getRelatedMemosForBlogPost(memoIds);

  // Check if any memos resolved
  const hasAny = memos.some((m) => m !== null);
  if (!hasAny && memos.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>関連メモ</h2>
      <ul className={styles.list}>
        {memos.map((memo, index) => {
          if (memo === null) {
            // M11: Non-public or non-existent memo rendered as plain text
            return (
              <li key={memoIds[index]} className={styles.item}>
                <span className={styles.private}>
                  メモ {memoIds[index]} (非公開)
                </span>
              </li>
            );
          }

          const fromDisplay = getRoleDisplay(memo.from);
          const toDisplay = getRoleDisplay(memo.to);

          return (
            <li key={memo.id} className={styles.item}>
              <Link href={`/memos/${memo.id}`} className={styles.link}>
                <span
                  className={styles.role}
                  style={{ color: fromDisplay.color }}
                >
                  {fromDisplay.label}
                </span>
                <span className={styles.arrow}>&rarr;</span>
                <span
                  className={styles.role}
                  style={{ color: toDisplay.color }}
                >
                  {toDisplay.label}
                </span>
                <span className={styles.subject}>{memo.subject}</span>
                <time
                  className={styles.date}
                  dateTime={memo.created_at.slice(0, 10)}
                >
                  {memo.created_at.slice(0, 10)}
                </time>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
