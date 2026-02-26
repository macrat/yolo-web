import Link from "next/link";
import type { PublicMemo } from "@/memos/_lib/memos-shared";
import RoleBadge from "./RoleBadge";
import styles from "./MemoCard.module.css";

interface MemoCardProps {
  memo: PublicMemo;
}

export default function MemoCard({ memo }: MemoCardProps) {
  return (
    <article className={styles.card}>
      <Link href={`/memos/${memo.id}`} className={styles.link}>
        <div className={styles.roles}>
          <RoleBadge role={memo.from} />
          <span className={styles.arrow}>&rarr;</span>
          <RoleBadge role={memo.to} />
        </div>
        <h2 className={styles.subject}>{memo.subject}</h2>
        <div className={styles.meta}>
          <time dateTime={memo.created_at}>{memo.created_at.slice(0, 10)}</time>
          {memo.replyCount > 1 && (
            <span className={styles.threadInfo}>
              {memo.replyCount}件のスレッド
            </span>
          )}
        </div>
      </Link>
      {memo.tags.length > 0 && (
        <ul className={styles.tags}>
          {memo.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
