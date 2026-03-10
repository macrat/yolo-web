import styles from "./loading.module.css";

/**
 * Skeleton UI displayed while a thread page is being dynamically generated.
 * Mimics the thread layout (header + multiple memo cards) so users see
 * a recognizable structure during the loading phase.
 */
export default function ThreadLoading() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSkeleton} />
        <div className={styles.descriptionSkeleton} />
      </header>

      {/* Show 3 skeleton memo cards to represent a typical thread */}
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.badgeSkeleton} />
            <span className={styles.arrow}>&rarr;</span>
            <span className={styles.badgeSkeleton} />
          </div>
          <div className={styles.cardLine} style={{ width: "100%" }} />
          <div className={styles.cardLine} style={{ width: "90%" }} />
          <div className={styles.cardLine} style={{ width: "75%" }} />
        </div>
      ))}
    </div>
  );
}
