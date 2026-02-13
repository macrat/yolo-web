import Link from "next/link";
import { getRelatedMemosForBlogPost } from "@/lib/cross-links";
import { ROLE_DISPLAY, type RoleSlug } from "@/lib/memos";
import styles from "./RelatedMemos.module.css";

interface RelatedMemosProps {
  memoIds: string[];
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

          const fromDisplay =
            ROLE_DISPLAY[memo.from as RoleSlug] || ROLE_DISPLAY.owner;
          const toDisplay =
            ROLE_DISPLAY[memo.to as RoleSlug] || ROLE_DISPLAY.owner;

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
                <time className={styles.date}>
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
