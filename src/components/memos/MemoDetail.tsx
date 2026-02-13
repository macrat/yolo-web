import Link from "next/link";
import type { PublicMemo } from "@/lib/memos-shared";
import RoleBadge from "./RoleBadge";
import styles from "./MemoDetail.module.css";

interface MemoDetailProps {
  memo: PublicMemo;
}

export default function MemoDetail({ memo }: MemoDetailProps) {
  return (
    <article className={styles.detail}>
      <header className={styles.header}>
        <div className={styles.roles}>
          <RoleBadge role={memo.from} />
          <span className={styles.arrow}>&rarr;</span>
          <RoleBadge role={memo.to} />
        </div>
        <h1 className={styles.subject}>{memo.subject}</h1>
        <div className={styles.meta}>
          <time dateTime={memo.created_at}>{memo.created_at}</time>
          {memo.reply_to && <span className={styles.replyInfo}>返信メモ</span>}
        </div>
        {memo.tags.length > 0 && (
          <ul className={styles.tags}>
            {memo.tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      {memo.replyCount > 1 && (
        <div className={styles.threadBanner}>
          このメモはスレッドの一部です。
          <Link
            href={`/memos/thread/${memo.threadRootId}`}
            className={styles.threadLink}
          >
            スレッド全体を見る ({memo.replyCount}件)
          </Link>
        </div>
      )}

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: memo.contentHtml }}
      />
    </article>
  );
}
