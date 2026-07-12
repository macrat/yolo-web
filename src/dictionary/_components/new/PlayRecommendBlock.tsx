import Link from "next/link";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import { resolveDisplayCategory } from "@/play/seo";
import { quizQuestionCountBySlug, DAILY_UPDATE_SLUGS } from "@/play/registry";
import { NefudaGroup } from "@/components/Nefuda";
import styles from "./PlayRecommendBlock.module.css";

interface PlayRecommendBlockProps {
  recommendations: PlayContentMeta[];
  /**
   * セクション見出しテキスト。
   * - ブログ記事では "この記事を読んだあなたに" など文脈に合わせて指定する
   * - 省略した場合は "こちらもおすすめ"（汎用デフォルト）を使用する
   */
  heading?: string;
  /**
   * 見出し下のサブテキスト。
   * - ブログ記事では "ブラウザで今すぐ遊べる診断・占い" など文脈に合わせて指定する
   * - 省略した場合は "ブラウザで今すぐ遊べる無料コンテンツ"（汎用デフォルト）を使用する
   */
  subtext?: string;
}

/**
 * カテゴリに応じたCTAテキストを返す。
 */
function getCtaText(category: PlayContentMeta["category"]): string {
  switch (category) {
    case "fortune":
      return "占ってみる";
    case "personality":
      return "診断してみる";
    case "knowledge":
      return "挑戦してみる";
    case "game":
      return "遊んでみる";
  }
}

/**
 * 値札に表示するコスト感情報を返す。
 *
 * 評価順序:
 * 1. DAILY_UPDATE_SLUGS に含まれる → 「毎日更新」
 * 2. contentType === "quiz" で問数あり → 「全X問」
 * 3. それ以外 → resolveDisplayCategory の結果
 */
function getMetaText(content: PlayContentMeta): string {
  if (DAILY_UPDATE_SLUGS.has(content.slug)) {
    return "毎日更新";
  }
  if (content.contentType === "quiz") {
    const questionCount = quizQuestionCountBySlug.get(content.slug);
    if (questionCount !== undefined) {
      return `全${questionCount}問`;
    }
  }
  return resolveDisplayCategory(content);
}

/**
 * 記事・辞典ページ向けの関連コンテンツ回遊ブロック（Server Component / (new) デザイン体系版）。
 *
 * フェーズ R で「色付き左罫のカード＋絵文字アイコン」（§8-3 違反）を撤去し、DESIGN.md §4 の
 * 「品書き（罫区切りのリスト）」の流儀へ変換した。各行 = 品名（明朝リンク）＋ひとこと＋
 * 値札（毎日更新／全X問など・{@link NefudaGroup} 再利用）＋「遊んでみる →」等の朱リンク文言。
 * 器は静かに保ち（背景色・カード装飾なし）、見出し「こちらもおすすめ」は明朝・墨（§3）。
 *
 * - 推薦リストが空の場合は null を返す
 * - 行全体を 1 本のリンクにして大きいタップ領域を確保する（重複リンクを避ける）
 * - heading / subtext prop で呼び出し元に応じたテキストを設定できる
 */
export default function PlayRecommendBlock({
  recommendations,
  heading = "こちらもおすすめ",
  subtext = "ブラウザで今すぐ遊べる無料コンテンツ",
}: PlayRecommendBlockProps) {
  if (recommendations.length === 0) return null;

  return (
    <nav aria-label="関連する占い・診断" className={styles.container}>
      <h2 className={styles.heading}>{heading}</h2>
      <p className={styles.subtext}>{subtext}</p>
      <ul className={styles.list}>
        {recommendations.map((content) => (
          <li key={content.slug} className={styles.row}>
            <Link href={getContentPath(content)} className={styles.card}>
              <span className={styles.head}>
                <span className={styles.title}>
                  {content.shortTitle ?? content.title}
                </span>
                {/* 値札（毎日更新／全X問など）。getMetaText は常に非空を返す。 */}
                <NefudaGroup labels={[getMetaText(content)]} />
              </span>
              <span className={styles.description}>
                {content.shortDescription}
              </span>
              <span className={styles.cta}>
                {getCtaText(content.category)} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
