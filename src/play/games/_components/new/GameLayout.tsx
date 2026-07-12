import type { GameMeta } from "@/play/games/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import ShareButtons from "@/components/ShareButtons";
import RecommendedContent from "@/play/_components/RecommendedContent";
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
 * ゲームページ共通レイアウト（(new) デザイン体系版・cycle-268 フォーク）。
 *
 * 全4ゲーム（kanji-kanaru・nakamawake・irodori・yoji-kimeru）が本コンポーネントを
 * 使用する（cycle-279 C1 で irodori/yoji-kimeru も legacy 版から移行完了・
 * legacy `../GameLayout` は削除済み）。
 *
 * legacy からの主な差分（歴史的経緯）:
 * - Breadcrumb/FaqSection/ShareButtons を (new) `@/components/*` 版に差替。
 * - TrustLevelBadge を撤去（cycle-279 C1 で trustLevel フィールド自体も型・データ・
 *   コンポーネントごと一括削除済み・B-432 完了）。
 * - RecommendedContent / RelatedContentCard.module.css（本コンポーネント配下の
 *   RelatedGames が使用）は新トークンへ変換済み（cycle-278 C1/C4。RelatedQuizzes は
 *   別ファイル RelatedQuizzes.module.css を持ち非共有）。
 *
 * h1 は GameContainer 内部で表示されるため、重複を避けて header には含めない。
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
          { label: "遊ぶ", href: "/play" },
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
      <RelatedBlogPosts gameSlug={meta.slug} />
    </article>
  );
}
