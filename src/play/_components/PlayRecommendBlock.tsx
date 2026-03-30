import Link from "next/link";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import { resolveDisplayCategory } from "@/play/seo";
import { quizQuestionCountBySlug, DAILY_UPDATE_SLUGS } from "@/play/registry";
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
 * カードに表示するコスト感情報を返す。
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
 * 記事・辞典ページ向けの関連コンテンツ推薦ブロック（Server Component）。
 *
 * - 推薦リストが空の場合は null を返す
 * - 各カードに accentColor を左ボーダーとして使用し、視覚的なアクセントを加える
 * - heading prop で呼び出し元に応じた見出しテキストを設定できる
 * - subtext prop で呼び出し元に応じたサブテキストを設定できる
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
          <li key={content.slug}>
            <Link
              href={getContentPath(content)}
              className={styles.card}
              style={{ borderLeftColor: content.accentColor }}
            >
              <span className={styles.icon} aria-hidden="true">
                {content.icon}
              </span>
              <div className={styles.cardBody}>
                <span className={styles.title}>
                  {content.shortTitle ?? content.title}
                </span>
                <span className={styles.meta}>{getMetaText(content)}</span>
                <span className={styles.description}>
                  {content.shortDescription}
                </span>
                <span className={styles.cta}>
                  {getCtaText(content.category)} →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
