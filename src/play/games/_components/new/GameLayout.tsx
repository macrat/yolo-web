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
 * legacy `../GameLayout` を (new) austere デザインへ質的に入れ替えたフォーク。
 * 未移行ゲーム（irodori/nakamawake/yoji-kimeru）は legacy 版を使い続けるため、
 * 構造変更（角丸・影撤去・左寄せ統一・TrustLevelBadge 撤去）が波及しない。
 *
 * legacy からの主な差分:
 * - Breadcrumb/FaqSection/ShareButtons を (new) `@/components/*` 版に差替。
 * - TrustLevelBadge を撤去（(new) 版が存在しない。AI 注記は Footer/about が担保）。
 *   `meta.trustLevel`/`trustNote` フィールドは B-432 一括削除の責務のため触らない。
 * - RecommendedContent / RelatedContentCard.module.css（RelatedGames 経由）は
 *   既に (new) トークンで移行済みクイズ面が共有中のためフォークせず従来パスで参照する。
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
