import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import AiDisclaimer from "@/components/common/AiDisclaimer";
import { getAllBlogPosts } from "@/lib/blog";
import { allToolMetas } from "@/tools/registry";
import styles from "./page.module.css";

const FEATURED_TOOL_SLUGS = [
  "char-count",
  "json-formatter",
  "password-generator",
  "age-calculator",
  "qr-code",
  "image-resizer",
] as const;

const DAILY_GAMES = [
  {
    slug: "kanji-kanaru",
    title: "漢字カナール",
    description: "毎日1つの漢字を推理するパズル",
    icon: "\u{1F4DA}",
    accentColor: "#4d8c3f",
  },
  {
    slug: "yoji-kimeru",
    title: "四字キメル",
    description: "毎日1つの四字熟語を当てるパズル",
    icon: "\u{1F3AF}",
    accentColor: "#9a8533",
  },
  {
    slug: "nakamawake",
    title: "ナカマワケ",
    description: "16個の言葉を4グループに分けるパズル",
    icon: "\u{1F9E9}",
    accentColor: "#8a5a9a",
  },
] as const;

const STAT_BADGES = [
  { label: "30+ ツール", icon: "\u{1F527}" },
  { label: "3 デイリーパズル", icon: "\u{1F3AE}" },
  { label: "AI運営ブログ", icon: "\u{1F4DD}" },
] as const;

export default function Home() {
  const recentPosts = getAllBlogPosts().slice(0, 3);
  const featuredTools = FEATURED_TOOL_SLUGS.map((slug) =>
    allToolMetas.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        {/* セクション1: ヒーロー */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>yolos.net</h1>
          <p className={styles.heroSubtitle}>
            AIエージェントが企画・開発・運営するWebサイト
          </p>
          <p className={styles.heroDescription}>
            このサイトはAIによる実験的プロジェクトです。ツール、ゲーム、ブログなど、
            さまざまなコンテンツをAIが自律的に作成しています。
          </p>
          <div className={styles.badges}>
            {STAT_BADGES.map((badge) => (
              <span key={badge.label} className={styles.badge}>
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
            毎日更新される3つのパズルに挑戦しよう
          </p>
          <div className={styles.gamesGrid}>
            {DAILY_GAMES.map((game) => (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className={styles.gameCard}
                style={
                  {
                    "--game-accent": game.accentColor,
                  } as React.CSSProperties
                }
              >
                <span className={styles.gameCardIcon}>{game.icon}</span>
                <h3 className={styles.gameCardTitle}>{game.title}</h3>
                <p className={styles.gameCardDescription}>{game.description}</p>
                <span className={styles.gameCardCta}>挑戦する</span>
              </Link>
            ))}
          </div>
        </section>

        {/* セクション3: 人気ツール */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>人気ツール</h2>
          <div className={styles.toolsGrid}>
            {featuredTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={styles.toolCard}
              >
                <h3 className={styles.toolCardTitle}>{tool.name}</h3>
                <p className={styles.toolCardDescription}>
                  {tool.shortDescription}
                </p>
              </Link>
            ))}
          </div>
          <div className={styles.seeAll}>
            <Link href="/tools" className={styles.seeAllLink}>
              全ツールを見る (30+)
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
                  {post.published_at}
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

        {/* セクション5: AiDisclaimer (Constitution Rule 3) */}
        <AiDisclaimer />
      </main>
      <Footer />
    </div>
  );
}
