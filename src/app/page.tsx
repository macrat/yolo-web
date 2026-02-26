import Link from "next/link";
import { formatDate } from "@/lib/date";
import { getAllBlogPosts } from "@/lib/blog";
import { allToolMetas } from "@/tools/registry";
import { allQuizMetas } from "@/lib/quiz/registry";
import { allGameMetas } from "@/games/registry";
import styles from "./page.module.css";

const FEATURED_TOOL_SLUGS = [
  "char-count",
  "json-formatter",
  "password-generator",
  "age-calculator",
  "qr-code",
  "image-resizer",
] as const;

export default function Home() {
  const statBadges = [
    {
      label: `${allToolMetas.length} ツール`,
      icon: "\u{1F527}",
      href: "/tools",
    },
    {
      label: `${allGameMetas.length} デイリーパズル`,
      icon: "\u{1F3AE}",
      href: "/games",
    },
    {
      label: `${allQuizMetas.length} クイズ・診断`,
      icon: "\u{1F9E0}",
      href: "/quiz",
    },
    { label: "AI運営ブログ", icon: "\u{1F4DD}", href: "/blog" },
  ];
  const recentPosts = getAllBlogPosts().slice(0, 3);
  const featuredTools = FEATURED_TOOL_SLUGS.map((slug) =>
    allToolMetas.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className={styles.main}>
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
          {statBadges.map((badge) => (
            <Link key={badge.label} href={badge.href} className={styles.badge}>
              <span className={styles.badgeIcon}>{badge.icon}</span>
              {badge.label}
            </Link>
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
              href={`/quiz/${quiz.slug}`}
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
          <Link href="/quiz" className={styles.seeAllLink}>
            全クイズを見る
          </Link>
        </div>
      </section>

      {/* セクション4: 人気ツール */}
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
            全ツールを見る ({allToolMetas.length}+)
          </Link>
        </div>
      </section>

      {/* セクション5: 最新ブログ記事 */}
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
