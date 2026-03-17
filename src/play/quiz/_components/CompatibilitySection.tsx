"use client";

import type { CompatibilityEntry } from "@/play/quiz/types";
import ShareButtons from "./ShareButtons";
import styles from "./CompatibilitySection.module.css";

interface TypeInfo {
  id: string;
  title: string;
  icon?: string;
}

interface CompatibilitySectionProps {
  /** The current user's type */
  myType: TypeInfo;
  /** The referrer's (friend's) type */
  friendType: TypeInfo;
  /** Compatibility data for this pair */
  compatibility: CompatibilityEntry;
  /** Quiz title for share text */
  quizTitle: string;
  /** Quiz slug for share URL */
  quizSlug: string;
}

/**
 * Displays the compatibility result between two personality types.
 * Shown after quiz completion when a referrer type is present.
 */
export default function CompatibilitySection({
  myType,
  friendType,
  compatibility,
  quizTitle,
  quizSlug,
}: CompatibilitySectionProps) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/${quizSlug}/result/${myType.id}?with=${friendType.id}`
      : `/play/${quizSlug}/result/${myType.id}?with=${friendType.id}`;

  const hashtag = quizTitle.replace(/\s/g, "");
  const shareText = `私は「${myType.title}」、友達は「${friendType.title}」。相性は「${compatibility.label}」でした! #${hashtag} #yolosnet`;

  return (
    <div className={styles.section}>
      <p className={styles.heading}>友達との相性結果</p>
      <div className={styles.typeIcons}>
        <div className={styles.typeBox}>
          {myType.icon && (
            <span className={styles.typeIcon}>{myType.icon}</span>
          )}
          <span className={styles.typeName}>{myType.title}</span>
        </div>
        <span className={styles.separator}>&times;</span>
        <div className={styles.typeBox}>
          {friendType.icon && (
            <span className={styles.typeIcon}>{friendType.icon}</span>
          )}
          <span className={styles.typeName}>{friendType.title}</span>
        </div>
      </div>
      <h3 className={styles.label}>{compatibility.label}</h3>
      <p className={styles.description}>{compatibility.description}</p>
      <ShareButtons
        shareText={shareText}
        shareUrl={shareUrl}
        quizTitle={quizTitle}
        contentType="diagnosis"
        contentId={`quiz-${quizSlug}`}
      />
    </div>
  );
}
