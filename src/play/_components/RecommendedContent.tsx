import Link from "next/link";
import { getRecommendedContents } from "@/play/recommendation";
import { getContentPath } from "@/play/paths";
import { resolveDisplayCategory } from "@/play/seo";
import styles from "./RecommendedContent.module.css";

interface RecommendedContentProps {
  currentSlug: string;
}

/**
 * 他カテゴリからおすすめコンテンツ3件を表示するServer Component。
 *
 * - 現在のコンテンツとは異なるカテゴリから各1件を選出
 * - 各カードにアイコン、タイトル（shortTitle優先）、短い説明、カテゴリバッジを表示
 * - レコメンドが0件の場合はnullを返す
 */
export default function RecommendedContent({
  currentSlug,
}: RecommendedContentProps) {
  const recommended = getRecommendedContents(currentSlug);

  if (recommended.length === 0) return null;

  return (
    <nav className={styles.related} aria-label="おすすめコンテンツ">
      <h2 className={styles.heading}>他のジャンルも試してみよう</h2>
      <ul className={styles.list}>
        {recommended.map((content) => (
          <li key={content.slug}>
            <Link href={getContentPath(content)} className={styles.link}>
              <span className={styles.icon} aria-hidden="true">
                {content.icon}
              </span>
              <span className={styles.name}>
                {content.shortTitle ?? content.title}
              </span>
              <span className={styles.description}>
                {content.shortDescription}
              </span>
              <span className={styles.badge} data-category={content.category}>
                {resolveDisplayCategory(content)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
