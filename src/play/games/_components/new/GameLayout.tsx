import type { GameMeta } from "@/play/games/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import PhrasedText from "@/components/PhrasedText";
import ShareButtons from "@/components/ShareButtons";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { GAME_TITLE_ID } from "@/play/games/shared/_lib/gameTitle";
import RelatedGames from "./RelatedGames";
import styles from "./GameLayout.module.css";

interface GameLayoutProps {
  meta: GameMeta;
  children: React.ReactNode;
  /** ゲーム固有の帰属表示（例: KANJIDIC2クレジット、辞典リンク） */
  attribution?: React.ReactNode;
}

/**
 * ゲームのページの共通の組み方。
 *
 * 遊び始めるのに要ること（何のゲームか・何を当てるか・盤の印の意味）を、読み込みを待たずに誰にも見えるよう
 * サーバーで描き、そのすぐ下にゲーム本体を置く。
 *   1. パンくず
 *   2. h1（ゲーム名）・要約・凡例
 *   3. ゲーム本体（各ゲームの GameContainer）
 *   4. 帰属表示・FAQ
 *   5. このゲームを人に勧めるページの共有。結果の共有は、ゲーム本体の結果のすぐ下にある
 *   6. 関連のゲーム・ほかの分類のおすすめ・関連の記事
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
          { label: meta.title, href: `/play/${meta.slug}` },
        ]}
      />
      <header className={styles.header}>
        {/* 自分で開いたダイアログを閉じたとき、ゲームの部品がフォーカスをここへ戻す。 */}
        <PhrasedText
          as="h1"
          id={GAME_TITLE_ID}
          tabIndex={-1}
          phrases={splitIntoPhrases(meta.title)}
          {...headingFontAttr(meta.title)}
        />
        <p className={styles.summary}>{meta.summary}</p>
        {meta.legend && (
          <ul className={styles.legend} aria-label={meta.legend.name}>
            {meta.legend.entries.map((entry) => (
              <li key={entry.meaning}>
                {entry.mark && (
                  <span className={styles.mark} aria-hidden="true">
                    {entry.mark}
                  </span>
                )}
                {entry.meaning}
              </li>
            ))}
          </ul>
        )}
      </header>
      <section aria-label="ゲーム">{children}</section>
      {attribution && (
        <footer className={styles.attribution}>{attribution}</footer>
      )}
      <FaqSection faq={meta.faq} />
      <section className={styles.shareSection}>
        <h2 className={styles.shareSectionTitle}>このゲームを勧める</h2>
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
      <RelatedBlogPosts slug={meta.slug} />
    </article>
  );
}
