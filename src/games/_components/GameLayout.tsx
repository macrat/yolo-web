import type { GameMeta } from "@/games/types";
import Breadcrumb from "@/components/common/Breadcrumb";
import FaqSection from "@/components/common/FaqSection";
import ShareButtons from "@/components/common/ShareButtons";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import RelatedGames from "./RelatedGames";
import RelatedBlogPosts from "./RelatedBlogPosts";
import styles from "./GameLayout.module.css";

interface GameLayoutProps {
  meta: GameMeta;
  children: React.ReactNode;
  /** ゲーム固有の帰属表示（例: KANJIDIC2クレジット、辞典リンク） */
  attribution?: React.ReactNode;
}

/**
 * ゲームページ共通レイアウト。
 * ToolLayout / CheatsheetLayout と同じ品質要素パターンを踏襲しつつ、
 * ゲーム特有の要件（h1なし、max-width: 600px、attribution）に対応する。
 *
 * h1はGameContainer内部で表示されるため、重複を避けてheaderには含めない。
 */
export default function GameLayout({
  meta,
  children,
  attribution,
}: GameLayoutProps) {
  return (
    <article className={styles.layout}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "ゲーム", href: "/games" },
          { label: meta.title },
        ]}
      />
      <header className={styles.header}>
        <TrustLevelBadge level={meta.trustLevel} note={meta.trustNote} />
        {meta.valueProposition && (
          <p className={styles.valueProposition}>{meta.valueProposition}</p>
        )}
      </header>
      {meta.usageExample && (
        <div className={styles.usageExample}>
          <p className={styles.usageExampleHeading}>こんなゲームです</p>
          <div className={styles.usageExampleContent}>
            <div className={styles.usageExampleBox}>
              <span className={styles.usageExampleLabel}>遊び方</span>
              <span className={styles.usageExampleText}>
                {meta.usageExample.input}
              </span>
            </div>
            <span className={styles.usageExampleArrow} aria-hidden="true">
              {"\u2192"}
            </span>
            <div className={styles.usageExampleBox}>
              <span className={styles.usageExampleLabel}>体験</span>
              <span className={styles.usageExampleText}>
                {meta.usageExample.output}
              </span>
            </div>
          </div>
          {meta.usageExample.description && (
            <p className={styles.usageExampleDescription}>
              {meta.usageExample.description}
            </p>
          )}
        </div>
      )}
      <section className={styles.content} aria-label="Game">
        {children}
      </section>
      {attribution && (
        <footer className={styles.attribution}>{attribution}</footer>
      )}
      <FaqSection faq={meta.faq} />
      <section className={styles.shareSection}>
        <h2 className={styles.shareSectionTitle}>
          このゲームが楽しかったらシェア
        </h2>
        <ShareButtons
          url={`/games/${meta.slug}`}
          title={meta.title}
          sns={["x", "line", "hatena", "copy"]}
        />
      </section>
      <RelatedGames
        currentSlug={meta.slug}
        relatedSlugs={meta.relatedGameSlugs}
      />
      <RelatedBlogPosts gameSlug={meta.slug} />
    </article>
  );
}
