import { formatDate } from "@/lib/date";
import styles from "./LifecycleSection.module.css";

interface LifecycleSectionProps {
  /** 公開日（ISO 8601 文字列、必須） */
  publishedAt: string;
  /** 更新日（ISO 8601 文字列、任意。指定時は「更新: ...」を併記） */
  updatedAt?: string;
}

/**
 * LifecycleSection — 公開日 / 更新日の表示コンポーネント。
 *
 * 配置はファーストビュー外（below-the-fold）を前提とするが、
 * 配置の制御は呼び出し側（ToolDetailLayout）に委ねる。
 * これにより M1a dislikes 5（解説がファーストビューを占拠する）を構造的に防ぐ。
 *
 * @see docs/tile-and-detail-design.md §3 #7
 */
function LifecycleSection({ publishedAt, updatedAt }: LifecycleSectionProps) {
  const formattedPublished = safeFormatDate(publishedAt);
  const formattedUpdated = updatedAt ? safeFormatDate(updatedAt) : undefined;

  return (
    <div className={styles.lifecycle}>
      <span className={styles.item}>
        <span className={styles.label}>公開: </span>
        <time dateTime={publishedAt}>{formattedPublished}</time>
      </span>
      {formattedUpdated !== undefined && (
        <span className={styles.item}>
          <span className={styles.label}>更新: </span>
          <time dateTime={updatedAt}>{formattedUpdated}</time>
        </span>
      )}
    </div>
  );
}

/**
 * ISO 8601 文字列を日付表示文字列に変換する。
 * 変換に失敗した場合（Invalid Date）は元の文字列をフォールバックとして返す。
 */
function safeFormatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      // 不正な日付文字列の場合は元の文字列を返す
      return isoString;
    }
    return formatDate(isoString);
  } catch {
    return isoString;
  }
}

export default LifecycleSection;
