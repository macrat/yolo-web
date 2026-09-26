import type { GameMeta } from "@/play/games/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import ShareButtons from "@/components/ShareButtons";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import RecommendedContent from "@/play/_components/RecommendedContent";
import RelatedGames from "./RelatedGames";
import styles from "./GameLayout.module.css";

interface GameLayoutProps {
  meta: GameMeta;
  children: React.ReactNode;
  /** ゲーム固有の帰属表示（例: KANJIDIC2クレジット、辞典リンク） */
  attribution?: React.ReactNode;
}

/**
 * ゲームのページの共通の組み方。パンくず・ゲーム本体・FAQ・シェア・関連の一覧の順に並べる。
 *
 * h1 はゲーム本体（GameContainer）が持つので、header には置かない。
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
          { label: "遊び", href: "/play" },
          { label: meta.title },
        ]}
      />
      {meta.valueProposition && (
        <header className={styles.header}>
          <p className={styles.valueProposition}>{meta.valueProposition}</p>
        </header>
      )}
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
              {"→"}
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
          url={`/play/${meta.slug}`}
          title={meta.title}
          sns={["x", "line", "hatena", "copy"]}
          contentType="game"
          contentId={meta.slug}
        />
      </section>
      <RelatedGames
        currentSlug={meta.slug}
        relatedSlugs={meta.relatedGameSlugs}
      />
      <RecommendedContent currentSlug={meta.slug} />
      <RelatedBlogPosts toolSlug={meta.slug} />
    </article>
  );
}
