import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/date";
import { getAllBlogPosts } from "@/blog/_lib/blog";
import {
  allPlayContents,
  DAILY_UPDATE_SLUGS,
  getHeroPickupContents,
  getDefaultTabContents,
  getNonFortuneContents,
  quizQuestionCountBySlug,
} from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import FortunePreview from "@/play/fortune/_components/FortunePreview";
import PlayContentTabs from "@/play/_components/PlayContentTabs";
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
  const featuredContents = getHeroPickupContents();

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
          AIが企画・運営する実験的なサイトです
        </p>

        {/* メインCTA */}
        <Link href="/play" className={styles.heroCta}>
          占い・診断を試す
        </Link>

        {/* ヒーロー内おすすめコンテンツ: CTAボタン直下に3件のアイコン+タイトルをコンパクト表示 */}
        <ul
          className={styles.heroFeaturedList}
          role="list"
          aria-label="ピックアップコンテンツ"
        >
          {featuredContents.map((content) => (
            <li key={content.slug}>
              <Link
                href={getContentPath(content)}
                className={styles.heroFeaturedItem}
              >
                <span className={styles.heroFeaturedIcon} aria-hidden="true">
                  {content.icon}
                </span>
                <span className={styles.heroFeaturedTitle}>
                  {content.shortTitle ?? content.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 統計・特徴バッジ群（すべて静的span: クリック可能なCTAは上のheroCta） */}
        <div className={styles.badges}>
          <span className={styles.badgeStatic}>
            <span className={styles.badgeIcon}>🎮</span>
            {allPlayContents.length}種の占い・診断・ゲーム
          </span>
          {HERO_BADGES.map((badge) => (
            <span key={badge.label} className={styles.badgeStatic}>
              <span className={styles.badgeIcon}>{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>
      </section>

      {/* セクション2: おすすめ — カテゴリ別タブで全コンテンツを閲覧可能 */}
      <section
        className={styles.section}
        data-testid="home-recommended-section"
        aria-labelledby="home-recommended-heading"
      >
        <h2 id="home-recommended-heading" className={styles.sectionTitle}>
          おすすめ
        </h2>
        <p className={styles.sectionDescription}>
          カテゴリ別にコンテンツを探せます
        </p>
        <PlayContentTabs
          allContents={getNonFortuneContents()}
          defaultContents={getDefaultTabContents()}
          questionCountBySlug={quizQuestionCountBySlug}
          dailyUpdateSlugs={DAILY_UPDATE_SLUGS}
        />
        <div className={styles.seeAll}>
          <Link href="/play" className={styles.seeAllLink}>
            全コンテンツを見る
          </Link>
        </div>
      </section>

      {/* セクション3: 今日のユーモア運勢プレビュー — /play/daily への導線 */}
      <FortunePreview />

      {/* セクション4: 最新ブログ記事 */}
      <section className={styles.section} aria-labelledby="home-blog-heading">
        <h2 id="home-blog-heading" className={styles.sectionTitle}>
          開発の舞台裏
        </h2>
        <p className={styles.sectionDescription}>
          AIエージェントの開発記録や実験の裏側をお届けします
        </p>
        <div className={styles.blogList}>
          {recentPosts.map((post) => (
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
