import Link from "next/link";
import { getPlayContentsByCategory } from "@/play/registry";
import { getPlayPath } from "@/play/paths";
import type { PlayContentMeta } from "@/play/types";
import styles from "./RelatedQuizzes.module.css";

/** 関連クイズとして表示する最大件数 */
const MAX_RELATED_COUNT = 3;

interface RelatedQuizzesProps {
  currentSlug: string;
  category: PlayContentMeta["category"];
}

/**
 * 同カテゴリの関連クイズ・診断へのリンクを表示するコンポーネント。
 *
 * - 同カテゴリのコンテンツをレジストリの定義順で取得
 * - currentSlug と一致するものを除外
 * - 最大 MAX_RELATED_COUNT 件を表示
 * - 関連コンテンツが存在しない場合は null を返す
 */
export default function RelatedQuizzes({
  currentSlug,
  category,
}: RelatedQuizzesProps) {
  const relatedContents = getPlayContentsByCategory(category)
    .filter((content) => content.slug !== currentSlug)
    .slice(0, MAX_RELATED_COUNT);

  if (relatedContents.length === 0) return null;

  return (
    <nav className={styles.related} aria-label="関連コンテンツ">
      <h2 className={styles.heading}>他のクイズ・診断も試してみよう</h2>
      <ul className={styles.list}>
        {relatedContents.map((content) => (
          <li key={content.slug}>
            <Link href={getPlayPath(content.slug)} className={styles.link}>
              <span className={styles.icon} aria-hidden="true">
                {content.icon}
              </span>
              <span className={styles.name}>
                {content.shortTitle ?? content.title}
              </span>
              <span className={styles.description}>
                {content.shortDescription}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
