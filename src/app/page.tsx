import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/date";
import { getAllBlogPosts } from "@/blog/_lib/blog";
import {
  allPlayContents,
  DAILY_UPDATE_SLUGS,
  getFeaturedContents,
  getDiagnosisContents,
  quizQuestionCountBySlug,
  getPlayContentsByCategory,
} from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { getContrastTextColor } from "@/play/color-utils";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import FortunePreview from "./_components/FortunePreview";
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
  const featuredContents = getFeaturedContents();
  /** デイリーパズルセクション: game カテゴリの全コンテンツ */
  const gameContents = getPlayContentsByCategory("game");
  /** 「もっと診断してみよう」セクション: 厳選6件 */
  const diagnosisContents = getDiagnosisContents();

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
          笑えて、シェアせずにいられない占い・診断があなたを待っている
        </p>

        {/* AI運営の透明性（constitution.md Rule 3） */}
        <p className={styles.heroAiNotice}>
          AIが企画・運営する占い・診断の実験サイトです
        </p>

        {/* メインCTA */}
        <Link href="/play" className={styles.heroCta}>
          占い・診断を試す
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

      {/* セクション2: まずはここから — 各カテゴリ代表コンテンツ4件を初回訪問者向けに表示 */}
      <section
        className={styles.featuredSection}
        data-testid="home-featured-section"
        aria-labelledby="home-featured-heading"
      >
        <h2 id="home-featured-heading" className={styles.sectionTitle}>
          まずはここから
        </h2>
        <p className={styles.sectionDescription}>
          占い・診断・クイズ・ゲームの代表作を体験しよう
        </p>
        <ul
          className={styles.featuredGrid}
          role="list"
          aria-label="おすすめコンテンツ"
        >
          {featuredContents.map((content) => (
            <li key={content.slug}>
              <Link
                href={getContentPath(content)}
                className={styles.featuredCard}
                style={
                  {
                    "--play-accent": content.accentColor,
                    "--play-cta-text": getContrastTextColor(
                      content.accentColor,
                    ),
                  } as React.CSSProperties
                }
              >
                <div className={styles.featuredCardIconWrapper}>
                  <div className={styles.featuredCardIcon}>{content.icon}</div>
                </div>
                <div className={styles.featuredCardTitleRow}>
                  <h3 className={styles.featuredCardTitle}>{content.title}</h3>
                  {DAILY_UPDATE_SLUGS.has(content.slug) && (
                    <span className={styles.dailyBadge}>毎日更新</span>
                  )}
                </div>
                <p className={styles.featuredCardDescription}>
                  {content.shortDescription}
                </p>
                <div className={styles.featuredCardMeta}>
                  {quizQuestionCountBySlug.get(content.slug) !== undefined && (
                    <span className={styles.featuredCardQuestionCount}>
                      {quizQuestionCountBySlug.get(content.slug)}問
                    </span>
                  )}
                  <span className={styles.featuredCardCta}>遊ぶ</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.seeAll}>
          <Link href="/play" className={styles.seeAllLink}>
            全コンテンツを見る
          </Link>
        </div>
      </section>

      {/* セクション3: 今日のユーモア運勢プレビュー — /play/daily への導線 */}
      <FortunePreview />

      {/* セクション4: もっと診断してみよう（厳選6件） — fortune/featured を除いた診断コンテンツ */}
      <section
        className={styles.featuredSection}
        data-testid="home-diagnosis-section"
        aria-labelledby="home-diagnosis-heading"
      >
        <h2 id="home-diagnosis-heading" className={styles.sectionTitle}>
          もっと診断してみよう
        </h2>
        <p className={styles.sectionDescription}>
          性格診断・知識テストで自分の新たな一面を発見しよう
        </p>
        <ul
          className={styles.featuredGrid}
          role="list"
          aria-label="診断コンテンツ一覧"
        >
          {diagnosisContents.map((content) => (
            <li key={content.slug}>
              <Link
                href={getContentPath(content)}
                className={styles.featuredCard}
                style={
                  {
                    "--play-accent": content.accentColor,
                    "--play-cta-text": getContrastTextColor(
                      content.accentColor,
                    ),
                  } as React.CSSProperties
                }
              >
                <div className={styles.featuredCardIconWrapper}>
                  <div className={styles.featuredCardIcon}>{content.icon}</div>
                </div>
                <div className={styles.featuredCardTitleRow}>
                  <h3 className={styles.featuredCardTitle}>{content.title}</h3>
                </div>
                <p className={styles.featuredCardDescription}>
                  {content.shortDescription}
                </p>
                <div className={styles.featuredCardMeta}>
                  {quizQuestionCountBySlug.get(content.slug) !== undefined && (
                    <span className={styles.featuredCardQuestionCount}>
                      {quizQuestionCountBySlug.get(content.slug)}問
                    </span>
                  )}
                  <span className={styles.featuredCardCta}>診断する</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.seeAll}>
          <Link href="/play" className={styles.seeAllLink}>
            もっと見る
          </Link>
        </div>
      </section>

      {/* セクション5: 今日のデイリーパズル */}
      <section
        className={styles.section}
        data-testid="home-daily-puzzle-section"
        aria-labelledby="home-daily-puzzle-heading"
      >
        <h2 id="home-daily-puzzle-heading" className={styles.sectionTitle}>
          今日のデイリーパズル
        </h2>
        <p className={styles.sectionDescription}>
          毎日更新される{gameContents.length}つのパズルに挑戦しよう
        </p>
        <ul
          className={styles.featuredGrid}
          role="list"
          aria-label="デイリーパズル一覧"
        >
          {gameContents.map((game) => (
            <li key={game.slug}>
              <Link
                href={getContentPath(game)}
                className={styles.featuredCard}
                style={
                  {
                    "--play-accent": game.accentColor,
                    "--play-cta-text": getContrastTextColor(game.accentColor),
                  } as React.CSSProperties
                }
              >
                <div className={styles.featuredCardIconWrapper}>
                  <div className={styles.featuredCardIcon}>{game.icon}</div>
                </div>
                <div className={styles.featuredCardTitleRow}>
                  <h3 className={styles.featuredCardTitle}>{game.title}</h3>
                  {DAILY_UPDATE_SLUGS.has(game.slug) && (
                    <span className={styles.dailyBadge}>毎日更新</span>
                  )}
                </div>
                <p className={styles.featuredCardDescription}>
                  {game.shortDescription}
                </p>
                <div className={styles.featuredCardMeta}>
                  <span className={styles.featuredCardCta}>挑戦する</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.seeAll}>
          <Link href="/play" className={styles.seeAllLink}>
            /play でもっと遊ぶ
          </Link>
        </div>
      </section>

      {/* セクション6: 最新ブログ記事 */}
      <section className={styles.section} aria-labelledby="home-blog-heading">
        <h2 id="home-blog-heading" className={styles.sectionTitle}>
          最新ブログ記事
        </h2>
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

      {/* セクション7: その他のコンテンツへの導線 — ツールセクション削除後もトップページから回遊できるよう控えめなリンクを配置 */}
      <nav
        className={styles.otherContentsNav}
        data-testid="home-other-contents-nav"
        aria-label="その他のコンテンツ"
      >
        <Link href="/tools" className={styles.otherContentsLink}>
          ツール一覧
        </Link>
        <Link href="/achievements" className={styles.otherContentsLink}>
          実績・ダッシュボード
        </Link>
      </nav>
    </div>
  );
}
