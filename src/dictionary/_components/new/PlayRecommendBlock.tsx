import ItemList, {
  type ItemListFact,
  type ItemListItem,
} from "@/components/ItemList";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import { resolveDisplayCategory } from "@/play/seo";
import { quizQuestionCountBySlug, DAILY_UPDATE_SLUGS } from "@/play/registry";
import styles from "./PlayRecommendBlock.module.css";

interface PlayRecommendBlockProps {
  recommendations: PlayContentMeta[];
}

const HEADING_ID = "play-recommend";

/** 遊びを選ぶ手がかりになる短い値。毎日変わるものか、クイズの問題の数。 */
function getFacts(content: PlayContentMeta): ItemListFact[] {
  const facts: ItemListFact[] = [];
  if (DAILY_UPDATE_SLUGS.has(content.slug)) {
    facts.push({ text: "毎日更新" });
  }
  if (content.contentType === "quiz") {
    const questionCount = quizQuestionCountBySlug.get(content.slug);
    if (questionCount !== undefined) {
      facts.push({ text: `全${questionCount}問` });
    }
  }
  return facts;
}

/**
 * 辞典の詳細のページの末尾に置く、遊びのおすすめ。行は名前・説明・種別（運勢・診断・クイズ・パズル）と、
 * 「毎日更新」「全N問」の補助情報。おすすめが無いときは何も描かない。
 */
export default function PlayRecommendBlock({
  recommendations,
}: PlayRecommendBlockProps) {
  if (recommendations.length === 0) return null;

  const items: ItemListItem[] = recommendations.map((content) => ({
    name: content.shortTitle ?? content.title,
    href: getContentPath(content),
    description: content.shortDescription,
    kind: resolveDisplayCategory(content),
    facts: getFacts(content),
  }));

  return (
    <section className={styles.container}>
      <h2 id={HEADING_ID} className={styles.heading}>
        こちらもおすすめ
      </h2>
      <p className={styles.subtext}>ブラウザで今すぐ遊べる無料コンテンツ</p>
      <ItemList labelledBy={HEADING_ID} items={items} />
    </section>
  );
}
