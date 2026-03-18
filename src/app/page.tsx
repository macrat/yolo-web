import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/date";
import { getAllBlogPosts } from "@/blog/_lib/blog";
import { allQuizMetas } from "@/play/quiz/registry";
import { allGameMetas } from "@/play/games/registry";
import { allPlayContents } from "@/play/registry";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "占い・性格診断・クイズ・パズルゲームなど多彩なインタラクティブコンテンツが揃う占い・診断パーク。AIが毎日更新する運勢・診断を無料でお楽しみいただけます。",
  openGraph: {
    title: SITE_NAME,
    description:
      "占い・性格診断・クイズ・パズルゲームなど多彩なインタラクティブコンテンツが揃う占い・診断パーク。",
    type: "website",
    url: BASE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "占い・性格診断・クイズ・パズルゲームなど多彩なインタラクティブコンテンツが揃う占い・診断パーク。",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

/** ヒーローセクションのバッジ定義 */
const HERO_BADGES = [
  { label: "毎日更新", icon: "\u{1F504}", href: null },
  { label: "完全無料", icon: "\u{1F4B0}", href: null },
] as const;

export default function Home() {
  const recentPosts = getAllBlogPosts().slice(0, 3);

  return (
    <div className={styles.main}>
      {/* セクション1: ヒーロー — 占い・診断パークのコンセプトを前面に出す */}
      <section className={styles.hero}>
        {/* 装飾的な背景絵文字（占い・診断テーマ） */}
        <span className={styles.heroDeco1} aria-hidden="true">
          🔮
        </span>
        <span className={styles.heroDeco2} aria-hidden="true">
          🃏
        </span>
        <span className={styles.heroDeco3} aria-hidden="true">
          ✨
        </span>
        <span className={styles.heroDeco4} aria-hidden="true">
          🎴
        </span>

        <h1 className={styles.heroTitle}>yolos.net</h1>
        <p className={styles.heroSubtitle}>
          笑える占い・診断で、あなたの意外な一面を発見しよう
        </p>

        {/* AI運営の透明性（constitution.md Rule 3） */}
        <p className={styles.heroAiNotice}>
          AIが企画・運営する占い・診断の実験サイトです
        </p>

        {/* メインCTA */}
        <Link href="/play" className={styles.heroCta}>
          今すぐ遊ぶ
        </Link>

        {/* 統計・特徴バッジ群 */}
        <div className={styles.badges}>
          {/* コンテンツ総数バッジ（/play へのリンク） */}
          <Link href="/play" className={styles.badge}>
            <span className={styles.badgeIcon}>🎮</span>
            {allPlayContents.length}種の占い・診断・ゲーム
          </Link>
          {HERO_BADGES.map((badge) => (
            <span key={badge.label} className={styles.badgeStatic}>
              <span className={styles.badgeIcon}>{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>
      </section>

      {/* セクション2: 今日のデイリーパズル */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>今日のデイリーパズル</h2>
        <p className={styles.sectionDescription}>
          毎日更新される{allGameMetas.length}つのパズルに挑戦しよう
        </p>
        <div className={styles.gamesGrid}>
          {allGameMetas.map((game) => (
            <Link
              key={game.slug}
              href={`/play/${game.slug}`}
              className={styles.gameCard}
              style={
                {
                  "--game-accent": game.accentColor,
                } as React.CSSProperties
              }
            >
              <span className={styles.gameCardIcon}>{game.icon}</span>
              <h3 className={styles.gameCardTitle}>{game.title}</h3>
              <p className={styles.gameCardDescription}>
                {game.shortDescription}
              </p>
              <span className={styles.gameCardCta}>挑戦する</span>
            </Link>
          ))}
        </div>
      </section>

      {/* セクション3: クイズ・診断 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>クイズ・診断</h2>
        <p className={styles.sectionDescription}>
          知識テストや性格診断であなたの実力や個性を発見しよう
        </p>
        <div className={styles.quizGrid}>
          {allQuizMetas.map((quiz) => (
            <Link
              key={quiz.slug}
              href={`/play/${quiz.slug}`}
              className={styles.quizCard}
              style={
                {
                  "--quiz-accent": quiz.accentColor,
                } as React.CSSProperties
              }
            >
              <span className={styles.quizCardIcon}>{quiz.icon}</span>
              <h3 className={styles.quizCardTitle}>{quiz.title}</h3>
              <p className={styles.quizCardDescription}>
                {quiz.shortDescription}
              </p>
              <span className={styles.quizCardCta}>挑戦する</span>
            </Link>
          ))}
        </div>
        <div className={styles.seeAll}>
          <Link href="/play" className={styles.seeAllLink}>
            全クイズを見る
          </Link>
        </div>
      </section>

      {/* セクション4: 最新ブログ記事 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>最新ブログ記事</h2>
        <div className={styles.blogList}>
          {recentPosts.map((post) => (
            // lgtm[js/stored-xss] - blog data from local markdown files, not user input
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={styles.blogCard}
            >
              <time className={styles.blogDate} dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
              <h3 className={styles.blogTitle}>{post.title}</h3>
              <p className={styles.blogExcerpt}>{post.description}</p>
            </Link>
          ))}
        </div>
        <div className={styles.seeAll}>
          <Link href="/blog" className={styles.seeAllLink}>
            もっと読む
          </Link>
        </div>
      </section>
    </div>
  );
}
