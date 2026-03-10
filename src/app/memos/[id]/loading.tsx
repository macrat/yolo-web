import styles from "./loading.module.css";

/**
 * Skeleton UI displayed while a memo page is being dynamically generated.
 * Mimics the layout of MemoDetail (role badges, subject, meta, content area)
 * so the user sees a recognizable structure during the loading phase.
 */
export default function MemoLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <span className={styles.skeletonInline} />
      </div>

      <article className={styles.detail}>
        <header className={styles.header}>
          {/* Role badges skeleton */}
          <div className={styles.roles}>
            <span className={styles.badgeSkeleton} />
            <span className={styles.arrow}>&rarr;</span>
            <span className={styles.badgeSkeleton} />
          </div>

          {/* Subject line skeleton */}
          <div className={styles.subjectSkeleton} />

          {/* Meta (date) skeleton */}
          <div className={styles.metaSkeleton} />

          {/* Tags skeleton */}
          <div className={styles.tagsSkeleton}>
            <span className={styles.tagSkeleton} />
            <span className={styles.tagSkeleton} />
          </div>
        </header>

        {/* Content body skeleton */}
        <div className={styles.contentSkeleton}>
          <div className={styles.line} style={{ width: "100%" }} />
          <div className={styles.line} style={{ width: "95%" }} />
          <div className={styles.line} style={{ width: "88%" }} />
          <div className={styles.line} style={{ width: "92%" }} />
          <div className={styles.line} style={{ width: "60%" }} />
          <div className={styles.lineGap} />
          <div className={styles.line} style={{ width: "100%" }} />
          <div className={styles.line} style={{ width: "85%" }} />
          <div className={styles.line} style={{ width: "90%" }} />
          <div className={styles.line} style={{ width: "70%" }} />
        </div>
      </article>
    </div>
  );
}
