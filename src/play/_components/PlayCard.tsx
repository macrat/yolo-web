import Link from "next/link";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import { playCategoryLabelMap } from "./categoryLabels";
import styles from "./PlayCard.module.css";

interface PlayCardProps {
  content: PlayContentMeta;
  /** このコンテンツが新着かどうか（呼び出し元の Server Component で判定） */
  isNew?: boolean;
  /** このコンテンツが毎日更新かどうか（DAILY_UPDATE_SLUGS による） */
  isDaily?: boolean;
}

/**
 * /play 一覧ページ専用のコンテンツカード。
 *
 * 設計方針:
 * - 絵文字・accentColor ベースの装飾色を完全廃止（DESIGN.md §3）
 * - Panel + タイポグラフィのみでカード識別性を担保
 * - カード全体をリンク化（動詞 CTA・「→」記号は廃止）
 * - 等高設計: height: 100%; box-sizing: border-box（cycle-181 R3-1）
 * - badges 行に min-height でバッジ有無による見出し位置ズレを防止（cycle-181 R3-4）
 *
 * このコンポーネントは /play 一覧専用。
 * 詳細ページの関連表示には PlayRecommendBlock / RecommendedContent を使う。
 */
export default function PlayCard({ content, isNew, isDaily }: PlayCardProps) {
  const displayTitle = content.shortTitle ?? content.title;
  const categoryLabel = playCategoryLabelMap[content.category];

  return (
    <Link href={getContentPath(content)} className={styles.card}>
      {/* バッジ行: min-height でバッジ有無による見出し位置ズレを防止 */}
      <div className={styles.badges}>
        <span className={styles.category}>{categoryLabel}</span>
        {isNew && <span className={styles.newBadge}>NEW</span>}
        {isDaily && <span className={styles.dailyBadge}>毎日更新</span>}
      </div>
      <h2 className={styles.name}>{displayTitle}</h2>
      <p className={styles.description}>{content.shortDescription}</p>
    </Link>
  );
}
