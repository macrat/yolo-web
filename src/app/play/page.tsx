import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getPlayContentsByCategory } from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getPlayPath, getDailyFortunePath } from "@/play/paths";
import { allQuizMetas } from "@/play/quiz/registry";
import Breadcrumb from "@/components/common/Breadcrumb";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `遊ぶ | ${SITE_NAME}`,
  description:
    "占い・性格診断・知識テスト・ゲームなど全19種のインタラクティブコンテンツが揃う入口。今日の運勢、性格診断、漢字クイズ、パズルゲームをブラウザで無料で楽しめます。",
  keywords: [
    "ゲーム",
    "クイズ",
    "診断",
    "占い",
    "パズル",
    "ブラウザゲーム",
    "無料",
    "インタラクティブ",
  ],
  openGraph: {
    title: `遊ぶ | ${SITE_NAME}`,
    description:
      "占い・性格診断・知識テスト・ゲームなど全19種のコンテンツがブラウザで無料で楽しめます。",
    type: "website",
    url: `${BASE_URL}/play`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `遊ぶ | ${SITE_NAME}`,
    description:
      "占い・性格診断・知識テスト・ゲームなど全19種のコンテンツがブラウザで無料で楽しめます。",
  },
  alternates: {
    canonical: `${BASE_URL}/play`,
  },
};

/** カテゴリの表示順序と日本語ラベルの定義 */
const CATEGORY_DISPLAY_ORDER: Array<{
  category: PlayContentMeta["category"];
  label: string;
}> = [
  { category: "fortune", label: "占い" },
  { category: "personality", label: "性格診断" },
  { category: "knowledge", label: "知識テスト" },
  { category: "game", label: "ゲーム" },
];

/** slug → questionCount のルックアップマップ（クイズの問数表示用） */
const quizQuestionCountBySlug: Map<string, number> = new Map(
  allQuizMetas.map((q) => [q.slug, q.questionCount]),
);

/**
 * コンテンツのリンク先パスを返す。
 * Fortune（daily）は getDailyFortunePath() を使用し、それ以外は getPlayPath(slug) を使用する。
 */
function getContentPath(content: PlayContentMeta): string {
  if (content.contentType === "fortune") {
    return getDailyFortunePath();
  }
  return getPlayPath(content.slug);
}

export default function PlayPage() {
  return (
    <div className={styles.main}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "遊ぶ" }]} />

      {/* ヒーローバナー */}
      <section className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>遊ぶ</h1>
        <p className={styles.heroSubtext}>
          占い・診断・クイズ・ゲームなど、楽しいコンテンツで遊ぼう
        </p>
      </section>

      {/* カテゴリ別セクション一覧 */}
      {CATEGORY_DISPLAY_ORDER.map(({ category, label }) => {
        const contents = getPlayContentsByCategory(category);
        if (contents.length === 0) return null;
        return (
          <section key={category} className={styles.categorySection}>
            <h2 className={styles.categoryHeading}>{label}</h2>
            <ul
              className={styles.grid}
              role="list"
              aria-label={`${label} category contents`}
            >
              {contents.map((content) => {
                const questionCount = quizQuestionCountBySlug.get(content.slug);
                return (
                  <li key={content.slug}>
                    <Link
                      href={getContentPath(content)}
                      className={styles.card}
                      style={
                        {
                          "--play-accent": content.accentColor,
                        } as React.CSSProperties
                      }
                    >
                      <div className={styles.cardIcon}>{content.icon}</div>
                      <h3 className={styles.cardTitle}>{content.title}</h3>
                      <p className={styles.cardDescription}>
                        {content.shortDescription}
                      </p>
                      <div className={styles.cardMeta}>
                        {questionCount !== undefined && (
                          <span className={styles.cardQuestionCount}>
                            {questionCount}問
                          </span>
                        )}
                        <span className={styles.cardCta}>遊ぶ</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
